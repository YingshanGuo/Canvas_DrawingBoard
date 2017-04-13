var canvas = document.getElementById('myCanvas'); //获取画布  
var ctx = canvas.getContext("2d"); //设置模式  
ctx.lineWidth = 1; //线粗  
ctx.strokeStyle = "#336699"; //线条填充样式  
var drawing = false; //开始为false 当鼠标按下时才能画图  
var imgData;
var mode = "pen";
var mouseX;
var mouseY;
var lastX;
var lastY;
var cPushArray = new Array();
var cStep = -1;
var eraserRadius = 8;
var lineMode = "basicLine";

draw();
slider();

//工具栏-样式
// .paintingContainer paint - tool div
$(".paint-tool div").click(function() {
    $(this).toggleClass("click");
    $(this).siblings().removeClass("click");
    x = $(this).offset();
    var item = $(this).attr("data-name");
    $(".paint-bar-items").find("." + item).offset({
        top: x.top,
        left: x.right
    });
    $(".paint-bar-items").find("." + item).show();
    $(".paint-bar-items").find("." + item).siblings().hide();
});
$(".paint-bar-items>div").mouseleave(function() {
    $(this).hide();
});

//paint-brush
$(".paint-color>div").click(function() {
    var colorCode = $(this).css("background-color");
    ctx.strokeStyle = colorCode;
    dashctx.strokeStyle = colorCode;
    mode = "pen";
});

//paint-size
function slider() {
    var slider = $("#slider").slider({
        range: "min",
        min: 1,
        max: 30,
        slide: function(event, ui) {
            $(".paint-size-input").val(ui.value);
            ctx.lineWidth = ui.value;
            dashctx.lineWidth = ui.value;
        }
    });

    $(".paint-size-input").bind('input  proprtychange', function() {
        slider.slider("value", this.value);
        ctx.lineWidth = $(this).val();
        dashctx.lineWidth = $(this).val();
    });
}

//draw
function draw() {
    $("#myCanvas").mousedown(function(e) {
        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;
        drawing = true;
        lastX = mouseX;
        lastY = mouseY;

    });

    $("#myCanvas").mousemove(function(e) {
        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;
        if (drawing) {
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            if (mode == "pen") {
                ctx.globalCompositeOperation = "source-over";
                if (lineMode == "basicLine") {
                    // ctx.lineCap = "round";
                    // ctx.lineJoin = "round";
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                    ctx.fill();
                    lastX = mouseX;
                    lastY = mouseY;
                }
                //  else if (lineMode == "dashLine") {
                //     ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                //     if (ctx.lineWidth >= 1 && ctx.lineWidth < 10) {
                //         ctx.setLineDash([15]);
                //     } else if (ctx.lineWidth < 20) {
                //         ctx.setLineDash([25]);
                //     } else {
                //         ctx.setLineDash([35]);
                //     }
                //     ctx.moveTo(lastX, lastY);
                //     ctx.lineTo(mouseX, mouseY);
                //     ctx.stroke();
                //     ctx.setLineDash([0]);
                // }

                // ctx.stroke();
            } else {
                console.log("ersaer模式");
                ctx.globalCompositeOperation = "destination-out";
                ctx.arc(lastX, lastY, eraserRadius, 0, Math.PI * 2, false);
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(mouseX, mouseY);
                // ctx.lineCap = "round";
                // ctx.lineJoin = "round";
                ctx.fill();
                ctx.globalCompositeOperation = "source-over";
                lastX = mouseX;
                lastY = mouseY;
            }
            // lastX = mouseX;
            // lastY = mouseY;
        }
    });

    $("#myCanvas").mouseup(function(e) {
        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;
        var ctx = document.getElementById("myCanvas").getContext('2d');
        ctx.closePath();
        drawing = false;
        cPush();
        console.log("记录--- 这是第", cStep, "个数组");
        // imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        renderPic();
    });
};

function cPush() {
    cStep++;
    if (cStep < cPushArray.length) {
        cPushArray.length = cStep;
    }
    cPushArray.push(document.getElementById('myCanvas').toDataURL());
    // showHistory();
}

