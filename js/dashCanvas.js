var dashCanvas = document.getElementById('dashCanvas');
var dashctx = dashCanvas.getContext("2d");
dashctx.lineWidth = 1;
dashctx.strokeStyle = "#336699";
dashDraw();

function dashDraw() {
    $("#dashCanvas").mousedown(function(e) {
        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;
        drawing = true;
        lastX = mouseX;
        lastY = mouseY;
    });

    $("#dashCanvas").mousemove(function(e) {
        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;
        if (drawing) {
            dashctx.beginPath();
            if (mode == "pen") {
                dashctx.globalCompositeOperation = "source-over";
                dashctx.lineCap = "round";
                dashctx.lineJoin = "round";
                dashctx.clearRect(0, 0, dashCanvas.clientWidth, dashCanvas.clientHeight);
                if (lineMode == "dashLine") {
                    console.log("dashline-----", dashctx.strokeStyle, lastX, lastY, mouseX, mouseY);
                    if (dashctx.lineWidth >= 1 && dashctx.lineWidth < 10) {
                        dashctx.setLineDash([15]);
                    } else if (dashctx.lineWidth < 20) {
                        dashctx.setLineDash([25]);
                    } else {
                        dashctx.setLineDash([35]);
                    }
                    dashctx.moveTo(lastX, lastY);
                    dashctx.lineTo(mouseX, mouseY);
                    dashctx.stroke();
                    dashctx.setLineDash([0]);
                } else if (lineMode == "fullLine") {
                    dashctx.moveTo(lastX, lastY);
                    dashctx.lineTo(mouseX, mouseY);
                    dashctx.stroke();
                    dashctx.fill();
                }
                // dashctx.stroke();
            }
        }
    });

    $("#dashCanvas").mouseup(function(e) {
        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;
        var dashctx = document.getElementById("dashCanvas").getContext('2d');
        dashctx.closePath();
        drawing = false;

        // $("#dashCanvas").hide();
        ctx.beginPath();
        if (lineMode == "dashLine") {
            if (ctx.lineWidth >= 1 && ctx.lineWidth < 10) {
                ctx.setLineDash([15]);
            } else if (ctx.lineWidth < 20) {
                ctx.setLineDash([25]);
            } else {
                ctx.setLineDash([35]);
            }
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.setLineDash([0]);
        } else if (lineMode == "fullLine") {
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.fill();
        }
        ctx.closePath();
        cPush();
        console.log("dashline到底下的画布-----", ctx.strokeStyle, lastX, lastY, mouseX, mouseY);
        dashctx.clearRect(0, 0, dashCanvas.clientWidth, dashCanvas.clientHeight);
        console.log("记录--- 这是第", cStep, "个数组");
        // imgData = dashctx.getImageData(0, 0, dashctx.canvas.width, dashctx.canvas.height);
        renderPic();
    });
};