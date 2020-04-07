$(() => {
    const sideMenuWrapper = $('#side_menu');
    const animateType = "easeOutBounce";
    sideMenuWrapper.mouseover(()=>{
        sideMenuWrapper.stop().animate({
            left: 0,
        }, 700, animateType);
    });

    sideMenuWrapper.mouseleave(()=>{
        sideMenuWrapper.stop().animate({
            left: -380,
        }, 700, animateType);
    });

    setCurrentTimeInfo();
    setInterval(function(){
        setCurrentTimeInfo();
    }, 1000);
});

function setCurrentTimeInfo(){
    const current = new Date();
    const year = current.getFullYear();
    const month = current.getMonth() +1;
    const day = current.getDate();
    const hour = current.getSplitedHours();
    const min = current.getMinutes();
    const sec = current.getSeconds();
    
    $('#current_date').text(`${year}년 ${month}월 ${day}일`);
    $('#current_time').text(`${pad(hour+"",2)}:${pad(min+"",2)}`);
    $('#current_sec').text(pad(sec+"",2));
    $('#current_time_split').text(current.isPM()?"PM":"AM");
    $('#current_time').css('text-shadow', `0 0 10px ${current.isPM()?"blue":"red"}`);
    // $('#current_time_split').css('color', `${current.isPM()?"blue":"red"}`);
}