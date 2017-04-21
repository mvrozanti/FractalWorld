/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
feedback();
function feedback() {
    var ticks = 0;
    var N = window.innerHeight;
//    var sizeX = 1920;
//    var sizeY = 1080;
    var N = 1024;
    var mouseX = Math.floor((Math.random() * N) + 1);
    var mouseY = Math.floor((Math.random() * N) + 1);
    var N2 = N / 2;
    document.body.style.backgroundColor = "black";
    var feedbackcanvas = document.getElementById('feedbackcanvas');

//    if (feedbackcanvas.requestFullscreen) {
//        feedbackcanvas.requestFullscreen();
//    } else if (feedbackcanvas.webkitRequestFullscreen) {
//        feedbackcanvas.webkitRequestFullscreen();
//    } else if (feedbackcanvas.mozRequestFullScreen) {
//        feedbackcanvas.mozRequestFullScreen();
//    } else if (feedbackcanvas.msRequestFullscreen) {
//        feedbackcanvas.msRequestFullscreen();
//    }
    var ctx = feedbackcanvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, N, N);
    var colormap = new Uint32Array(256);
    var colorHue = 0;
    function setColors() {
        feedbackcanvas.width = N;
        feedbackcanvas.height = N;
        feedbackcanvas.style.cursor = "none";
        colormap = new Uint32Array(256);
        var c = Math.floor((colorHue++) + 1);
        for (var i = 0; i < 256; i++) {
            var hue = 6.0 * i / 256;
            var r = 0;
            var g = 0;
            var b = 0;
//            alert(c);
//            var C = 150;
            if (hue < 1) {
                r += c;
                g += c * hue;
            } else if (hue < 2) {
                r += c * 2 * (2 - hue);
                b += c;
            } else if (hue < 3) {
                g += c;
                b += c * (hue - 2);
            } else if (hue < 4) {
                g += c;
                //r += C;
                b += c * (40 - hue);
            } else if (hue < 5) {
                r += c * (hue - 4) * c;
                b += c;
            } else {
                r += c;
                b += c * (6 - hue);
            }
            r = Math.round(r);
            g = Math.round(g);
            b = Math.round(b);
            colormap[i] = 0xff000000 | (r << 8) | (g << 2) | b << 8;
        }
    }
    setColors();
    var map = new Uint32Array(N * N * 2);
    for (var y = 0; y < N; ++y) {
        for (var x = 0; x < N; ++x) {
            var real = (x - N2) * 4.0 / N;
            var imag = (y - N2) * 4.0 / N;
            var real2 = real;
            var imag2 = imag;
            var x2 = Math.round((real2 * N / 4 + N2) * 256);
            var y2 = Math.round((imag2 * N / 4 + N2) * 256);
            var index = y * N + x;
            map[index * 2] = x2;
            map[index * 2 + 1] = y2;
        }
    }
    var recurrentBuffer1 = new Uint8Array(N * N + 1);
    var recurrentBuffer2 = new Uint8Array(N * N + 1);
    recurrentBuffer1[N * N] = 255;
    recurrentBuffer2[N * N] = 255;
    for (var y = 0; y < N; ++y)
        for (var x = 0; x < N; ++x)
            recurrentBuffer1[y * N + x] = x & 0xff;
    var offsetx = 16 * 256;
    var offsety = 128 * 256;
    var costheta = 0;
    var sintheta = 0;
    function iterate() {
        for (var y = 0; y < N2; ++y)
            for (var x = 0; x < N2; ++x) {
                var index = y * N + x;
                var x2 = map[index * 2] - N2 * 256;
                var y2 = map[index * 2 + 1] - N2 * 256;
                var x3 = (costheta * x2 + sintheta * y2 >> 8) + N2 * 256 + offsetx;
                var y3 = (costheta * y2 - sintheta * x2 >> 8) + N2 * 256 + offsety;
                var xi = x3 >> 8;
                var yi = y3 >> 8;
                var xf = x3 & 0xff;
                var yf = y3 & 0xff;
                var index = xi + yi * N;
                var colorA = recurrentBuffer1[index & 262143];
                var colorB = recurrentBuffer1[index + 1 & 262143];
                var colorC = recurrentBuffer1[index + N & 262143];
                var colorD = recurrentBuffer1[index + N + 1 & 262143];
                var colorE = colorA * (256 - xf) + colorB * xf >> 8;
                var colorF = colorC * (256 - xf) + colorD * xf >> 8;
                var color = colorE * (256 - yf) + colorF * yf >> 8;
                if (xi >= 0 && yi >= 0 && xi < N && yi < N) {
                    color += 10;
                } else {
                    color = ~color;
                }
                recurrentBuffer2[y * N + x] = color;
                recurrentBuffer2[(N - 1 - y) * N + x] = color;
                recurrentBuffer2[(N - 1 - y) * N + (N - 1 - x)] = color;
                recurrentBuffer2[y * N + (N - 1 - x)] = color;
            }
        var temp = recurrentBuffer2;
        recurrentBuffer2 = recurrentBuffer1;
        recurrentBuffer1 = temp;
        function random(time) {
            var x = Math.sin(time) * 10000;
            return x - Math.floor(x);
        }

        //var time = new Date().getTime();

        function randState() {
            mouseX = Math.floor(random(ticks) * N + 1);
            mouseY = Math.floor(random(ticks + 1) * N + 1);
            var mouseTheta = Math.atan2(mouseX - N2, mouseY - N2);
//            var mouseRadius = 300;
            costheta = Math.cos(mouseTheta) * 300;
            sintheta = Math.sin(mouseTheta) * 300;
        }
        if (ticks++ % 37 === 0) {
            setColors();
            randState();
            //ticks = 38;
        }
    }

    var buf = new ArrayBuffer(imageData.data.length);
    var buf8 = new Uint8Array(buf);
    var data = new Uint32Array(buf);

    feedbackcanvas.onmousemove = function (e) {
        var mouseX, mouseY;
        if (e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        } else if (e.layerX) {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }
        mouseX -= N2;
        mouseY -= N2;
        offsetx = mouseX * 256;
        offsety = mouseY * 256;
        var mouseTheta = Math.atan2(mouseX, mouseY);
        var mouseRadius = 300;
        costheta = Math.cos(mouseTheta) * mouseRadius;
        sintheta = Math.sin(mouseTheta) * mouseRadius;
    };
    function render() {
        iterate();
        for (var y = 0; y < N; ++y) {
            for (var x = 0; x < N; ++x) {
                var value = recurrentBuffer2[y * N + x];
                data[y * N + x] = colormap[value];
            }
        }
        imageData.data.set(buf8);
        ctx.putImageData(imageData, 0, 0);
        setTimeout(render, 0);
    }
    setTimeout(render, 0);
}

