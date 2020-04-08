let disableAuthenticate = false;
let savedTableBundle = null;

$(() => {
    $('#verify_account_btn').on("click", fetchTimeTableInfo);
    $('#everytime_pw_input').on("keydown", (e) => {
        if(e.key == "Enter" && !disableAuthenticate) fetchTimeTableInfo();
    });
    $('#register_userinfo_btn').on("click", registerUserInfo);
});

function fetchTimeTableInfo(){
    const fetchTimeTableLoadingBar = $('#load_timetable_list_bar');
    const timetableDecisionWrapper = $('#timetable_decision_wrapper');
    const timetableCandidateSelector = $('#timetable_candidate_selector');
    $('#verify_account_btn').attr('disabled', true);
    disableAuthenticate = true;
    activateLoadingBar(fetchTimeTableLoadingBar);
    const id = $('#everytime_id_input').val();
    const pw = $('#everytime_pw_input').val();
    $.ajax({
        url: "/authen-everytime",
        type: "POST",
        dataType: "json",
        data: {
            ID: id,
            PW: pw,
        },
        success: function(res){
            const status = res.code;
            deactivateLoadingBar(fetchTimeTableLoadingBar);

            if(status == 1000){
                console.log(res);
                const tables = res.tableData;
                const semesterInfo = res.semesterData;
                savedTableBundle = tables;
                
                deactiveBlurredDiv(timetableDecisionWrapper);
                for(let i=0;i<tables.length;i++){
                    let tableInfo = tables[i];
                    timetableCandidateSelector.append(new Option(tableInfo.name, tableInfo.id));
                }
                
                $('#selected_subject_id').text(tables[0].id);
                $('#selected_subject_recent_update_date').text(tables[0].update_date);
                $('#selected_subject_generated_date').text(tables[0].create_date);
    
                timetableCandidateSelector.on('change', () => {
                    let selectedValue = $('#timetable_candidate_selector option:selected').val();
                    for(let i=0;i<tables.length;i++){
                        let tableInfo = tables[i];
                        if(tableInfo.id == selectedValue){
                            $('#selected_subject_id').text(tableInfo.id);
                            $('#selected_subject_recent_update_date').text(tableInfo.update_date);
                            $('#selected_subject_generated_date').text(tableInfo.create_date);
                            return;
                        }
                    }
                });

                const now = new Date();
                const openDate = parseDate(semesterInfo.start_date);
                const closeDate = parseDate(semesterInfo.end_date);
                let openingYear = $('#course_open_year');
                let closingYear = $('#course_close_year');

                openingYear.val(openDate.y);
                openingYear.attr('min', now.getFullYear());
                openingYear.attr('max', now.getFullYear()+1);
                $('#course_open_month').val(openDate.m);
                $('#course_open_day').val(openDate.d);

                closingYear.val(closeDate.y);
                closingYear.attr('min', now.getFullYear());
                closingYear.attr('max', now.getFullYear()+1);
                $('#course_close_month').val(closeDate.m);
                $('#course_close_day').val(closeDate.d);

                $('#default_course_opening_date').text("(Default: "+semesterInfo.start_date+")");
                $('#default_course_closing_date').text("(Default: "+semesterInfo.end_date+")");

                $('#everytime_id_input').attr('disabled', true);
                $('#everytime_pw_input').attr('disabled', true);
            }else{
                console.error("Error occurred: code "+status);
                switch(status){
                    case 1001:
                        alert('아이디나 비밀번호가 틀렸습니다.');
                        $('#everytime_id_input').val('');
                        $('#everytime_pw_input').val('');
                        break;
                }
                disableAuthenticate = false;
                $('#verify_account_btn').attr('disabled', false);
            }
        }
    });
}

function registerUserInfo(){
    //form 검사
    const courseOpenDate = $('#course_open_year').val()+"-"+pad($('#course_open_month').val(),2)+"-"+pad($('#course_open_day').val(),2);
    const courseCloseDate = $('#course_close_year').val()+"-"+pad($('#course_close_month').val(),2)+"-"+pad($('#course_close_day').val(),2);

    const openDate = new Date(courseOpenDate);
    const closeDate = new Date(courseCloseDate);

    if(!openDate.isValid()){
        alert('개강 날짜가 올바르지 않습니다: '+courseOpenDate);
        return;
    }

    if(!closeDate.isValid()){
        alert('종강 날짜가 올바르지 않습니다: '+courseCloseDate);
        return;
    }

    if(openDate.getTime()> closeDate.getTime()){
        alert('종강 날짜가 개강 날짜보다 이릅니다.');
        return;
    }

    const selectedTableID = $('#timetable_candidate_selector option:selected').val();
    let selectedTable = null;

    for(let i=0;i<savedTableBundle.length;i++){
        const elem = savedTableBundle[i];
        if(elem.id == selectedTableID){
            selectedTable = elem;
            break;
        }
    }
    
    const saveTableInfoLoadingBar = $('#wait_save_info_bar');
    $('#register_userinfo_btn').attr('disabled', true);
    activateLoadingBar(saveTableInfoLoadingBar);
    //User Account Info 저장
    //TimeTable 저장
    $.ajax({
        url: "/save-userinfo",
        type: "POST",
        dataType: "json",
        data: {
            everytimeAccount:{
                id: $('#everytime_id_input').val(),
                pw: $('#everytime_pw_input').val()
            },
            timetableInfo:{
                name: $('#timetable_candidate_selector option:selected').text(),
                id: selectedTableID,
                openDate: courseOpenDate,
                closeDate: courseCloseDate,
                table: selectedTable.tableSchedule
            }
        },
        success: function(res){
            const status = res.code;
            deactivateLoadingBar(saveTableInfoLoadingBar);

            if(status == 1000){
                alert('에브리타임 설정이 완료되었습니다.');
                location.href = "/";
            }else{
                $('#register_userinfo_btn').attr('disabled', false);
            }
        }
    });
}

function pad(stri, len){
    let str = stri+"";
    while(str.length < len) str = "0"+str;
    return str;
}