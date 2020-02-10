let canvasContext = null;
let canvasWidth = 0;
let canvasHeight = 0;

$(function(){
    const canvasWrapper = $('#absence_canvas_wrapper');
    const canvasObject = document.getElementById('absence_status_canvas');
    canvasObject.width = canvasWrapper.width();
    canvasObject.height = canvasWrapper.height();
    canvasWidth = canvasObject.width;
    canvasHeight = canvasObject.height;
    canvasContext = canvasObject.getContext("2d");

    drawCanvas();

    $('#side_menu_opener').on("click", function(){
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

function drawCanvas(){
    drawBar("gray", 0, 1);
    //TEST
    drawBar("rgb(0, 255, 0)", 0, 0.4);
    drawBar("rgb(255, 255, 0)", 0.4, 0.8);
    drawBar("rgb(255, 0, 0)", 0.8, 1);

    drawCursor(0.23);
    drawString(0.23);
}

function drawBar(color, left, amount){
    let leftOffset = canvasWidth*left;
    let barWidth = canvasWidth*(amount-left);
    canvasContext.fillStyle = color;
    canvasContext.fillRect(leftOffset, canvasHeight - 40, barWidth, 20);
}

function drawCursor(offset){
    canvasContext.fillStyle = "white";
    let converted = offset*canvasWidth;
    let startX = converted;
    let startY = canvasHeight - 40 - 10;
    canvasContext.beginPath();
    canvasContext.moveTo(startX, startY);
    canvasContext.lineTo(startX - 10, startY - 15);
    canvasContext.lineTo(startX + 10, startY - 15);
    canvasContext.fill();
}

function drawString(offset){
    canvasContext.fillStyle = "white";
    let converted = offset*canvasWidth;
    let startY = canvasHeight - 40 - 10 - 25;
    canvasContext.textAlign = "center";
    canvasContext.font = '15px Do Hyeon sans serif';
    canvasContext.fillText('주의 단계까지 3회', converted, startY);
}