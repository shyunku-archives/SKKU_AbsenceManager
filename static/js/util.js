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