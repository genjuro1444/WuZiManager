(function() {
    var d = document,
        w = window;
    w.LoginConnect = {
        loginname: null,
        url: null,
        guid: null,
        socket: null,
        socketserver: null,
        systemtype: 'appcustomer',
        submit: function() {
            var obj = {
                loginname: this.loginname,
                guid: this.guid,
                url: this.url,
                systemtype: this.systemtype
            };
            this.socket.emit('message', obj);
            return false;
        },
        logout: function() {
            this.socket.disconnect();
        },
        init: function(options) {
            this.loginname = options.loginname;
            this.url = options.url;
            this.guid = options.guid;
            this.socketserver = "ws://" + options.socketserverurl;
            //连接websocket后端服务器 
            this.socket = io.connect(this.socketserver);

            //告诉服务器端有用户登录 
            this.socket.emit('login', { loginname: this.loginname, url: this.url, guid: this.guid });

            ////监听消息发送 
            this.socket.on('message', function(obj) {
                var canpop = false;
                if (obj.systemtype == LoginConnect.systemtype &&obj.loginname == LoginConnect.loginname && obj.url == LoginConnect.url && obj.guid != LoginConnect.guid) {
                    canpop = true;
                }
                if (canpop) {
                    LoginConnect.logout();
                    api.removePrefs({ key: 'uid' });
                    api.removePrefs({ key: 'familyuid' });
                    api.sendEvent({
                        name: 'logout_complete'
                    });
                    api.alert({
                        title: '提示',
                        msg: '帐号已在别处登录，你将被强迫下线（请保管好自己的用户密码）！',
                    });
                }
            });
        }
    };
})();