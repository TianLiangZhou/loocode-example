/***
 *
 */
(function() {

    var Events = {
        on: function(type, callback, element) {
            var e = element || window,
                f = e.addEventListener || function(type, callback) {
                    e.attachEvent('on' + type, callback);
                };
            f(type, callback);
        },
        trigger: function(type, object) {

        }
    };
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
    canvas.style.cursor = "pointer";
    desk.style.margin = "10px auto";
    desk.style.width = width + "px";
    desk.appendChild(canvas);
    document.body.insertBefore(desk, child);
    var offsetCanvas = {
        left: desk.offsetLeft,
        top : desk.offsetTop
    };
    console.log(offsetCanvas);
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
    var offset = 0;
    for (var i = 1; i <= 19; i++) {
        offset = i * size - size + radius;
        ctx.moveTo(offset, radius);
        ctx.lineTo(offset, height - radius);
        ctx.moveTo(radius, offset);
        ctx.lineTo(width - radius, offset);
    }
    ctx.stroke();
    ctx.closePath();
    function Chess(color, x, y) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    /**
     *
     * @param name
     * @constructor
     */
    function Player(name, color) {
        this.name = name;
        this.position = [];
        this.color = color;
        this.state = 'playing';
    }
    Player.prototype = {
        /**
         *
         */
        chess: function() {
            if (this.state === 'wait') {
                return ;
            }
            var x, y;
            Chess(this.color, x, y);
            this.state = 'wait';
            this.position.push([x, y]);
        }
    };

}());