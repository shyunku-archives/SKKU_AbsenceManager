let disableAuthenticate = false;

$(()=>{
    $('#verify_account_btn').on("click", authenticateIcampus);
    $('#icampus_pw_input').on("keydown", (e) => {
        if(e.key == "Enter" && !disableAuthenticate) authenticateIcampus();
    });
    // $('#register_userinfo_btn').on("click", registerUserInfo);
});

function authenticateIcampus(){
    const authenIcampusAccountLoadingBar = $('#icampus_authen_bar');
    $('#verify_account_btn').attr('disabled', true);
    disableAuthenticate = true;
    activateLoadingBar(authenIcampusAccountLoadingBar);
    const id = $('#icampus_id_input').val();
    const pw = $('#icampus_pw_input').val();

    $.ajax({
        url: "/authen-icampus",
        type: "POST",
        dataType: "json",
        data: {
            ID: id,
            PW: pw,
        },
        success: function(res){
            const status = res.code;
            deactivateLoadingBar(authenIcampusAccountLoadingBar);
            console.log(res);

            if(status == 1000){
                $('#icampus_id_input').attr('disabled', true);
                $('#icampus_pw_input').attr('disabled', true);
            }else{
                console.error("Error occurred: code "+status);
                switch(status){
                    case 1006:
                        alert('아이디나 비밀번호가 틀렸습니다.');
                        $('#icampus_id_input').val('');
                        $('#icampus_pw_input').val('');
                        break;
                }
                disableAuthenticate = false;
                $('#verify_account_btn').attr('disabled', false);
            }
        }
    });
}