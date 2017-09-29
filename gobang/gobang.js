/***
 *
 */
(function() {

    var _ = {
        merge: function(source, newObject) {
            for(var key in newObject) {
                source[key] = newObject[key];
            }
            return source;
        }
    };

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
    var offsetCanvas = {
        //left: desk.offsetLeft,
        //top : desk.offsetTop
    };





    function Desk(standard, options) {
        var defaults = _.merge({
                size: 50,
                standard: standard
            }, options),
            width = height = standard  * parseInt(defaults.size, 10),
            radius = parseInt(defaults.size, 10) / 2,
            desk   = document.createElement('div'),
            /**
             *
             * @type {HTMLCanvasElement}
             */
            canvas = document.createElement('canvas'),
            ctx = null;
        defaults["width"] = width;
        defaults["height"]= height;
        defaults["radius"]= radius;
        canvas.setAttribute('id', 'deskCanvas');
        canvas.setAttribute('width', width + "px");
        canvas.setAttribute('height',height + "px");
        canvas.style.cursor = "pointer";
        desk.style.margin = "10px auto";
        desk.style.width = width + "px";

        /**
         *
         * @param key
         * @returns {*|null}
         */
        this.getOption = function(key) {
            return defaults[key] || null;
        };

        /**
         *
         * @returns {HTMLCanvasElement}
         */
        this.getCanvas = function() {
            return canvas;
        };
        this.getContext= function(driver) {
            if (ctx === null) {
                return canvas.getContext(driver || "2d");
            }
            return ctx;
        };
        this.setContext = function(content) {
            ctx = content;
        };

        desk.appendChild(canvas);
        document.body.insertBefore(desk, document.body.firstChild);
    }
    Desk.prototype = {
        draw: function() {
            /**
             *
             * @type {CanvasRenderingContext2D|WebGLRenderingContext}
             */
            var ctx = this.getContext(),
                offset = 0,
                size = this.getOption('size'),
                radius = this.getRadius(),
                width = this.getOption('width'),
                height = this.getOption('height');
            this.setContext(ctx);
            ctx.fillStyle = "#f6f2e9";
            ctx.fillRect(0, 0, this.getOption("width"), this.getOption("height"));
            ctx.strokeStyle = "#999";
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (var i = 1; i <= 19; i++) {
                offset = i * size - size + radius;
                ctx.moveTo(offset, radius);
                ctx.lineTo(offset, height - radius);
                ctx.moveTo(radius, offset);
                ctx.lineTo(width - radius, offset);
            }
            ctx.stroke();
            ctx.closePath();
        },
        getRadius: function() {
            return this.getOption("radius");
        },
        getSize: function() {
            return this.getOption("size");
        }
    };

    function Chess(color, desk) {
        this.color = color;
        this.desk = desk;
        this.position = [];
    }
    Chess.prototype = {
        draw: function(point) {
            var ctx = this.desk.getContext(),
                radius = this.desk.getRadius();
            point = this.roundCirclePoint(point);

            if (typeof point[0] === "object") {
                return this.noticeReact(point);
            }
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            return point;
        },
        /**
         * 绘制提示点
         * @param points
         */
        noticeReact: function(points) {
            var ctx = this.desk.getContext(),
                size= this.desk.getSize(),
                radius = this.desk.getRadius();
                ctx.strokeStyle = "#f4645f";
            for (var i in points) {
                var m = points[i];
                ctx.strokeRect(
                    m.x - (radius / 2), m.y - (radius / 2), size - radius, size - radius
                );
            }
            return null;
        },
        roundCirclePoint: function(point) {
            var radius = this.desk.getRadius(),
                size = this.desk.getSize(),
                x = Math.floor((point.x - radius) / size),
                y = Math.floor((point.y - radius) / size),
                circle = [];
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            //查找附近四个圆点中心
            for(var i = x; i <= x+1; i++) {
                for(var j = y; j <= y+1; j++) {
                    circle.push({
                        x: i * 50 + radius,
                        y: j * 50 + radius
                    });
                }
            }
            for (var index in circle) {
                var m = circle[index];
                var distance = Math.pow(m.x - point.x, 2) + Math.pow(m.y - point.y, 2);
                if (distance < Math.pow(radius, 2)) {
                    return m;
                }
            }
            return circle;
        }
    };
    /**
     *
     * @param name
     * @constructor
     */
    function Player(name, color) {
        this.name = name;
        this.position = [];
        this.color = color;
        this.state = 'waitStart';
        var x = y = 0;
        this.setXY = function(xv, yv) {x = xv; y = yv;};
        this.getXY = function() {return {x: x, y: y};};
        this.chess = null;
        this.setChess = function(chess) {
            this.chess = chess;
        };
    }
    Player.prototype = {
        /**
         *
         */
        render: function() {
            for (var i in this.position) {
                this.chess.draw(this.position[i]);
            }
        },
        /**
         *
         */
        playChess: function() {
            if (this.state === 'waiting' || this.state === 'waitStart') {
                return ;
            }
            var point = this.getXY(),
                circlePoint = this.chess.draw(point);
            //this.state = 'waiting';
            if (circlePoint !== null) {
                this.position.push(point);
            }
        },
        setState: function(state) {
            this.state = state;
        }
    };
    var desk = new Desk(19);
    var chess = new Chess("#FFF", desk);
    var player = new Player();
    player.setChess(chess);
    Events.on('click', function(e) {
        player.setState('playing');
        player.setXY(e.offsetX, e.offsetY);
    }, desk.getCanvas());
    setInterval(function() {
        desk.draw();
        player.render();
        player.playChess();
    }, 1000 / 30);
}());