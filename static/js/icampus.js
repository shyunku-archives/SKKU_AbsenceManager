$(()=>{
    const mainTab = $('#main_tab');
    const courseTab = $('#courses_tab');
    const assignmentTab = $('#assignments_tab');
    const announcementTab = $('#announcements_tab');

    mainTab.on("click", function(){
        location.href = "/icampus";
    });

    courseTab.on("click", function(){
        location.href = "/icampus?section=courses"
    });

    assignmentTab.on("click", function(){
        location.href = "/icampus?section=assignments"
    });
});