function cUndo() {
    if (cStep > 0) {
        cStep--;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function() {
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            ctx.drawImage(canvasPic, 0, 0);
        }
        console.log("cUndo按钮--- 这是第", cStep, "个数组");
    } else {
        console.log("不能再undo啦~~~~~");
        cStep = -1;
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
    renderPic();
}

function cRedo() {
    if (cStep < cPushArray.length - 1) {
        cStep++;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function() {
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            ctx.drawImage(canvasPic, 0, 0);
        }
        console.log("cRedo按钮--- 这是第", cStep, "个数组");
    }
    renderPic();
}

var canvasHistory = document.getElementById('history');
var ctxHistory = canvasHistory.getContext("2d");

function renderPic() {
    ctxHistory.fillStyle = "#fff";
    ctxHistory.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctxHistory.globalCompositeOperation = "source-over";
    var img = new Image();
    console.log($("#myCanvas").css("background"));
    // img.src = $("#myCanvas").css("background").split("(")[2].split(")")[0]; //待改善
    img.src = "./images/robot.jpg";
    var imgWidth = img.width;
    var imgHeight = img.height;
    // var imgLeft = -(canvasHistory.style.width - imgWidth) / 2;
    // console.log("imgLeft", imgLeft);
    img.onload = function() {
        ctxHistory.drawImage(img, 0, 0, imgWidth - 100, imgHeight - 100);
    }
    var canvasPic = new Image();
    canvasPic.src = cPushArray[cStep];
    canvasPic.onload = function() {
        ctxHistory.drawImage(canvasPic, 0, 0);
    }
}

function download() {
    var download = document.getElementById("download");
    var image = document.getElementById("history").toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    download.setAttribute("href", image);
    //download.setAttribute("download","archive.png");
}

//虚线
function drawDashLine1(ctx, dashLength) {
    var dashLen = dashLength === undefined ? 5 : dashLength,
        numDashes = Math.floor(Math.sqrt(mouseX * mouseX + mouseY * mouseY) / dashLen);
    for (var i = 0; i < numDashes; i++) {
        if (i % 2 === 0) {
            ctx.moveTo(this.offsetLeft + (mouseX / numDashes) * i, this.offsetTop + (mouseY / numDashes) * i);
        } else {
            ctx.lineTo(this.offsetLeft + (mouseX / numDashes) * i, this.offsetTop + (mouseY / numDashes) * i);
        }
    }
    console.log("func drawDashLine", this.offsetLeft, mouseX);
    ctx.stroke();
}

function drawDashLine(ctx, x1, y1, x2, y2, dashLength) {
    var dashLen = dashLength === undefined ? 5 : dashLength,
        xpos = x2 - x1,
        ypos = y2 - y1,
        numDashes = Math.floor(Math.sqrt(xpos * xpos + ypos * ypos) / dashLen);

    for (var i = 0; i < numDashes; i++) {
        if (i % 2 === 0) {
            ctx.moveTo(x1 + (xpos / numDashes) * i, y1 + (ypos / numDashes) * i);
        } else {
            ctx.lineTo(x1 + (xpos / numDashes) * i, y1 + (ypos / numDashes) * i);
        }
    }
    ctx.stroke();
}
// ctx.lineWidth = 2;
// ctx.strokeStyle = "#0000ff";
// drawDashLine(ctx, 0, 0, 400, 400, 8);

function showHistory() {
    for (var cStep = 0; cStep <= cPushArray.length; cStep++) {
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function() {
            ctxHistory.drawImage(canvasPic, 0, 0);
        }
    }
}

//menu-bar
$(".paint-size-input").click(function() {
    mode = "pen";
    if (lineMode == "dashLine") {
        $("#dashCanvas").show();
    }
});
$(".basicLine").click(function() {
    lineMode = "basicLine";
    $("#dashCanvas").hide();
});
$(".fullLine").click(function() {
    lineMode = "fullLine";
    $("#dashCanvas").show();
});
$(".dashLine").click(function() {
    lineMode = "dashLine";
    $("#dashCanvas").show();
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = "#0000ff";
    // drawDashLine(ctx, 0, 0, 400, 400, 8);
});
$(".menu-brush").click(function() {
    mode = "pen";
});
$(".menu-size").click(function() {
    mode = "pen";
});
$(".menu-eraser").click(function() {
    mode = "eraser";
    $("#dashCanvas").hide();
});
$(".paint-eraser>div").click(function() {
    eraserRadius = $(this).attr("data-size");
});
$(".menu-undo").click(function() {
    cUndo();
});
$(".menu-redo").click(function() {
    cRedo();
});
$(".menu-download").click(function() {
    download();
});
//menu-clear
$(".fa-remove").click(function() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    cPushArray = [];
    console.log("清除");
    renderPic();
});