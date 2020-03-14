const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const util = require('util');

let accountInfo;
const homeURL = "https://everytime.kr";
const urlBundle = {
    login: homeURL + "/login",
    authenticate: homeURL + "/user/login",
    timetable: homeURL + "/timetable",
    accountInfo: "json/account.json",
};

const responseURL = {
    currentSemesterResponse: "https://api.everytime.kr/find/timetable/table/list/semester",
    tableResponse: "https://api.everytime.kr/find/timetable/table",
    SemesterListResponse: "https://api.everytime.kr/find/timetable/subject/semester/list",
}

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
};

exports.get_data = async function(){
    const browser = await puppeteer.launch({
        headless: true,
    });
    console.log("Chromium Browser launched.");
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    await getUserAccountInfoFromFileStream();

    await page.goto(urlBundle.login);
    await page.evaluate((id, pw) => {
        document.querySelector('input[name="userid"]').value = id;
        document.querySelector('input[name="password"]').value = pw;
    }, accountInfo.id, accountInfo.pw);

    await page.click('input[value="로그인"]');
    console.log("Logged into Everytime.kr");

    let response = await page.goto(responseURL.SemesterListResponse);
    let body = await response.text();
    console.log("Fetched Semester List.");
    
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
            };
            break;
        }
    }

    if(currentSemester == null){
        console.log("Currently not on semester.");
        return null;
    }else{
        console.log("Semester Found: "+currentSemester.year+", "+currentSemester.semester);

        response = await page.goto(responseURL.currentSemesterResponse+"?year="+currentSemester.year+"&semester="+currentSemester.semester);
        let body = await response.text();
        $ = cheerio.load(body);
        const $semester = $('table');
        const info = cheerio($semester[0]);
        let semesterID = info.attr('id');
        console.log("Fetched Current Semester Info, semester id: "+semesterID);

        let classInfoBundle = [];

        response = await page.goto(responseURL.tableResponse+"?id="+semesterID);
        body = await response.text();
        $ = cheerio.load(body);
        const subjects = $('subject');
        console.log(subjects.length+" Subjects Found.");
        for(let i=0;i<subjects.length; i++){
            const subject = cheerio(subjects[i]);
            let id = subject.attr('id');
            let name = subject.find('name').attr('value');
            let code = subject.find('internal').attr('value');
            let pfname = subject.find('professor').attr('value');

            let classInfo = new Subject(name, pfname, id, code);

            const timeInfos = subject.find('data');
            for(let j=0;j<timeInfos.length;j++){
                const timeInfo = cheerio(timeInfos[j]);
                let day = timeInfo.attr('day');
                let starttime = timeInfo.attr('starttime');
                let endtime = timeInfo.attr('endtime');
                let place = timeInfo.attr('place');

                let timeInterval = new SubjectTimeInterval(day, starttime, endtime, place);
                classInfo.addTimeInterval(timeInterval);
            }

            classInfoBundle.push(classInfo);
        }

        return classInfoBundle;
    }
};


function getCurrentDate(){
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth()+1;
    const day = now.getDate();
    const dateString = year+"-"+pad(month, 2)+"-"+pad(day, 2);
    console.log("Current Date: "+dateString);

    return now.getTime();
}

function pad(stri, len){
    let str = stri+"";
    while(str.length < len) str = "0"+str;
    return str;
}

let getUserAccountInfoFromFileStream = () => {
    const filePath = path.join(__dirname, '../static/json/account.json');
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
            if(!err){
                accountInfo = JSON.parse(data);
                console.log("Local Account Info accepted.");
            }else{
                console.log(err);
            }
            resolve();
        });
    });
};