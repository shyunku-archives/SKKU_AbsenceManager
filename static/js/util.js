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

Date.prototype.isValid = function(){
    //is not perfect validation check function
    //e.g) 4.31 -> automatically changed to 5.1
    return this.getTime() === this.getTime();
}