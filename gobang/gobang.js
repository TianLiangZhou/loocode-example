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
        radius = size / 2,
        width = height = standard * size,
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
    ctx.beginPath();
    for (var i = 1; i <= 19; i++) {
        var offset = i * size - size + radius;
        ctx.moveTo(offset, radius);
        ctx.lineTo(offset, height - radius);
        ctx.moveTo(radius, offset);
        ctx.lineTo(width - radius, offset);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#FFF";
    ctx.arc(75, 75, radius, 0, 2 * Math.PI);
    ctx.arc(75, 125, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.arc(125, 75, radius, 0, 2 * Math.PI);
    ctx.arc(125, 125, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.arc(475, 475, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

}());