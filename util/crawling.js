const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const util = require('util');

const everytimeHomeURL = "https://everytime.kr";
const icampusHomeURL = "https://icampus.skku.edu/";
const everytimeUrlBundle = {
    login: everytimeHomeURL + "/login",
    currentSemesterResponse: "https://api.everytime.kr/find/timetable/table/list/semester",
    tableResponse: "https://api.everytime.kr/find/timetable/table",
    SemesterListResponse: "https://api.everytime.kr/find/timetable/subject/semester/list",
};
const icampusUrlBundle = {
    login: icampusHomeURL + "/login",
    dashboard: icampusHomeURL + "/lms",
    courseList: "https://canvas.skku.edu/api/v1/users/self/favorites/courses?include[]=term&exclude[]=enrollments",
};

const SubjectTimeInterval = class{
    constructor(day, starttime, endtime, place){
        this.day = day;
        this.start = starttime;
        this.end = endtime;
        this.place = place;
    }
};

const Subject = class{
    constructor(name, pf, id, code){
        this.name = name;
        this.professorName = pf;
        this.id = id;
        this.code = code;
        this.timeIntervals = [];
    }

    addTimeInterval(data){
        this.timeIntervals.push(data);
    }

    get timeIntervalOffset(){
        return this.timeIntervals.day * 86400 + this.timeIntervals.endtime * 5 * 60;
    }
};

/* ----------------- Declaration ----------------- */
let icampusPage = null;

exports.get_timetable_list_data = async function(verify_id, verify_pw){
    const browser = await puppeteer.launch({
        headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    page.on('dialog', async(dialog) => {
        const message = dialog.message();
        if(message == "아이디나 비밀번호를 바르게 입력해주세요."){
            console.log("Incorrect id/pw");
            dialog.accept();
        }
    });

    await page.goto(everytimeUrlBundle.login);
    await page.evaluate((id, pw) => {
        document.querySelector('input[name="userid"]').value = id;
        document.querySelector('input[name="password"]').value = pw;
    }, verify_id, verify_pw);

    await page.click('input[value="로그인"]');

    let response = await page.goto(everytimeUrlBundle.SemesterListResponse);
    let body = await response.text();

    if(body == "A server error occurred and the content cannot be displayed."){
        return {code: 1001};
    }
    
    let $ = cheerio.load(body);
    const $semesterList = $('semester');

    let curTime = getCurrentDate();
    let currentSemester = null;

    for(let i=0; i<$semesterList.length; i++){
        const elem = cheerio($semesterList[i]);
        let semesterStartDateString = elem.attr('start_date');
        let semesterEndDateString = elem.attr('end_date');
        let startDate = new Date(semesterStartDateString);
        let endDate = new Date(semesterEndDateString);
        let startDateValue = startDate.getTime();
        let endDateValue = endDate.getTime()+86400000;
        if(curTime>=startDateValue&&curTime<=endDateValue){
            currentSemester = {
                year: elem.attr('year'),
                semester: elem.attr('semester'),
                start_date: elem.attr('start_date'),
                end_date: elem.attr('end_date'),
            };
            break;
        }
    }

    if(currentSemester == null){
        return {code: 1003};
    }else{
        response = await page.goto(everytimeUrlBundle.currentSemesterResponse+"?year="+currentSemester.year+"&semester="+currentSemester.semester);
        let body = await response.text();
        $ = cheerio.load(body);
        const $tables = $('table');
        const tableData = [];

        for(let i=0;i<$tables.length;i++){
            const table = cheerio($tables[i]);
            let tableID = table.attr('id');

            let classInfoBundle = [];

            response = await page.goto(everytimeUrlBundle.tableResponse+"?id="+tableID);
            body = await response.text();
            $ = cheerio.load(body);
            const subjects = $('subject');

            for(let j=0;j<subjects.length; j++){
                const subject = cheerio(subjects[j]);
                let id = subject.attr('id');
                let name = subject.find('name').attr('value');
                let code = subject.find('internal').attr('value');
                let pfname = subject.find('professor').attr('value');

                const classInfo = new Subject(name, pfname, id, code);
                const individualClassInfo = Object.assign(Object.create(Object.getPrototypeOf(classInfo)), classInfo);

                const timeInfos = subject.find('data');
                for(let k=0;k<timeInfos.length;k++){
                    const timeInfo = cheerio(timeInfos[k]);
                    let day = Number(timeInfo.attr('day'));
                    let starttime = Number(timeInfo.attr('starttime'));
                    let endtime = Number(timeInfo.attr('endtime'));
                    let place = timeInfo.attr('place');

                    let timeInterval = new SubjectTimeInterval(day, starttime, endtime, place);

                    
                    individualClassInfo.addTimeInterval(timeInterval);
                }
                classInfoBundle.push(individualClassInfo);
            }

            classInfoBundle.sort((a,b) => {
                let aX = a.timeIntervals.day * 24 * 12 + a.timeIntervals.start;
                let bX = b.timeIntervals.day * 24 * 12 + b.timeIntervals.start;
                return aX>bX?1:(bX>aX?-1:0);
            });

            tableData.push({
                id: tableID,
                name: table.attr('name'),
                create_date: table.attr('created_at'),
                update_date: table.attr('updated_at'),
                tableSchedule: classInfoBundle,
            });
        }

        if(tableData.length == 0) return {code: 1002}
        return {
            code: 1000,
            semesterData: currentSemester,
            tableData: tableData,
        }
    }
}

exports.authen_icampus_account = async function(verify_id, verify_pw, callback){
    const browser = await puppeteer.launch({
        headless: true,
    });

    icampusPage = await browser.newPage();
    await icampusPage.setViewport({
        width: 1920,
        height: 1080
    });

    icampusPage.on('dialog', async(dialog) => {
        const message = dialog.message();
        if(message.includes("사용자 인증에 실패하였습니다.")){
            dialog.accept();
            callback({code: 1006});
        }
    });

    await icampusPage.goto(icampusUrlBundle.login);
    await icampusPage.evaluate((id, pw) => {
        document.querySelector('input[name="login_user_id"]').value = id;
        document.querySelector('input[name="login_user_password"]').value = pw;
    }, verify_id, verify_pw);
    await icampusPage.click('button[id="btnLoginBtn"]');

    await icampusPage.waitForNavigation();

    let response = await icampusPage.goto(icampusUrlBundle.courseList);
    let text = await response.text();
    let refined = text.indexOf('[');
    let extracted = text.substring(refined);

    callback({
        code: 1000,
        courseInfo: JSON.parse(extracted),
    });
}

function getCurrentDate(){
    const now = new Date();

    return now.getTime();
}

function pad(stri, len){
    let str = stri+"";
    while(str.length < len) str = "0"+str;
    return str;
}