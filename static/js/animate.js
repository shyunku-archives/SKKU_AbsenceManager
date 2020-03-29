$(function(){
    loadingBarGraphic();
});

function loadingBarGraphic(){
    const loadingBar = $('.loading-bar');
    const bouncingBar = $('.loading-bar .bouncing-bar');

    moveBouncingBar(bouncingBar);
    setInterval(function(){moveBouncingBar(bouncingBar);}, 2200, 'linear');
}

function moveBouncingBar(bar){
    bar.css("left", "-"+bar.width()+"px");
    bar.animate({
        left: "100%"
    }, 2000);
}