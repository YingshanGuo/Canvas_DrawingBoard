window.onload = function() {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        var oInput = document.getElementsByTagName("input");

        for (var i = 0; i < oInput.length; i++) {
            oInput[i].onclick = function() {
                var ID = this.getAttribute('id');
                switch (ID) {
                    case 'red':
                        ctx.strokeStyle = 'red';
                        break;
                    case 'green':
                        ctx.strokeStyle = 'green';
                        break;
                    case 'blue':
                        ctx.strokeStyle = 'blue';
                        break;
                    case 'default':
                        ctx.strokeStyle = 'black';
                        break;
                    case 'clear':
                        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                        break;
                }
            }
        }
        draw();

        function draw() {
            canvas.onmousedown = function(ev) {
                var ev = ev || event;
                ctx.beginPath();
                ctx.moveTo(ev.clientX - canvas.offsetLeft, ev.clientY - canvas.offsetTop);

                document.onmousemove = function(ev) {
                    var ev = ev || event;
                    ctx.lineTo(ev.clientX - canvas.offsetLeft, ev.clientY - canvas.offsetTop);
                    ctx.stroke();
                }


                document.onmouseup = function(ev) {
                    document.onmousemove = document.onmouseup = null;
                    ctx.closePath();
                }

            }
        }