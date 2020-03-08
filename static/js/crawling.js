const originalHomeURL = "https://everytime.kr";

const homeURL = originalHomeURL;

const urlBundle = {
    login: homeURL + "/login",
    authenticate: homeURL + "/user/login",
    timetable: homeURL + "/timetable",
    accountInfo: "json/account.json",
};

let accountInfo = null;

$(function(){
    jQuery.ajaxPrefilter(function(options){
        if (options.crossDomain && jQuery.support.cors) {
            options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
        }
    });
    getUserAccountInfoFromFileStream();
    getResponseToAuthenticate();
});

//로그인
function getResponseToAuthenticate(){
    $.ajax({
        url: urlBundle.authenticate,
        type: "POST",
        async: false,
        data:{
            "userid": accountInfo.id,
            "password": accountInfo.pw,
            "redirect": "/"
        },
        // crossDomain: true,
        success: function(data, status, xhr){
            console.log(data);
            console.log(status);
            console.log(xhr);
        },
        error: function(jqXHR, status, error){
            console.log(status+": "+error);
        }
    });

    // $.ajax({
    //     url: urlBundle.timetable,
    //     type: "GET",
    //     async: false,
    //     crossDomain: true,
    //     success: function(data, status, xhr){
    //         console.log(data);
    //         console.log(status);
    //         console.log(xhr);
    //     },
    //     error: function(jqXHR, status, error){
    //         console.log(status+": "+error);
    //     }
    // });
}

//local 파일의 아이디 비번을 읽어옴
function getUserAccountInfoFromFileStream(){
    $.ajax({
        url: urlBundle.accountInfo,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(res){
            accountInfo = res;
        }
    });
}