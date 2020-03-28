function updateTableInfo(semesterInfo, id){
    const timetableID = id;
    getTimeTableInfo(() => {
        const timeTableList = res;
        let foundMatchedTimetable = false;
        console.log(timeTableList);
        console.log(timeTableList.length);
        for(let i=0;i<timeTableList.length;i++){
            let timeTableInfo = timeTableList[i];
            console.log(timetableID+" vs "+timeTableInfo.id);
            if(timeTableInfo.id == timetableID){
                //found one - update

                foundMatchedTimetable = true;
                break;
            }
        }
        //found nothing - generate
        if(!foundMatchedTimetable){
            timeTableList.push({
                id: timetableID,
                course_opening_date: semesterInfo.start_date,
            });
        }
        
        modifyTimeTableData();
    });
}

function updateTimeTableData(data){
    $.ajax({
        url: '/updateTable',
        type: 'POST',
        data: data,
        success: function(res){
        }
    });
}

function getTimeTableInfo(callback){
    $.ajax({
        url: './json/timetable.json',
        type: 'GET',
        dataType: 'json',
        success: function(res){
            callback(res);
        }
    });
}