function convertRawJson(str){
    let cleanStr = replaceAll(str, '&#34;', '\"');
    return JSON.parse(cleanStr);
}

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

function parseDate(str){
    const regex = new RegExp("-");
    const seg = str.split(regex);

    return {
        y: parseInt(seg[0]),
        m: parseInt(seg[1]),
        d: parseInt(seg[2])
    };
}

function getDateName(date){
    const dateName = ["월", "화", "수", "목", "금", "토", "일"];
    return dateName[date%7];
}

function pad(stri, len){
    let str = stri+"";
    while(str.length < len) str = "0"+str;
    return str;
}

function getTimeFormat(diff){
    if(diff<0) diff = -diff;
    let days = parseInt(diff/(3600*24))
    let hours = parseInt((diff%(3600*24))/3600);
    let mins = parseInt((diff%3600)/60);
    let secs = parseInt(diff%60);
    return {
        d: days,
        h: hours,
        m: mins,
        s: secs,
    }
}

function getTimeFormatString(diff){
    let format = getTimeFormat(diff);
    let dayStr = format.d + "일 ";
    let hourStr = format.h + "시간 ";
    let minStr = format.m + "분 ";
    let secStr = format.s + "초";

    let finalStr = "";
    let connect = false;
    if(format.d > 0){
        finalStr += dayStr;
        connect = true;
    }
    if(format.h > 0 || connect){
        finalStr += hourStr;
        connect = true;
    }
    if(format.m > 0 || connect){
        finalStr += minStr;
        connect = true;
    }
    finalStr += secStr;

    return finalStr;
}


Date.prototype.isValid = function(){
    //is not perfect validation check function
    //e.g) 4.31 -> automatically changed to 5.1
    return this.getTime() === this.getTime();
}

Date.prototype.isPM = function(){
    return this.getHours >= 12;
}

Date.prototype.getSplitedHours = function(){
    let hours = this.getHours();
    hours = hours % 12;
    return hours ? hours : 12;
}