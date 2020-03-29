$(() => {
    const timetableLoadBar = $('#load_timetable_list_bar');
    
    $('#verify_account_btn').on("click", () => {
        activateLoadingBar(timetableLoadBar);
    });
});

function activateLoadingBar(bar){
    bar.addClass('active');
}

function deactivateLoadingBar(bar){
    bar.removeClass('active');
}