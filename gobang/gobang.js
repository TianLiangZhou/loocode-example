/***
 *
 */
(function() {
    /**
     *
     * @type {HTMLCanvasElement}
     */
    var canvas = document.createElement('canvas'),
        desk   = document.createElement('div'),
        standard = 19,
        size = 50,
        width = height = standard * size - size,
        child = document.body.firstChild;
    canvas.setAttribute('id', 'deskCanvas');
    canvas.setAttribute('width', width + "px");
    canvas.setAttribute('height',height + "px");
    desk.style.margin = "10px auto";
    desk.style.width = width + "px";
    desk.appendChild(canvas);
    document.body.insertBefore(desk, child);

    /**
     *
     * @type {CanvasRenderingContext2D|WebGLRenderingContext}
     */
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f6f2e9";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    for (var i = 1; i <= 19; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size - 50, 0);
        ctx.lineTo(i * size - 50, height);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * size - 50);
        ctx.lineTo(width, i * size - 50);
        ctx.closePath();
        ctx.stroke();
    }


}());