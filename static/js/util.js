function convertRawJson(str){
    let cleanStr = replaceAll(str, '&#34;', '\"');
    return JSON.parse(cleanStr);
}

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}