$(function(){
    loadingBarGraphic();
});

function loadingBarGraphic(){
    const bouncingBar = $('.loading-bar .bouncing-bar');

    moveBouncingBar(bouncingBar);
    setInterval(() => {moveBouncingBar(bouncingBar);}, 2300, 'linear');
}

async function moveBouncingBar(bar){
    bar.css("left", "-"+bar.width()+"px");
    bar.stop().animate({
        left: "100%"
    }, 2000);
}

function activateLoadingBar(bar){
    bar.addClass('active');
}

function deactivateLoadingBar(bar){
    bar.removeClass('active');
}

function deactiveBlurredDiv(div){
    div.removeClass('unfocusable');
    div.css({
        'filter': 'blur(0px)',
        'transition': 'all 1s linear',
    });
}