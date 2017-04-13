        ;
        (function($) {
            var Drawingboard = function(settings) {
                var settings = settings || {}
                var defaultSettings = {
                    canvasName: "myCanvas",
                    dashCanvasName: "dashCanvas",
                    lineWidth: 1,
                    lineColor: "#336699",
                    lineMode: "basicLine",
                    eraserRadius: "8",
                    width: "800",
                    height: "600"
                }
                this.drawing = false;
                this.mode = "pen";
                this.imgData;
                this.mouseX;
                this.mouseY;
                this.lastX;
                this.lastY;
                this.cPushArray = new Array();
                this.cStep = -1;

                this.settings = $.extend(defaultSettings, settings);
                //mainCanvas
                this.canvas = document.getElementById(this.settings["canvasName"]);
                this.canvas.width = this.settings["width"];
                this.canvas.height = this.settings["height"];
                this.ctx = this.canvas.getContext("2d");
                this.ctx.lineWidth = this.settings["lineWidth"];
                this.ctx.strokeStyle = this.settings["lineColor"];
                //dashCanvas
                this.dashCanvas = document.getElementById(this.settings["dashCanvasName"]);
                this.dashCanvas.width = this.settings["width"];
                this.dashCanvas.height = this.settings["height"];
                this.dashctx = this.dashCanvas.getContext("2d");
                this.dashctx.lineWidth = this.settings["lineWidth"];
                this.dashctx.strokeStyle = this.settings["lineColor"];
                //historyCanvas
                this.canvasHistory = document.getElementById('history');
                this.canvasHistory.width = this.settings["width"];
                this.canvasHistory.height = this.settings["height"];
                this.ctxHistory = this.canvasHistory.getContext("2d");

            }
            Drawingboard.prototype = {
                "init": function() {
                    var canvasInfo = this;
                    $("#" + this.settings["canvasName"]).mousedown(function(e) {
                        canvasInfo.canvasMousedown(e, this.offsetLeft, this.offsetTop);
                    });
                    $("#" + this.settings["canvasName"]).mousemove(function(e) {
                        canvasInfo.canvasMousemove(e, this.offsetLeft, this.offsetTop);
                    });
                    $("#" + this.settings["canvasName"]).mouseup(function(e) {
                        canvasInfo.canvasMouseup(e, this.offsetLeft, this.offsetTop);
                    });
                    //paint-brush
                    $(".paint-color>div").click(function() {
                        var colorCode = $(this).css("background-color");
                        canvasInfo.ctx.strokeStyle = colorCode;
                        canvasInfo.dashctx.strokeStyle = colorCode;
                        canvasInfo.mode = "pen";
                    });
                    //dashCanvas
                    $("#" + this.settings["dashCanvasName"]).mousedown(function(e) {
                        canvasInfo.canvasMousedown(e, this.offsetLeft, this.offsetTop);
                    });
                    $("#" + this.settings["dashCanvasName"]).mousemove(function(e) {
                        canvasInfo.dashCanvasMousemove(e, this.offsetLeft, this.offsetTop);
                    });
                    $("#" + this.settings["dashCanvasName"]).mouseup(function(e) {
                        canvasInfo.dashCanvasMouseup(e, this.offsetLeft, this.offsetTop);
                    });
                    //menu-bar
                    $(".paint-size-input").click(function() {
                        canvasInfo.mode = "pen";
                        if (canvasInfo.settings["lineMode"] == "dashLine") {
                            $("#dashCanvas").show();
                        }
                    });
                    $(".basicLine").click(function() {
                        canvasInfo.settings["lineMode"] = "basicLine";
                        $("#dashCanvas").hide();
                    });
                    $(".fullLine").click(function() {
                        canvasInfo.settings["lineMode"] = "fullLine";
                        $("#dashCanvas").show();
                    });
                    $(".dashLine").click(function() {
                        canvasInfo.settings["lineMode"] = "dashLine";
                        $("#dashCanvas").show();
                    });
                    $(".menu-brush").click(function() {
                        canvasInfo.mode = "pen";
                    });
                    $(".menu-size").click(function() {
                        canvasInfo.mode = "pen";
                    });
                    $(".menu-eraser").click(function() {
                        canvasInfo.mode = "eraser";
                        $("#dashCanvas").hide();
                    });
                    $(".paint-eraser>div").click(function() {
                        canvasInfo.settings["eraserRadius"] = $(this).attr("data-size");
                    });
                    $(".menu-undo").click(function() {
                        canvasInfo.cUndo();
                    });
                    $(".menu-redo").click(function() {
                        canvasInfo.cRedo();
                    });
                    $(".menu-download").click(function() {
                        canvasInfo.download();
                    });
                    //menu-clear .fa-remove
                    $(".menu-clear").click(function() {
                        canvasInfo.ctx.clearRect(0, 0, canvasInfo.canvas.clientWidth, canvasInfo.canvas.clientHeight);
                        canvasInfo.cPushArray = [];
                        console.log("清除");
                        canvasInfo.renderPic();
                    });
                },
                "paintTool": function(opts) {
                    var defaluts = {
                        divName: '.paint-menu div',
                        curName: 'click',
                        itemDivName: '.paint-bar-items',
                        itemName: 'data-name'
                    };
                    var Opt = $.extend({}, defaluts, opts);
                    $("" + Opt['itemDivName'] + '>div').mouseleave(function() {
                        $(this).hide();
                    });
                    return $("" + Opt['divName']).each(function() {
                        $(this).click(function() {
                            var $this = $(this);
                            console.log("-------click-------");
                            $this.addClass(Opt['curName']);
                            $this.siblings().removeClass(Opt['curName']);
                            var x = $(this).offset();
                            var item = $(this).attr(Opt['itemName']);
                            var height = $("" + Opt['itemDivName']).find("." + item).height();
                            console.log("height", item, height);
                            $("" + Opt['itemDivName']).find("." + item).show();
                            $("" + Opt['itemDivName']).find("." + item).siblings().hide();
                            $("" + Opt['itemDivName']).find("." + item).offset({
                                top: x.top - height - 35,
                                left: x.left
                            });
                            y = $("" + Opt['itemDivName']).find("." + item).offset();
                            // $("" + Opt['itemDivName']).find("." + item).show();
                            // $("" + Opt['itemDivName']).find("." + item).siblings().hide();
                            console.log("定位", "父div", x, "子div", y, "子div高度", item, height);
                        });
                    });
                },
                "paintSlider": function(opts) {
                    var canvasInfo = this;
                    var defaluts = {
                        sliderDivName: '#slider',
                        min: 1,
                        max: 30,
                        inputName: '.paint-size-input'
                    };

                    var Opt = $.extend({}, defaluts, opts);
                    var slider = $("" + Opt["sliderDivName"]).slider({
                        range: "min",
                        min: Opt["min"],
                        max: Opt["max"],
                        slide: function(event, ui) {
                            $("" + Opt["inputName"]).val(ui.value);
                            canvasInfo.ctx.lineWidth = ui.value;
                            canvasInfo.dashctx.lineWidth = ui.value;
                        }
                    });
                    $("" + Opt["inputName"]).bind('input  proprtychange', function() {
                        console.log("this.value", this.value);
                        slider.slider("value", this.value);
                        canvasInfo.ctx.lineWidth = $(this).val();
                        canvasInfo.dashctx.lineWidth = $(this).val();
                    });
                },
                "canvasMousedown": function(e, offsetLeft, offsetTop) {
                    var canvasInfo = this;
                    canvasInfo.mouseX = e.pageX - offsetLeft;
                    console.log("mousedown", e.pageX, offsetLeft, canvasInfo.mouseX);
                    canvasInfo.mouseY = e.pageY - offsetTop;
                    canvasInfo.drawing = true;
                    canvasInfo.lastX = canvasInfo.mouseX;
                    canvasInfo.lastY = canvasInfo.mouseY;
                },
                "canvasMousemove": function(e, offsetLeft, offsetTop) {
                    this.mouseX = e.pageX - offsetLeft;
                    this.mouseY = e.pageY - offsetTop;
                    // this.ctx = document.getElementById(this.settings["canvasName"]).getContext("2d");
                    if (this.drawing) {
                        this.ctx.beginPath();
                        this.ctx.lineCap = "round";
                        this.ctx.lineJoin = "round";
                        if (this.mode == "pen") {
                            this.ctx.globalCompositeOperation = "source-over";
                            if (this.settings["lineMode"] == "basicLine") {
                                this.ctx.moveTo(this.lastX, this.lastY);
                                this.ctx.lineTo(this.mouseX, this.mouseY);
                                this.ctx.stroke();
                                this.ctx.fill();
                                this.lastX = this.mouseX;
                                this.lastY = this.mouseY;
                            }
                        } else {
                            console.log("ersaer模式");
                            this.ctx.globalCompositeOperation = "destination-out";
                            this.ctx.arc(this.lastX, this.lastY, this.settings["eraserRadius"], 0, Math.PI * 2, false);
                            // this.ctx.shadowColor = "black";
                            this.ctx.shadowBlur = 10;
                            // this.ctx.shadowOffsetX = 20;
                            // this.ctx.shadowOffsetY = 20;
                            // this.ctx.strokeStyle = "#0000ff";
                            this.ctx.moveTo(this.lastX, this.lastY);
                            this.ctx.lineTo(this.mouseX, this.mouseY);
                            this.ctx.fill();
                            this.ctx.globalCompositeOperation = "source-over";
                            var circleRadius = $(".eraser-circle").height();
                            // $(".eraser-circle").show().offset({
                            //     top: e.pageY - circleRadius,
                            //     left: e.pageX - circleRadius
                            // })
                            this.lastX = this.mouseX;
                            this.lastY = this.mouseY;
                        }
                    }
                },
                "canvasMouseup": function(e, offsetLeft, offsetTop) {
                    this.mouseX = e.pageX - offsetLeft;
                    this.mouseY = e.pageY - offsetTop;
                    // var ctx = document.getElementById("myCanvas").getContext('2d');
                    this.ctx.closePath();
                    this.drawing = false;
                    this.cPush();
                    console.log("记录--- 这是第", this.cStep, "个数组");
                    this.renderPic();
                },
                "dashCanvasMousemove": function(e, offsetLeft, offsetTop) {
                    this.mouseX = e.pageX - offsetLeft;
                    this.mouseY = e.pageY - offsetTop;
                    if (this.drawing) {
                        this.dashctx.beginPath();
                        if (this.mode == "pen") {
                            this.dashctx.globalCompositeOperation = "source-over";
                            this.dashctx.lineCap = "round";
                            this.dashctx.lineJoin = "round";
                            this.dashctx.clearRect(0, 0, this.dashCanvas.clientWidth, this.dashCanvas.clientHeight);
                            if (this.settings["lineMode"] == "dashLine") {
                                console.log("dashline-----");
                                if (this.dashctx.lineWidth >= 1 && this.dashctx.lineWidth < 10) {
                                    this.dashctx.setLineDash([15]);
                                } else if (this.dashctx.lineWidth < 20) {
                                    this.dashctx.setLineDash([25]);
                                } else {
                                    this.dashctx.setLineDash([35]);
                                }
                                this.dashctx.moveTo(this.lastX, this.lastY);
                                this.dashctx.lineTo(this.mouseX, this.mouseY);
                                this.dashctx.stroke();
                                this.dashctx.setLineDash([0]);
                            } else if (this.settings["lineMode"] == "fullLine") {
                                this.dashctx.moveTo(this.lastX, this.lastY);
                                this.dashctx.lineTo(this.mouseX, this.mouseY);
                                this.dashctx.stroke();
                                this.dashctx.fill();
                            }
                            // dashctx.stroke();
                        }
                    }
                },
                "dashCanvasMouseup": function(e, offsetLeft, offsetTop) {
                    this.mouseX = e.pageX - offsetLeft;
                    this.mouseY = e.pageY - offsetTop;
                    this.dashctx.closePath();
                    this.drawing = false;

                    this.ctx.beginPath();
                    this.ctx.lineCap = "round";
                    this.ctx.lineJoin = "round";
                    if (this.settings["lineMode"] == "dashLine") {
                        if (this.ctx.lineWidth >= 1 && this.ctx.lineWidth < 10) {
                            this.ctx.setLineDash([15]);
                        } else if (this.ctx.lineWidth < 20) {
                            this.ctx.setLineDash([25]);
                        } else {
                            this.ctx.setLineDash([35]);
                        }
                        this.ctx.moveTo(this.lastX, this.lastY);
                        this.ctx.lineTo(this.mouseX, this.mouseY);
                        this.ctx.stroke();
                        this.ctx.setLineDash([0]);
                    } else if (this.settings["lineMode"] == "fullLine") {
                        this.ctx.moveTo(this.lastX, this.lastY);
                        this.ctx.lineTo(this.mouseX, this.mouseY);
                        this.ctx.stroke();
                        this.ctx.fill();
                    }
                    this.ctx.closePath();
                    this.cPush();
                    console.log("dashline到底下的画布-----");
                    this.dashctx.clearRect(0, 0, this.dashCanvas.clientWidth, this.dashCanvas.clientHeight);
                    console.log("记录--- 这是第", this.cStep, "个数组");
                    this.renderPic();
                },
                "cPush": function() {
                    this.cStep++;
                    if (this.cStep < this.cPushArray.length) {
                        this.cPushArray.length = this.cStep;
                    }
                    this.cPushArray.push(document.getElementById('myCanvas').toDataURL());
                },
                "cUndo": function() {
                    if (this.cStep > 0) {
                        this.cStep--;
                        var canvasInfo = this;
                        var canvasPic = new Image();
                        canvasPic.src = this.cPushArray[this.cStep];
                        canvasPic.onload = function() {
                            canvasInfo.ctx.clearRect(0, 0, canvasInfo.canvas.clientWidth, canvasInfo.canvas.clientHeight);
                            canvasInfo.ctx.drawImage(canvasPic, 0, 0);
                        }
                        console.log("cUndo按钮--- 这是第", this.cStep, "个数组");
                    } else {
                        console.log("不能再undo啦~~~~~");
                        this.cStep = -1;
                        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
                    }
                    this.renderPic();
                },
                "cRedo": function() {
                    if (this.cStep < this.cPushArray.length - 1) {
                        this.cStep++;
                        var canvasInfo = this;
                        var canvasPic = new Image();
                        canvasPic.src = this.cPushArray[this.cStep];
                        canvasPic.onload = function() {
                            canvasInfo.ctx.clearRect(0, 0, canvasInfo.canvas.clientWidth, canvasInfo.canvas.clientHeight);
                            canvasInfo.ctx.drawImage(canvasPic, 0, 0);
                        }
                        console.log("cRedo按钮--- 这是第", this.cStep, "个数组");
                    }
                    this.renderPic();
                },
                "renderPic": function() {
                    var canvasInfo = this;
                    this.ctxHistory.fillStyle = "#fff";
                    this.ctxHistory.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
                    this.ctxHistory.globalCompositeOperation = "source-over";
                    // var img = new Image();
                    // console.log($("#myCanvas").css("background"));
                    // img.src = "./images/keji.jpg";
                    // var imgWidth = img.width;
                    // var imgHeight = img.height;
                    // img.onload = function() {
                    //     canvasInfo.ctxHistory.drawImage(img, 0, 0, imgWidth, imgHeight);
                    // }
                    var canvasPic = new Image();
                    canvasPic.src = this.cPushArray[this.cStep];
                    canvasPic.onload = function() {
                        canvasInfo.ctxHistory.drawImage(canvasPic, 0, 0);
                    }
                },
                "download": function() {
                    var download = document.getElementById("download");
                    var image = document.getElementById("history").toDataURL("image/png")
                        .replace("image/png", "image/octet-stream");
                    download.setAttribute("href", image);
                }
            }

            window.Drawingboard = Drawingboard;
            var canvas = new Drawingboard();
        })(jQuery);