let disableAuthenticate = false;

$(()=>{
    $('#verify_account_btn').on("click", authenticateIcampus);
    $('#icampus_pw_input').on("keydown", (e) => {
        if(e.key == "Enter" && !disableAuthenticate) authenticateIcampus();
    });
    $('#finish_icampus_setting').on("click", saveIcampusAccount);
});

function authenticateIcampus(){
    const authenIcampusAccountLoadingBar = $('#icampus_authen_bar');
    const courseListWrapper = $('#found_course_list_wrapper');
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
                deactiveBlurredDiv($('#load_icampus_courses_wrapper'));
                $('#icampus_id_input').attr('disabled', true);
                $('#icampus_pw_input').attr('disabled', true);
                $('#found_course_num').text(`과목 ${res.courseInfo.length}개 찾음`);
                $('#student_id_str').text(`학번: ${res.studentID}`);
                $('#student_name_str').text(`이름: ${res.studentName}`);
                if(res.studentID != "unknown") $('#student_id').attr('value', res.studentID);
                if(res.studentName != "unknown") $('#student_name').attr('value', res.studentName);
                courseListWrapper.empty();
                for(let i=0;i<res.courseInfo.length;i++){
                    courseListWrapper.append(`
                    <span class="form-item-name block-span">${res.courseInfo[i].name}</span>
                    `);
                }
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

function saveIcampusAccount(){
    const icampusID = $('#icampus_id_input').val();
    const icampusPW = $('#icampus_pw_input').val();
    $.ajax({
        url: "/save_icampus_account",
        type: "POST",
        dataType: "json",
        data: {
            ID: icampusID,
            PW: icampusPW,
            studentID: $('#student_id').attr('value'),
            studentName: $('#student_name').attr('value'),
        },
        success: function(res){
            const status = res.code;
            console.log(res);
            if(status == 1000){
                alert('아이캠퍼스 설정이 완료되었습니다.');
                location.href = "/";
            }
        }
    });
}