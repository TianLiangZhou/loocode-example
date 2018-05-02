(function(global) {




    function Socket() {
        var isConnection = false, _this = this;
        var connection = function() {
            var host = location.host;
            if (host === "localhost") {
                host = "192.168.56.101";
            }
            return new WebSocket("ws://" + host + ":9527");
        };

        this.reconnect = function() {
            this.socket = connection();
            this.socket.onopen = function () {
                isConnection = true;
                if (_this.openCallback) {
                    _this.openCallback.call(_this);
                }
            };
            this.socket.onmessage = function(event) {
                _this.response(event);
            };
            this.socket.onclose = function() {
                isConnection = false;
            };
        };
        this.response = function(event) {
            var response = null;
            try {
                response = JSON.parse(event.data);
            } catch (e) {
                console.log(e);
            }
            if (typeof response.body === "object" && response.body !== undefined) {
                var requestId = response.body.requestId;
                var callback = this.getRequestCallback(requestId);
                if (callback !== undefined) {
                    callback.call(_this, response.body);
                }
            }
        };
        this.isConnection = function() {
            return isConnection;
        };
        this.requestCallback = {};
        this.openCallback = null;
    }

    Socket.prototype = {
        addRequestCallback: function (id, callback) {
            this.requestCallback[id] = callback;
        },
        getRequestCallback: function(id) {
            if (this.requestCallback.hasOwnProperty(id)) {
                return this.requestCallback[id];
            }
            return undefined;
        },
        onOpenCallback: function(callback) {
            if (callback !== undefined && callback !== null) {
                this.openCallback = callback;
            }
        },
        send: function(protocol, body, callback) {
            var requestId = new Date().getTime();
            if (body === undefined || body === null) {
                body = {requestId: requestId};
            } else {
                body.requestId = requestId;
            }
            var requestBody = {
                "protocol": protocol,
                "body": body
            };
            if (!this.isConnection()) {
                this.reconnect();
            }
            if (callback !== undefined) {
                this.addRequestCallback(requestId, callback);
            }
            this.socket.send(JSON.stringify(requestBody));
        }
    };



    function Landowner() {
        var _landowner = this;
        this.app = new PIXI.Application(
            window.innerWidth,
            window.innerHeight,
            {
                backgroundColor: 0x1099bb,
            }
        );
        this.container = new PIXI.Container();
        this.container.y = window.innerHeight / 2 + 100;
        this.container.x = window.innerWidth / 2 - 254;
        this.app.stage.addChild(this.container);
        this.socket = new Socket();
        this.socket.onOpenCallback(function() {
            this.send("enter.room", {}, function (body) {
                console.log(body);
                if (body.flag === 0) {
                    _landowner.ready();
                } else {
                    alert('连接人数过多');
                }
            });
        });
    }

    Landowner.prototype = {
        start: function () {
            document.body.appendChild(this.app.view);
            this.socket.reconnect();
        },
        ready: function () {
            var _this = this;
            var button = new PIXI.Graphics()
                .beginFill(0x2fb44a)
                .drawRoundedRect(0, 0, 120, 60, 10)
                .endFill();
            var readyText = new PIXI.Text("准备", new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 32,
                fill: "white",
            }));
            readyText.x = 60 - 32;
            readyText.y = 30 - 16;
            button.addChild(readyText);
            button.interactive = true;
            button.buttonMode = true;
            var clickCounter = 1;
            button.on('pointertap', function () {
                var ready = 0;
                if (clickCounter % 2) {
                    readyText.text = "取消";
                    ready = 1;
                } else {
                    readyText.text = "准备";
                }
                clickCounter++;
                _this.socket.send('player.ready', {
                    'ready': ready
                }, function (body) {
                    console.log(body);
                });
            });
            button.x = window.innerWidth / 2 - 60;
            button.y = window.innerHeight / 2;
            this.app.stage.addChild(button);
        },
        licensing: function () {
            var createPoker = function () {
                var i = 1;
                return function (index) {
                    var poker = PIXI.Sprite.fromImage('poker/' + index + '.jpg');
                    poker.interactive = true;

                    // Shows hand cursor
                    poker.buttonMode = true;
                    poker.x = i * 20;
                    var clickCounter = 1;
                    poker.on('pointerdown', function () {
                        if (clickCounter % 2) {
                            poker.y = -20
                        } else {
                            poker.y = 0;
                        }
                        clickCounter++;
                    });
                    i++;
                    return poker;
                }
            };
            var indexArray = [];
            var randomPoker = function () {
                var index = Math.floor((Math.random() * 54) + 1)
                if (indexArray.lastIndexOf(index) >= 0) {
                    return randomPoker();
                }
                indexArray.push(index);
                return index;
            }
            for (var i = 1; i <= 17; i++) {
                randomPoker()
            }
            indexArray.sort(function (a, b) {
                var o = a % 13, t = b % 13;
                if (o >= 0 && o <= 2) {
                    o = 13 + o;
                }
                if (t >= 0 && t <= 2) {
                    t = 13 + t;
                }
                if (a == 53) o = 16;
                if (a == 54) o = 17;
                if (b == 53) t = 16;
                if (b == 54) t = 17;

                if (o > t) {
                    return -1;
                }
                if (o < t) {
                    return 1;
                }
                return 0;
            });
            var createFactory = createPoker();
            for (var key in indexArray) {
                this.container.addChild(createFactory(indexArray[key]));
            }
        }
    };

    if (typeof exports === "object") {
        exports.Landowner = Landowner;
    } else {
        global.Landowner = Landowner;
    }
})(window);
