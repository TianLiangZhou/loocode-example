(function(global) {

    function Socket() {
        var isConnection = false, _this = this;
        var connection = function() {
            var host = location.host;
            if (host !== "example.loocode.com") {
                host = "192.168.56.101";
            }
            if (location.protocol === "https:") {
                return new WebSocket("wss://" + host + "/websocket");
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
            this.socket.onerror = function(e) {
                alert("connection websocket error！");
            };
        };
        this.response = function(event) {
            var response = null;
            try {
                response = JSON.parse(event.data);
            } catch (e) {
                console.log(e);
            }
            console.log(response);
            if (typeof response.body === "object" && response.body !== undefined) {
                var requestId = response.body.requestId;
                var callback = this.getRequestCallback(requestId);
                if (callback !== undefined) {
                    callback.call(_this, response.body);
                }
            }
            if (typeof response.listen === "string" && response.listen !== undefined) {
                if (_this.listeners.hasOwnProperty(response.listen)) {
                    _this.listeners[response.listen].call(_this, response.content);
                }
            }
        };
        this.isConnected = function() {
            return isConnection;
        };
        this.close = function() {
            if (this.isConnected()) {
                this.socket.close();
            }
        };
        this.requestCallback = {};
        this.listeners = {};
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
        listen: function (name, callback) {
            this.listeners[name] = callback;
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
            if (!this.isConnected()) {
                this.reconnect();
            }
            if (callback !== undefined) {
                this.addRequestCallback(requestId, callback);
            }
            this.socket.send(JSON.stringify(requestBody));
        }
    };



    function Landowner() {
        this.app = new PIXI.Application(
            window.innerWidth,
            window.innerHeight,
            {
                backgroundColor: 0x1099bb,
            }
        );
        this.socket = new Socket();
        this.playerCount = 0;
        this.player = 0; //用户id
        this.playerReadyButton = {};
        this.playId = 0; //当前牌局id,
        this.userPoker = []; //用户的牌
        this.landownerPoker = []; //当前底牌
    }

    Landowner.prototype = {
        start: function () {
            document.body.appendChild(this.app.view);
            this.listen();
        },
        initRender: function (landowner) {
            /**
             * @var landowner Landowner
             */
            if (this.socket.isConnected()) {
                this.socket.send('room.player', {}, function(body) {
                    if (body.count > 3) {
                        return ;
                    }
                    landowner.playerCount = body.count;
                    for (var i = 0; i < body.player.length; i++) {
                        landowner.readyWorker(i + 2, !!body.player[i].ready, body.player[i].playerId);
                    }
                    this.send("enter.room", {}, function (body) {
                        if (body.flag === 0) {
                            landowner.player = body.player;
                            landowner.readyWorker(1, false, body.player);
                        }
                    });
                });
            }
        },
        listen: function() {
            var _this = this;
            this.socket.listen("enterRoom", function (content) {
                _this.playerCount++;
                _this.readyWorker(_this.playerCount, false, content);
            });
            this.socket.listen("readyStatus", function (content) {
                /**
                 * @var button Graphics
                 */
                var button = _this.playerReadyButton[content.playerId];
                var text = button.getChildByName('text');
                text.text = content.ready ? "准备中" : "准备";
                if (content.ready) {
                    text.x = 60 - 48;
                }
            });
            this.socket.listen("assignPoker", function (content) {
                _this.playId = content.playId;
                _this.renderBottomCard(content.landowner);
                _this.assignPoker(content.poker);
                _this.userPoker = content.poker;
                _this.landownerPoker = content.landowner;
                for (var key in _this.playerReadyButton) {
                    _this.playerReadyButton[key].destroy();
                }
                _this.assignOtherPoker(content.poker.length);
            });
            this.socket.listen("grabLandowner", function () {
                _this.grabWorker();
            });
            this.socket.onOpenCallback(function() {
               _this.initRender(_this);
            });
            this.socket.reconnect();
            this.listenClose();
        },
        listenClose: function() {
            window.addEventListener("beforeunload", function (e) {
                var confirmationMessage = "确定关闭";
                (e || window.event).returnValue = confirmationMessage;
                return confirmationMessage;
            });
            window.addEventListener("unload", function (e) {
                var confirmationMessage = "确定关闭";
                (e || window.event).returnValue = confirmationMessage;
                return confirmationMessage;
            });
        },
        readyWorker: function (offset, state, playId) {
            var _this = this;
            var button = new PIXI.Graphics()
                .beginFill(0x2fb44a)
                .drawRoundedRect(0, 0, 120, 60, 10)
                .endFill();
            var text = "准备";
            if (state === true) {
                text = "准备中";
            }
            var readyText = new PIXI.Text(text, new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 32,
                fill: "white",
            }));
            readyText.x = 60 - (text === "准备中" ? 48 : 32);
            readyText.y = 30 - 16;
            readyText.name = "text";
            button.addChild(readyText);
            button.interactive = true;
            button.buttonMode = true;
            var clickCounter = 1;
            if (offset === 1) {
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
                        if (body.grab !== undefined && body.grab === 1) { //说明全部准备，渲染后显示。抢地主，不抢按钮
                            _this.grabWorker();
                        }
                    });
                });
            }
            var x = y = 0;
            y = window.innerHeight / 2;
            x = window.innerWidth / 2;
            if (offset === 2) {
                x = x + (x / 2);
                y = y - (y / 2);
            } else if (offset === 3) {
                x = x - (x / 2) - 60;
                y = y - (y / 2);
            } else {
                x = x - 60;
                y = y + (y / 2);
            }
            button.x = x;
            button.y = y;
            this.playerReadyButton[playId] = button;
            this.app.stage.addChild(button);
        },
        grabWorker: function () {
            var _this = this;
            var button = new PIXI.Graphics()
                .beginFill(0x2fb44a)
                .drawRoundedRect(0, 0, 120, 60, 10)
                .endFill();
            var noGrabButton = new PIXI.Graphics()
                .beginFill(0x2fb44a)
                .drawRoundedRect(0, 0, 120, 60, 10)
                .endFill();

            var grab = new PIXI.Text("抢地主", new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 32,
                fill: "white",
            }));
            var noGrab = new PIXI.Text("不抢", new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 32,
                fill: "white",
            }));
            grab.x = 60 - 48;
            grab.y = 30 - 16;
            grab.name = "grab";
            noGrab.x = 60 - 32;
            noGrab.y = 30 - 16;
            noGrab.name = "noGrab";
            button.interactive = true;
            button.buttonMode = true;
            noGrabButton.interactive = true;
            noGrabButton.buttonMode = true;
            button.addChild(grab);
            noGrabButton.addChild(noGrab);
            var playerGrab = function (grab) {
                return function() {
                    _this.socket.send('player.grab', {
                        'grab': grab, 'playId': _this.playId
                    }, function (body) {
                        if (body.flag === 0) { //抢成功
                            _this.userPoker.concat(_this.landownerPoker); //合并牌
                            _this.app.stage.getChildByName('poker').destroy(); //删除牌
                            _this.assignPoker(_this.userPoker); //重新整理牌
                        }
                        button.destroy();
                        noGrabButton.destroy();
                    });
                }
            };
            button.on('pointertap', playerGrab(1));
            noGrabButton.on('pointertap', playerGrab(0));
            var x = y = 0;
            y = window.innerHeight / 2;
            x = window.innerWidth / 2;
            x = x - 200;
            y = y + 10;
            button.x = x;
            button.y = y;
            noGrabButton.x = x + 200;
            noGrabButton.y = y;
            this.app.stage.addChild(button);
            this.app.stage.addChild(noGrabButton);
        },
        renderBottomCard: function (poker) {
            var container = new PIXI.Container();
            container.y = 100;
            container.x = window.innerWidth / 2 - 254;
            this.app.stage.addChild(container);
            for (var key in poker) {
                var bottomPoker = PIXI.Sprite.fromImage('poker/' + poker[key] + '.jpg');
                bottomPoker.x = key * 125;
                container.addChild(bottomPoker);
            }
        },
        assignPoker: function (poker) {
            console.log(poker);
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
            poker.sort(function (a, b) {
                var o = a % 13, t = b % 13;
                if (o >= 0 && o <= 2) {
                    o = 13 + o;
                }
                if (t >= 0 && t <= 2) {
                    t = 13 + t;
                }
                if (a === 53) o = 16;
                if (a === 54) o = 17;
                if (b === 53) t = 16;
                if (b === 54) t = 17;

                if (o > t) {
                    return -1;
                }
                if (o < t) {
                    return 1;
                }
                return 0;
            });
            var container = new PIXI.Container();
            container.y = window.innerHeight / 2 + 100;
            container.x = window.innerWidth / 2 - 254;
            this.app.stage.addChild(container);
            var createFactory = createPoker();
            for (var key in poker) {
                container.addChild(createFactory(poker[key]));
            }
            container.name = "poker";
        },
        assignOtherPoker: function(count) {
            var containerRight = new PIXI.Container(),
                containerLeft = new PIXI.Container();
            containerRight.x = window.innerWidth - 200 - 105;
            containerRight.y = 150;
            containerLeft.x = 200;
            containerLeft.y = 150;
            this.app.stage.addChild(containerLeft);
            this.app.stage.addChild(containerRight);
            for (var i = 0; i < count; i++) {
                var pokerSource1 = PIXI.Sprite.fromImage('poker/background.jpg');
                var pokerSource2 = PIXI.Sprite.fromImage('poker/background.jpg');
                pokerSource1.y = i * 20;
                pokerSource2.y = i * 20;
                containerLeft.addChild(pokerSource1);
                containerRight.addChild(pokerSource2);
            }
        }
    };

    if (typeof exports === "object") {
        exports.Landowner = Landowner;
    } else {
        global.Landowner = Landowner;
    }
})(window);
