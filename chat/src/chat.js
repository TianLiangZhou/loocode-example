require("css/app.css");
global.$ = window.$ = require('jquery');

(function () {
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side, this.user = arg.user;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $message.find(".avatar").html(_this.user);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    function Socket() {
        if (!(this instanceof Socket)) return new Socket();
        var _this = this;
        this.isConnection = false;
        this.message = null;
        this.socket = new WebSocket("ws://192.168.56.101:9527");
        this.socket.onopen = function(event) {
            _this.isConnection = true;
            _this.socket.send("new user");
        }
        this.socket.onmessage = function(event) {
            if (_this.message) _this.message(event.data);
            else console.log(event);
        };
        this.socket.onclose = function() {
            _this.isConnection = false;
        }
    };
    Socket.prototype.send = function(message) {
        if (this.isConnection) {
            this.socket.send(message);
        }   
    }
    Socket.prototype.bind = function(callback) {
        this.message = callback;
    }
    Socket.prototype.close = function() {
        this.socket.close();
    }
    $(function () {
        var getMessageText, message_side, sendMessage, userName, chat;
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text) {
            var $messages, message, messageStruct = JSON.parse(text);
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = userName == messageStruct.user ? 'right' : 'left';
            message = new Message({
                text: messageStruct.message,
                message_side: message_side,
                user: messageStruct.user
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        $('.send_message').click(function (e) {
            var text = getMessageText();
            if (text.trim() === '') return ;
            var message = JSON.stringify({user: userName, message: text});
            chat.send(message);
            return sendMessage(message);
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                var text = getMessageText();
                if (text.trim() === '') return ;
                var message = JSON.stringify({user: userName, message: text});
                chat.send(message);
                return sendMessage(message);
            }
        });
        $(".usernameInput").on("keyup", function(e) {
            var val = $(this).val();
            if (val != "" && e.keyCode == 13) {
                userName = val;
                $(".popup").remove();
                chat = new Socket();
                chat.bind(sendMessage);
            }
        });
        $(window).on("unload", function(e) {
            if (chat) {
                chat.close(); 
                chat = null;
            }
        });
        $(window).on("beforeunload", function(e) {
            if (chat) {
                chat.close(); 
                chat = null;
            }
        });

        /**
        sendMessage('Hello Philip! :)');
        setTimeout(function () {
            return sendMessage('Hi Sandy! How are you?');
        }, 1000);
        return setTimeout(function () {
            return sendMessage('I\'m fine, thank you!');
        }, 2000);
        */
    });
}.call(this));