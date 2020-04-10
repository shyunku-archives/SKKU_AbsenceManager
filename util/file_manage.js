const fs = require('fs');

/* -------------------- save -------------------- */
exports.save_icampus_account_info = (data) => {
    const json_str = JSON.stringify(data, null, 4);
    writeJson("account-icampus.json", json_str, "iCampus Account data saved.");
};

exports.save_icampus_courses_info = (data) => {
    const json_str = JSON.stringify(data, null, 4);
    writeJson("courses.json", json_str, "iCampus Courses data saved.");
};

exports.save_everytime_account_info = (data) => {
    const json_str = JSON.stringify(data, null, 4);
    writeJson("account-everytime.json", json_str, "Everytime Account data saved.");
};

exports.save_timetable_info = (data) => {
    let class_date = null;
    const start_date = new Date(data.openDate);
    const end_date = new Date(data.closeDate);

    for(let i=0;i<data.table.length;i++){
        class_date = [];
        const classTable = data.table[i];

        for(let j=0, brk = false;; j++){
            for(let k=0;k<classTable.timeIntervals.length;k++){
                let day_addition = parseInt(classTable.timeIntervals[k].day) + 7*j;
                let added_date = start_date.addDay(day_addition);
                if(added_date.getTime() > end_date.getTime()){
                    brk = true;
                    break;
                }
                class_date.push({
                    date: getShortDateString(added_date),
                    attend_check: "none",
                    attendance: "none",
                });
            }
            if(brk)break;
        }
        data.table[i].date_info = {
            class_times: classTable.timeIntervals.length,
            class_date: class_date,
        };
    }
    const json_str = JSON.stringify(data, null, 4);
    writeJson("timetable.json", json_str, "Timetable Data overwritten.");
};


/* -------------------- fetch -------------------- */

exports.fetch_local_table_info = (callback) => {
    readJson("timetable.json", (res) => {
        const table = res.table;
        const table_id = res.id;
        const new_table = [];
        for(let i=table.length-1;i>=0;i--){
            let class_info = table[i];
            for(let j=0;j<class_info.timeIntervals.length;j++){
                let single_interval = cloneJson(class_info);
                delete single_interval.timeIntervals;
                single_interval.timeInterval = class_info.timeIntervals[j];
                new_table.push(single_interval);
            }
        }

        new_table.sort((a,b) => {
            let aX = int(a.timeInterval.day * 24 * 12) + int(a.timeInterval.start);
            let bX = int(b.timeInterval.day * 24 * 12) + int(b.timeInterval.start);
            return aX>bX?1:(bX>aX?-1:0);
        });

        callback({
            table: new_table,
            tableId: table_id,
        });
    });
}

exports.fetch_single_subject = (tid, sid, callback) => {
    readJson("account-everytime.json", (res) => {
        if(res.timetable_id == tid){
            readJson("timetable.json", (dat) => {
                for(let i=0;i<dat.table.length;i++){
                    if(dat.table[i].id == sid){
                        callback(1000, dat.table[i]);
                        return;
                    }
                }
                callback(1005);
            });
        }else
            callback(1004);
    });
}

exports.fetch_icampus_account_info = (callback) => {
    readJson("account-icampus.json", (res) => {
        callback(res);
    });
}

exports.fetch_icampus_course_info = (callback) => {
    readJson("courses.json", (res) => {
        callback(res);
    });
}

/* -------------------- user function -------------------- */

function writeJson(filename, data, success_msg){
    fs.writeFile("./static/json/"+filename, data, 'utf8', function(err){
        if(err) throw err;
        console.log(success_msg);
    });
}

function readJson(filename, callback){
    fs.readFile("./static/json/"+filename, 'utf8', function(err, data){
        if(err) throw err;
        callback(JSON.parse(data));
    });
}

function getShortDateString(date){
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    const dateString = month+"/"+day;

    return dateString;
}

function getDateString(date){
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    const dateString = year+"-"+pad(month, 2)+"-"+pad(day, 2);

    return dateString;
}

Date.prototype.addDay = function(days){
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);

    return date;
}

function pad(stri, len){
    let str = stri+"";
    while(str.length < len) str = "0"+str;
    return str;
}

function cloneJson(obj){
    return JSON.parse(JSON.stringify(obj));
}

function int(str){
    return parseInt(str);
}