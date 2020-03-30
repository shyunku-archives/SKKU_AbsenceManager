$(() => {
    $('#verify_account_btn').on("click", fetchTimeTableInfo);
    $('#everytime_pw_input').on("keydown", (e) => {
        if(e.key == "Enter") fetchTimeTableInfo();
    });
});

function fetchTimeTableInfo(){
    const fetchTimeTableLoadingBar = $('#load_timetable_list_bar');
    const timetableDecisionWrapper = $('#timetable_decision_wrapper');
    const timetableCandidateSelector = $('#timetable_candidate_selector');
    $('#verify_account_btn').attr('disabled', true);
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
            const tables = res.tables;
            console.log(tables);
            deactivateLoadingBar(fetchTimeTableLoadingBar);
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
        }
    });
}

