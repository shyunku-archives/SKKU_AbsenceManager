let disableAuthenticate = false;

$(() => {
    $('#verify_account_btn').on("click", fetchTimeTableInfo);
    $('#everytime_pw_input').on("keydown", (e) => {
        if(e.key == "Enter" && !disableAuthenticate) fetchTimeTableInfo();
    });
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
        url: "/authen",
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
                const tables = res.tables;
                console.log(tables);
                
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
            }else{
                console.error("Error occurred: code "+status);
                switch(status){
                    case 1001:
                        alert('아이디나 비밀번호가 틀렸습니다.');
                        break;
                }
                disableAuthenticate = false;
                $('#verify_account_btn').attr('disabled', false);
            }
        }
    });
}

