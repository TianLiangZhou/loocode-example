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
    var _listener = [];
    var Events = {
        on: function(type, callback, element) {
            var e = element || window,
                f = e.addEventListener || function(type, callback) {
                    e.attachEvent('on' + type, callback);
                };
            f(type, callback);
            _listener.push({
                type: type, 
                callback: callback    
            });
        },
        trigger: function(type, object, param) {
            for(var i in _listener) {
                var name = _listener[i].type,
                    callback = _listener[i].callback;
                if (name === type) {
                    callback.call(object || window, param);
                }         
            }  
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
             * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D
             */
            var ctx = this.getContext(),
                offset = 0,
                size = this.getOption('size'),
                radius = this.getRadius(),
                width = this.getOption('width'),
                height = this.getOption('height'),
                standard = this.getOption('standard');
            this.setContext(ctx);
            //设置填充颜色
            ctx.fillStyle = "#f6f2e9";
            //使用fillStyle设置的颜色来填充矩形区域
            ctx.fillRect(0, 0, this.getOption("width"), this.getOption("height"));
            ctx.strokeStyle = "#999"; //线条颜色
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (var i = 1; i <= standard; i++) {
                offset = i * size - size + radius;
                //绘制竖线
                ctx.moveTo(offset, radius);
                ctx.lineTo(offset, height - radius);
                //绘制横线
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

    function Chess(desk) {
        var position = [];
        this.standard = desk.getOption('standard') - 1;
        this.size     = desk.getSize();
        this.desk = desk;
        for (var y = 0; y <= this.standard; y++) {
            position[y] = [];
            for (var x = 0; x <= this.standard; x++) {
                position[y][x] = null;
            }
        }
        this.addPosition = function(object) {
            var x = Math.floor(object.point.x / this.size),
                y = Math.floor(object.point.y / this.size);
            if (position[y][x] !== null) {
                return false;
            }
            position[y][x] = object;
            return true;
        };
        this.getPosition = function() {
            return position;
        };
        this.ctx = this.desk.getContext();
        this.radius = this.desk.getRadius();
    }
    Chess.prototype = {
        /**
         * 绘制棋子
         * @param player
         * @returns {*}
         */
        draw: function(player) {
            var point = this.roundCirclePoint(player.getXY());
            if (typeof point[0] === "object") {
                return this.noticeReact(point);
            }
            var object = {player: player, point: point};
            if (!this.addPosition(object)) {
                return null;
            }
            this.ctx.beginPath();
            this.ctx.fillStyle = player.color;
            this.ctx.arc(point.x, point.y, this.radius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
            if (this.over(object)) {
                alert("玩家：" + player.name + "获得胜利");
            }
            return point;
        },
        /**
         * 绘制提示点
         * @param points
         */
        noticeReact: function(points) {
            this.ctx.strokeStyle = "#f4645f";
            for (var i in points) {
                var m = points[i];
                this.ctx.strokeRect(
                    m.x - (this.radius / 2), m.y - (this.radius / 2), this.size - this.radius, this.size - this.radius
                );
            }
            return null;
        },

        /**
         * 转换坐标
         * @param point
         * @returns {*}
         */
        roundCirclePoint: function(point) {
            var x = Math.floor((point.x - this.radius) / this.size),
                y = Math.floor((point.y - this.radius) / this.size),
                circle = [];
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            //查找附近四个圆点中心
            for(var i = x; i <= x+1; i++) {
                for(var j = y; j <= y+1; j++) {
                    circle.push({
                        x: i * 50 + this.radius,
                        y: j * 50 + this.radius
                    });
                }
            }
            for (var index in circle) {
                var m = circle[index];
                var distance = Math.pow(m.x - point.x, 2) + Math.pow(m.y - point.y, 2);
                //计算点是否在圆内
                if (distance < Math.pow(this.radius, 2)) {
                    return m;
                }
            }
            return circle;
        },
        /**
         * 判断游戏结束
         * 通过判断当前棋子的八向连续相同的四子，或者正反方向的连续相同的棋子的和大于四
         * @param object
         * @returns {boolean}
         */
        over: function(object) {
            var player = object.player,
                point  = object.point,
                x = Math.floor(point.x / this.size),
                y = Math.floor(point.y / this.size),
                position = this.getPosition(),
                hx = vy = sh = sv = _hx = _vy = _sh = _sv = 0;
            for (var i = 1; i <= 4; i++) {
                if (x+i < this.standard && position[y][x+i] && position[y][x+i].player === player && (i - hx) === 1) {
                    hx++;
                }
                if (y+i < this.standard && position[y+i][x] && position[y+i][x].player === player && (i - vy) === 1) {
                    vy++;
                }
                if (y+i < this.standard && x+i < this.standard && position[y+i][x+i] && position[y+i][x+i].player === player && (i - sv) === 1) {
                    sv++;
                }
                if (y+i < this.standard && x-i > -1 && position[y+i][x-i] && position[y+i][x-i].player === player && (i - sh) === 1) {
                    sh++;
                }
            }
            for (var i = -1; i >= -4; i--) {
                if (x+i > -1 && position[y][x+i] && position[y][x+i].player === player && (i + _hx) === -1) {
                    _hx++;
                }
                if (y+i > -1 && position[y+i][x] && position[y+i][x].player === player && (i + _vy) === -1) {
                    _vy++;
                }
                if (y+i > -1 && x+i > -1 && position[y+i][x+i] && position[y+i][x+i].player === player && (i + _sv) === -1) {
                    _sv++;
                }
                if (y+i > -1 && x-i < this.standard && position[y+i][x-i] && position[y+i][x-i].player === player && (i + _sh) === -1) {
                    _sh++;
                }
            }
            return hx + _hx >= 4 || vy + _vy >= 4 || sv + _sv >= 4 || sh + _sh >= 4;
        }
    };
    /**
     *
     * @param name
     * @constructor
     */
    function Player(name, color, chess) {
        this.name = name;
        this.color = color;
        this.state = 'waitStart';
        var x = y = 0;
        this.setXY = function(xv, yv) {x = xv; y = yv;};
        this.getXY = function() {return {x: x, y: y};};
        this.chess = chess;
    }
    Player.prototype = {
        /**
         *
         */
        playChess: function() {
            if (this.state === 'waiting' || this.state === 'waitStart' || this.state === 'waitPlay') {
                return ;
            }
            var circlePoint = this.chess.draw(this);
            if (circlePoint !== null) {
                Events.trigger("notify", ctrl, this);
            } else {
                this.updateState("waitPlay");
            } 
        },
        updateState: function(state) {
            this.state = state;
        },
        getState: function() {
            return this.state; 
        }
    };
    function Control() {
        this.player = [];        
    };
    Control.prototype = {
        addPlayer: function(player) {
            this.player.push(player);
        },
        getPlaying: function() {
            for (var i in this.player) {
                var state = this.player[i].getState();
                if (state === 'waitPlay') {
                    return this.player[i];
                }
            }   
            var player = this.player[0];
            player.updateState("waitPlay");
            return player;
        },
        notify: function(player) {
            for (var i in this.player) {
                if (this.player[i] !== player) {
                    this.player[i].updateState("waitPlay");
                } else {
                    this.player[i].updateState("waiting");
                }
            }
        },
        getPlayer: function() {
            return this.player;
        }
    };
    var desk = new Desk(19);
    var chess = new Chess(desk);
    var playerOne = new Player("Tom", "#FFF", chess);
    var playerTwo = new Player("Seven", "#000", chess);
    var ctrl = new Control();
    ctrl.addPlayer(playerOne);
    ctrl.addPlayer(playerTwo);
    desk.draw();
    Events.on('click', function(e) {
        var player = ctrl.getPlaying();
        player.updateState("playing");
        player.setXY(e.offsetX, e.offsetY);
        player.playChess();
    }, desk.getCanvas());
    Events.on("notify", function(player) {
        ctrl.notify(player);
    });
}());