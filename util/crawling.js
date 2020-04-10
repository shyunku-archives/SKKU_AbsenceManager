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
    getStudentID:{
        seg0: "https://canvas.skku.edu/courses/",   // + course id
        seg1: "/external_tools/1",
    },
    getCourseInfo:{
        seg0: "https://canvas.skku.edu/learningx/api/v1/courses/",  // + course id
        seg1: "/allcomponents_db?user_id=",                         // + user id
        seg2: "&user_login=",                                       // + user student id
        seg3: "&role=1",
    }
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
    let courseList = JSON.parse(extracted)
    let studentID = "unknown";
    let studentName = "unknown";
    let userID = "unknown";         //unique 한지 check 필요

    if(extracted.length > 0){
        let anyCourse = courseList[0].id;
        response = await icampusPage.goto(icampusUrlBundle.getStudentID.seg0+anyCourse+icampusUrlBundle.getStudentID.seg1);
        const resbody = await response.text();
        const $ = cheerio.load(resbody);
        studentID = $('#custom_canvas_user_login_id').attr('value');
        let rawStudentName = $('#custom_user_name_full').attr('value');
        studentName = getPreText(rawStudentName, '(');
        userID = $('#custom_user_id').attr('value');
    }else{
        console.log("Couldn't fetch Student Id/Name because course list is empty.");
    }

    callback({
        code: 1000,
        courseInfo: courseList,
        studentID: studentID,
        studentName: studentName,
        userID: userID,
    });
}

exports.get_icampus_mirror_main_databundle = async function(section, studentInfo, courseList, callback){
    //session expired test
    try{
        await icampusPage.goto(icampusHomeURL);
    }catch(err){
        console.log("iCampus Page session is expired, Log in.");
        await login_icampus_account(studentInfo.id, studentInfo.pw);
    }

    let fetchData = [];

    switch(section){
        case "courses":
            //fetch uncompleted courses list
            //탭 복제 후 async - promise로 시도해볼 것
            console.log("course found: "+courseList.length);
            for(let i=0;i<courseList.length;i++){
                let requestURL = `https://canvas.skku.edu/courses/${courseList[i].id}/external_tools/1`;
                await icampusPage.goto(requestURL);  
                await icampusPage.waitFor(500);              
                let innerFrameContent = await icampusPage.evaluate(() => {
                    let content = document.querySelector('#tool_content')
                        .contentDocument.documentElement.innerHTML;
                    return content;
                });
                let body = innerFrameContent;
                let $ = cheerio.load(body);
                let courseSections = $('.xncl-section-container .xn-section');                                      //각 수업 당 sections
                let sectionList = [];
                for(let j=0;j<courseSections.length;j++){
                    const section = $(courseSections[j]);
                    let subSections = section.find('.xns-subsection-container .xn-subsection-learn');               //각 섹션 당 차시들
                    let subsectionStartDateElem = section.find('.xnslh-section-opendate-date');
                    let subsectionStartDateStr = subsectionStartDateElem.text();
                    let subsectionStartDate = parseDateString(subsectionStartDateStr);
                    let subsectionList = [];
                    for(let k=0;k<subSections.length;k++){
                        const subsection = $(subSections[k]);
                        let courses = subsection.find('.xnsl-components-container .xn-component-item-container');   //각 차시 당 courses
                        let courseList = [];
                        for(let l=0;l<courses.length;l++){
                            const course = $(courses[l]);
                            let itemTypeElem = course.find('.xnci-description-component-type').first();
                            let itemType = itemTypeElem.text();

                            if(itemType == "MEDIA"){
                                let courseNameElem = course.find('.xnci-component-title').first();
                                let isCompletedElem = course.find('.xnci-attendance-status').first();
                                let deadLineDateStrElem = course.find('.xnci-date-container .top-value').first();
                                let videoDurationElem = course.find('.xnci-video-duration').first();
                                
                                let courseName = courseNameElem.text();
                                let isCompleted = isCompletedElem.text();
                                let deadLineDateStr = deadLineDateStrElem.text();
                                let deadLineDate = parseDateString(deadLineDateStr);
                                let videoDuration = videoDurationElem.text();
                            
                                console.log(courseList);
                                courseList.push({
                                    name: courseName,
                                    status: isCompleted,
                                    deadLineDate: deadLineDate,
                                    videoDuration: videoDuration,
                                });
                            }
                        }
                        subsectionList.push({
                            indexStr: `${k+1}차시`,
                            courses: courseList,
                        });
                    }
                    sectionList.push({
                        startDate: subsectionStartDate,   //0 나오는 오류 고칠것
                        subsections: subsectionList,
                    });
                }

                console.log("fetched subject_"+(i+1));
                fetchData.push({
                    subjectName: courseList[i].name,
                    sections: sectionList,
                });
            }
            callback(fetchData);
            break;
        case "assignments":
            //fetch uncompleted assignments list
            break;
        case "Announcements":
            //fetch uncompleted assignments list
            break;
    }
    
}

/* -------------------- Internal function -------------------- */
async function login_icampus_account(id, pw){
    //page null test
    if(icampusPage == null){
        console.log("iCampus Page is null, Generate new one");
        await generate_icampus_page();
    }

    icampusPage.on('dialog', async(dialog) => {
        const message = dialog.message();
        if(message.includes("사용자 인증에 실패하였습니다.")){
            throw Error("Fatal Error!");
        }
    });

    try{
        await icampusPage.goto(icampusUrlBundle.login);
    }catch(err){
        console.log("Session closed!");
        await generate_icampus_page();
        await icampusPage.goto(icampusUrlBundle.login);
    }

    await icampusPage.evaluate((id, pw) => {
        document.querySelector('input[name="login_user_id"]').value = id;
        document.querySelector('input[name="login_user_password"]').value = pw;
    }, id, pw);
    await icampusPage.click('button[id="btnLoginBtn"]');

    await icampusPage.waitForNavigation();
}

async function generate_icampus_page(){
    const browser = await puppeteer.launch({
        headless: true,
    });
    icampusPage = await browser.newPage();
    await icampusPage.setViewport({
        width: 1920,
        height: 1080
    });
}

/* -------------------- User function -------------------- */
function parseDateString(str){
    //4월 5일 오후 12:23
    try{
        let now = new Date();    
        let seg = str.split(' ');
        let mon = seg[0].replace('월', '');
        let day = seg[1].replace('일', '');
        let noonSpt = seg[2]=="오후";
        let timeSeg = seg[3].split(':');
        let hour = parseInt(timeSeg[0]);
        hour = hour == 12 ? 0 : hour;
        if(noonSpt) hour += 12;
        let min = parseInt(timeSeg[1]);
        let selectedDate = new Date(`${now.getFullYear()}-${mon}-${day} ${hour}:${min}`);
        return selectedDate.getTime();
    }catch(err){
        console.log(err);
        return 0;
    }
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

function getPreText(str, c){
    const seq = str.split(c);
    return seq[0];
}