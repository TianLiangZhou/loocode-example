/**
 * Created by zhoutianliang on 2017/9/23.
 */

(function(){

    var _ = {
        merge: function(source, child) {
            for (var key in child) {
                source[key] = child[key];
            }
            return source;
        },
        extend: function(source, parent, pro) {

        }
    };

    var Events = {
        on: function(type, callback, element) {
            var ele = element || window;
            var listener = ele.addEventListener || function(type, callback) {
                element.attachEvent("on" + type, callback);
            };
            listener(type, callback);
        },
        remove: function(type, element, callback) {
            var ele = element || window;
            var listener = ele.removeEventListener || ele.detachEvent;
            listener('on' + type, callback);
        }
    };

    var Snake = function(options) {
        var defaults = {
                grid: 30,
                color: "green",
                x: 0,
                y: 0,
                direct: 'left'
            },
            length = 1;
        this.options = _.merge(defaults, options);
        var gridSize = this.options.x * this.options.y;
        var snakeLocus = [];
        var create = function() {
            var start = gridSize / 2;
            snakeLocus.push(start);
        };
        var direct = this.options.direct;
        this.setDirection = function(value) {
            direct = value;
        };
        this.getDirection = function() {
            return direct;
        };
        this.getSnakeLocus = function() {
            return snakeLocus;
        };
        this.addSnakeLocus = function(value) {
            snakeLocus.push(value);
        };
        create.call(this);
        this.create();
    };

    Snake.prototype = {
        create: function() {
            var points = this.getSnakeLocus();
            for (var i in points) {
                var point = document.getElementById('grid_' + points[i]);
                point.style.backgroundColor = this.options.color;
            }
        },
        move: function() {
            var locus = this.getSnakeLocus(),
                len = points.length,
                direct = this.getDirection(),
                newLocus = [];
            for (var i = 0; i < len; i++) {
                var value = locus[i];
                switch (direct) {
                    case 'left':
                        value -= 1;
                        break;
                    case 'up':
                        value -= this.options.x;
                        break;
                    case 'right':
                        value += 1;
                        break;
                    case 'down':
                        value += this.options.x;
                        break;
                }
            }
        },
        eat: function() {

        }
    };

    var Point = function(options) {
        var defaults = {
            color: "red",
            size: 0,
            x: 0,
            y: 0
        };
        this.options = _.merge(defaults, options);
        var gridSize = this.options.x * this.options.y,
            position = 0;
        this.setPosition = function () {
            position = Math.floor(Math.random() * gridSize + 1);
        };
        this.getPosition = function() {
            return position;
        };
        this.random();
    };
    Point.prototype = {
        random: function() {
            this.setPosition();
            var position = this.getPosition();
            var grid = document.getElementById("grid_" + position);
            grid.style.backgroundColor = this.options.color;
        }
    }

    var Frame = function(options) {
        var defaults = {
                width: 900,
                height: 500,
                grid: 30,
                snake: {},
                point: {}
            };
        this.options = _.merge(defaults, options);
        var wh = this.options.grid,
            x = Math.floor(this.options.width / (wh + 2)),
            y = Math.floor(this.options.height / (wh + 2));
        this.options.x = x;
        this.options.y = y;
        this.snake = null;
        this.point = null;
    }
    Frame.prototype = {
        create: function() {
            var element = document.createElement('div');
            element.style.margin = "50px auto";
            element.style.height = this.options.height + "px";
            element.style.width  = this.options.width + "px";
            element.style.position = "relative";
            var grids = this.createGrid();
            for(var i in grids) {
                element.appendChild(grids[i]);
            }
            document.body.appendChild(element);
            var common = {
                x: this.options.x,y: this.options.y, size: this.options.grid
            };
            this.snake = new Snake(_.merge(common, this.options.snake));
            this.point = new Point(_.merge(common, this.options.point));
        },
        createGrid: function() {
            var x = this.options.x,
                y = this.options.y,
                wh = this.options.grid,
                grids = [];
            for (var i = 1; i <= y; i++) {
                for (var j = 1; j <= x; j++) {
                    var element = document.createElement('div');
                    element.style.width = wh + "px";
                    element.style.height = wh+ "px";
                    element.setAttribute('id', "grid_" + (i * x - x + j));
                    element.style.border = "1px dotted #ddd";
                    if (i !== 1) {
                        element.style.borderTop = "none";
                    }
                    if (j !== 1) {
                        element.style.borderLeft = "none";
                    }
                    element.style.float = "left";
                    grids.push(element);
                }
            }
            return grids;
        }
    };
    var Control = function(options) {
        var defaults = {
            time: 1000
        };
        var frame = new Frame();
        var clock = null;
        this.move = function() {
            clock = setInterval(frame.snake.move, defaults.time);
        };
        Events.on("keyup", function(e) {
            switch (e.which) {
                case 37:
                    frame.snake.setDirection('left');
                    break;
                case 38:
                    frame.snake.setDirection('up');
                    break;
                case 39:
                    frame.snake.setDirection('right');
                    break;
                case 40:
                    frame.snake.setDirection('down');
                    break;
            }
        });
        frame.create();
    };
    Control.prototype = {
        start: function() {
            this.move();
        }
    };
    new Control().start();
}());