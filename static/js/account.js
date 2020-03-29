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
            deactivateLoadingBar(fetchTimeTableLoadingBar);
            deactiveBlurredDiv(timetableDecisionWrapper);
            for(let i=0;i<tables.length;i++){
                let tableInfo = tables[i];
                timetableCandidateSelector.append(new Option(tableInfo.name, tableInfo.id));
            }
        }
    });
}

