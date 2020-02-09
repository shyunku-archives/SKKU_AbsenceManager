$(function(){
    $('#asdf').on("click", function(){
        slideMenu();
    });
});

function slideMenu(){
    const sideMenu = $('#side_menu');
    const animateType = "easeOutBounce";
    if(sideMenu.hasClass('active')){
        sideMenu.animate({
            left: 0,
        }, 700, animateType, function(){
            sideMenu.removeClass('active');
        });
    }else{
        sideMenu.animate({
            left: -400,
        }, 700, animateType, function(){
            sideMenu.addClass('active');
        });
    }
}