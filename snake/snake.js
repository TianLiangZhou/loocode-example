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

        },
        inArray: function(array, position) {
            if (array.includes) {
                return array.includes(position);
            }
            if (array.indexOf(position) >= 0) {
                return true;
            }
            return false;
        }
    };

    var _listening = [];
    var Events = {
        on: function(type, callback, element) {
            var ele = element || window;
            var listener = ele.addEventListener || function(type, callback) {
                element.attachEvent("on" + type, callback);
            };
            listener(type, callback);
            _listening.push({'event': type, 'element': element, 'callback': callback});
        },
        remove: function(type, element, callback) {
            var ele = element || window;
            var listener = ele.removeEventListener || ele.detachEvent;
            listener('on' + type, callback);
        },
        trigger: function(type, object, options) {
            for (var i in _listening) {
                if (_listening[i].event === type) {
                    _listening[i].callback.apply(object || window, options || []);
                }
            }
        }
    };

    var Snake = function(options, point) {
        var defaults = {
                grid: 30,
                color: "green",
                x: 0,
                y: 0,
                direct: 'left',
                sourceColor: '#FFF'
            },
            length = 1;
        this.options = _.merge(defaults, options);
        var gridSize = this.options.x * this.options.y,
            snakeLocus = [],
            endLocus = null,
            over = false;
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
        this.push = function(value) {
            snakeLocus.push(value);
        };
        this.pop = function() {
            endLocus = snakeLocus.pop();
        };
        this.unshift = function(value) {
            snakeLocus.unshift(value);
        };
        this.getEndLocus = function() {
            return endLocus;
        };
        this.getPoint = function() {
            return point;
        };
        this.length = function() {
            return length;
        };
        this.incremnt = function() {
            length++;
        };
        create.call(this);
        this.create();
    };

    Snake.prototype = {
        create: function() {
            var locus = this.getSnakeLocus(),
                endLocus = this.getEndLocus();
                point  = this.getPoint();
            for (var i in locus) {
                document.getElementById('grid_' + locus[i]).style.backgroundColor = this.options.color;
            }
            if (point.getPosition() === locus[0]) {
                this.eat(endLocus);
            } else {
                if (endLocus) {
                    document.getElementById('grid_' + endLocus).style.backgroundColor = this.options.sourceColor;
                }
            }
        },
        move: function() {
            var locus = this.getSnakeLocus(),
                direct = this.getDirection(),
                first = locus[0],
                isOver = false;
            switch (direct) {
                case 'left':
                    first -= 1;
                    if (first % this.options.x === 0) isOver = true;
                    break;
                case 'up':
                    first -= this.options.x;
                    if (first < 0) isOver = true;
                    break;
                case 'right':
                    first += 1;
                    if (first % this.options.x === 1) isOver = true;
                    break;
                case 'down':
                    first += this.options.x;
                    if (first > (this.options.x * this.options.y)) isOver = true;
                    break;
            }
            if (isOver) {
                Events.trigger('over', this);
            } else {
                this.pop();
                this.unshift(first);
                this.create();
            }
        },
        eat: function(end) {
            this.push(end);
            this.getPoint().random(this.getSnakeLocus());
            this.incremnt();
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
        this.setPosition = function (outer) {
            position = Math.floor(Math.random() * gridSize + 1);
            if (outer.length > 0) {
                if (_.inArray(outer, position)) {
                    this.setPosition(outer);
                }
            }
        };
        this.getPosition = function() {
            return position;
        };
        this.random([]);
    };
    Point.prototype = {
        random: function(outer) {
            this.setPosition(outer);
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
            this.snake = new Snake(
                _.merge(common, this.options.snake),
                new Point(_.merge(common, this.options.point))
            );
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
            time: 500
        };
        var frame = new Frame();
        var clock = null;
        this.move = function() {
            clock = setInterval(
                function() {
                    frame.snake.move.call(frame.snake);
                },
                defaults.time
            );
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
                    //暂停
                case 19:
                    break;

            }
        });
        Events.on('over', function() {
            clearInterval(clock);
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