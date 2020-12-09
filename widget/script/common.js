
window.Foresight = window.Foresight || {};
(function(ns) {
    ns.Util = {};
    ns.Util.JsonResponseCode = {
        UNAUTHORIZED: -100,
        SUCCEED: 0
    };
    ns.Util.getQueryString = function(key, url) {
        var vars = [],
            hash;
        var pageurl = url || window.location.href;
        var hashes = pageurl.slice(pageurl.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = window.decodeURIComponent(hash[1]);
        }
        return !!key ? vars[key] : vars;
    };
    ns.Util.getQueryURL = function(url) {
        var vars = [],
            hash;
        var pageurl = url || window.location.href;
        var hashes = pageurl.split('?');
        if (hashes.length > 1) {
            return hashes[0];
        }
        return pageurl;
    };
    ns.Util.api_ajax = function(options) {
        var post_form = options.data;
        var opt = null;
        if (/post/ig.test(options.type)) {
            opt = {
                url: options.url,
                method: options.type,
                cache: false,
                dataType: 'json',
                data: {
                    values: post_form,
                    files: options.files || {}
                }
            };
        } else {
            var arr = [];
            for (var key in post_form) {
                arr.push(key + '=' + encodeURIComponent(post_form[key]));
            }
            if (arr.length) {
                if (!/\?/.test(url)) {
                    url = options.url + '?' + arr.join('&');
                } else {
                    if (/[\?\&]$/.test(url)) {
                        url = options.url + arr.join('&');
                    } else {
                        url = options.url + '&' + arr.join('&');
                    }
                }
            }
            opt = {
                url: options.url,
                method: options.type || 'get',
                cache: false,
                dataType: 'json'
            };
        }
        var toast = null;
        if (options.toast) {
            toast = new auiToast();
            options.toastmsg = options.toastmsg || '加载中';
            toast.loading({
                title: options.toastmsg,
                duration: 2000
            }, function(ret) {});
        }
        api.ajax(opt, function(ret, err) {
            if (options.toast) {
                toast.hide();
            }
            if (ret) {
                data = ret;
                if (data == undefined || data == null) {
                    try {
                        console.error(options.url);
                    } catch (e) {}
                    throw new Error("Ajax response null.");
                } else if (typeof data.Code == "undefined") {
                    try {
                        console.error(data);
                    } catch (e) {}
                    throw new Error("Incorrect json data.");
                }
                if (data.Code == ns.Util.JsonResponseCode.UNAUTHORIZED) {
                    ns.Util.removePrefs([], true);
                    if (options.needlogin) {
                        ns.Util.open_login(options);
                        return;
                    }
                    api.sendEvent({
                        name: 'onlogin'
                    });
                } else if (data.Code == ns.Util.JsonResponseCode.SUCCEED) {
                    if (typeof options.success == "function")
                        options.success.call(this, data.Result, null); //调用指定的成功处理函数
                } else if (data.Code < 0) {
                    if (typeof options.error == 'function')
                        options.error.call(this, data.Error, null); //调用指定的错误处理函数
                } else {
                    throw new Error("Unknown json code: " + data.Code + ".");
                }
            } else {
                if (err.code == 0) {
                    if (api.toast) {
                        api.toast({
                            msg: '当前服务不可用，请稍后再试',
                            duration: 5000,
                            location: 'bottom'
                        });
                    }
                } else if (err.code == 1) {
                    if (api.toast) {
                        api.toast({
                            msg: '连接服务器超时',
                            duration: 5000,
                            location: 'bottom'
                        });
                    }
                } else if (err.code == 2) {
                    if (api.toast) {
                        api.toast({
                            msg: '授权错误',
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                } else if (err.code == 3) {
                    if (api.toast) {
                        api.toast({
                            msg: '数据类型错误',
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                }
                if (typeof options.error == 'function') {
                    options.error.call(this, '', null);
                }
            }
        });
    }
    ns.Util.ajax = function(options) {
        options.url = CONFIG.apiurl;
        if (options.data.islogin) {
            ns.Util.api_ajax(options);
        } else {
            var uid = ns.Util.getPrefs('uid');
            if (!uid) {
                options.needlogin = false;
                ns.Util.open_login(options);
                return;
            }
            var BranchCode = ns.Util.Get_Branch_Code();
            if (!options.data.branchcode) {
                options.data.branchcode = BranchCode;
            }
            options.data = ns.Util.extend(options.data, {
                device: api.deviceId,
                uid: uid
            });
            ns.Util.api_ajax(options);
        }
    };
    ns.Util.extend = function(o, n) {
        for (var p in n) {
            if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p)))
                o[p] = n[p];
        }
        return o;
    };
    ns.Util.post = function(data, callback, options) {
        if (!options) {
            options = {};
        }
        return ns.Util.ajax(ns.Util.extend(options, {
            cache: false,
            success: function(result, textStatus) {
                if (typeof callback == "function") callback(true, result, null);
            },
            error: function(err, textStatus) {
                if (typeof callback == "function") callback(false, null, err);
            },
            url: (options && options.url) || '',
            data: data,
            type: 'POST'
        }));
    };
    //callback: funtion(succeed,data,error){};
    ns.Util.get = function(data, callback, options) {
        if (!options) {
            options = {};
        }
        return ns.Util.ajax(ns.Util.extend(options, {
            cache: false,
            success: function(result, textStatus) {
                if (typeof callback == "function") callback(true, result, null);
            },
            error: function(err, textStatus) {
                if (typeof callback == "function") callback(false, null, err);
            },
            url: (options && options.url) || '',
            data: data,
            type: 'GET'
        }));
    };
    ns.Util.openWin = function(name, title, pageParam, options) {
        var type = ns.Util.getQueryString('type', name);
        name = ns.Util.getQueryURL(name);
        if (!pageParam || pageParam == null) {
            pageParam = {
                title: title,
                url: name + '.html'
            };
        }
        if (type) {
            pageParam.type = type;
        }
        if (!pageParam.title) {
            pageParam.title = title;
        }
        if (!pageParam.url) {
            pageParam.url = name + '.html'
        }
        var delay = 0;
        if (api.systemType != 'ios') {
            delay = 100;
        }
        var url = '../frame.html';
        if (options && options.ismain) {
            url = 'frame.html';
        }
        if (options && options.needlogin) {
            var ismain = (options && options.ismain) || false;
            var uid = ns.Util.getPrefs('uid');
            options.needlogin = false;
            if (uid) {
                ns.Util.openWin(name, title, pageParam, options);
            } else {
                ns.Util.open_login(options);
            }
            return;
        }
        api.openWin({
            name: name,
            url: url,
            delay: delay,
            useWKWebView: false,
            historyGestureEnabled: true,
            slidBackEnabled: true,
            vScrollBarEnabled: false,
            allowEdit: true,
            pageParam: pageParam,
            rect: {
                x: 0,
                y: 0,
                w: 'auto',
                h: 'auto'
            }
        });
    }
    ns.Util.openFrame = function(name, url, options, pageParam) {
        var x = 0,
            y = 0,
            w = 'auto',
            h = 'auto';
        var frameOptions = {
            name: name,
            url: url,
            bounces: false,
            rect: {
                x: x,
                y: y,
                w: w,
                h: h
            }
        };
        if (options) {
            x = options.x || 0;
            y = options.y || 0;
            w = options.w || 'auto';
            h = options.h || 'auto';
            if (options.type) {
                var subType = options.subType || 'from_bottom';
                frameOptions.animation = {
                    type: options.type,
                    subType: subType,
                    duration: 300
                }
            }
            frameOptions.rect = {
                x: x,
                y: y,
                w: w,
                h: h
            }
        }
        if (pageParam) {
            frameOptions.pageParam = pageParam;
        }
        api.openFrame(frameOptions)
    }
    ns.Util.open_login = function(options) {
        var that = this;
        var delay = 0;
        if (api.systemType != 'ios') {
            delay = 100;
        }
        var url = '../frame.html';
        if (options && options.ismain) {
            url = 'frame.html';
        }

        api.openWin({
            name: 'login_frm',
            url: url,
            delay: delay,
            useWKWebView: false,
            historyGestureEnabled: true,
            slidBackEnabled: true,
            vScrollBarEnabled: false,
            allowEdit: true,
            pageParam: {
                title: '登录',
                url: 'login_frm.html'
            },
            rect: {
                x: 0,
                y: 0,
                w: 'auto',
                h: 'auto'
            }
        });
    }
    ns.Util.openDirectWin = function(name, url, pageParam) {
        var delay = 0;
        if (api.systemType != 'ios') {
            delay = 100;
        }
        if (!pageParam || pageParam == null) {
            pageParam = {};
        }
        api.openWin({
            name: name,
            url: url,
            delay: delay,
            useWKWebView: false,
            historyGestureEnabled: false,
            slidBackEnabled: false,
            vScrollBarEnabled: false,
            allowEdit: false,
            pageParam: pageParam,
            rect: {
                x: 0,
                y: 0,
                w: 'auto',
                h: 'auto'
            }
        });
    }
    ns.Util.check_mobile = function(phonenumber) {
        var that = this;
        if (!(/^1[3|4|5|7|8|9][0-9]\d{4,8}$/.test(phonenumber))) {
            return false;
        }
        return true;
    }
    ns.Util.toast = function(msg) {
        api.toast({
            msg: msg,
            duration: 2000,
            location: 'bottom'
        });
    }
    ns.Util.getPageParam = function(key) {
        var value = api.pageParam[key] || 0;
        return value;
    }
    ns.Util.confirm = function(options, callback, callback2) {
        var title = options.title || '提示';
        var msg = options.msg || '';
        var buttons = ['确定', '取消'];
        if (options && options.buttons) {
            buttons = options.buttons;
        }
        api.confirm({
            title: title,
            msg: msg,
            buttons: buttons
        }, function(ret, err) {
            if (ret.buttonIndex == 1) {
                if (typeof callback == "function") {
                    callback();
                }
            }
            if (ret.buttonIndex == 2) {
                if (typeof callback2 == "function") {
                    callback2();
                }
            }
        });
    }
    ns.Util.DateFormat = function(time, fmt) {
        if (!time) {
            return '';
        }
        var o = {
            "M+": time.getMonth() + 1, //月份
            "d+": time.getDate(), //日
            "h+": time.getHours(), //小时
            "m+": time.getMinutes(), //分
            "s+": time.getSeconds(), //秒
            "q+": Math.floor((time.getMonth() + 3) / 3), //季度
            "S": time.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };
    ns.Util.Get_Branch_Code = function() {
        return ns.Util.getPrefs('BranchCode');
    }
    ns.Util.Get_Branch_Name = function() {
        return ns.Util.getPrefs('DeptName');
    }
    ns.Util.setAuthActions = function(list) {
        ns.Util.setPrefs({
            'useractions': JSON.stringify(list)
        })
    }
    ns.Util.AllowAuth = function(authcode) {
        var data = ns.Util.getPrefs('useractions');
        if (!data) {
            return 0;
        }
        var list = eval('(' + data + ')');
        if (list == null || !list.length) {
            return 0;
        }
        if (list.indexOf(authcode) <= -1) {
            return 0;
        }
        return 1;
    }
    ns.Util.allPrefsKeys = [
        'location_branchcode',
        'location_deptname',
        'location_buildingid',
        'headimg',
        'uid',
        'UserRealName',
        'BranchCode',
        'DeptName',
        'username',
        // 'searchbar_keywords',
        'useractions',
        'verifycode',
        'codeexpiretime'
    ];
    ns.Util.getPrefs = function(key) {
        return api.getPrefs({
            sync: true,
            key: key,
        });
    }
    ns.Util.setPrefs = function(options) {
        if (!options) {
            return;
        }
        Object.keys(options).forEach(function(key) {
            api.setPrefs({
                key: key,
                value: options[key]
            });
        });
    }
    ns.Util.removePrefs = function(list, removeall) {
        if (removeall) {
            ns.Util.allPrefsKeys.forEach(function(key) {
                api.removePrefs({
                    key: key
                });
            });
            return;
        }
        if (list) {
            list.forEach(function(key) {
                api.removePrefs({
                    key: key
                });
            });
        }
    }
    ns.Util.confirmPer = function(perm, callback) {
        var has = ns.Util.hasPermission(perm);
        var granted = true;
        if (has && has.length > 0) {
            for (var i = 0; i < has.length; i++) {
                if (!has[i].granted) {
                    granted = false;
                }
            }
        }
        if (!granted) {
            api.confirm({
                title: '提醒',
                msg: '没有获得 ' + perm + " 权限\n是否前往设置？",
                buttons: ['去设置', '取消']
            }, function(ret, err) {
                if (1 == ret.buttonIndex) {
                    ns.Util.reqPermission(perm, callback);
                }
            });
            return false;
        }
        if (callback) {
            callback();
        }
        return true;
    };
    ns.Util.hasPermission = function(one_per) {
        if (!one_per) {
            return;
        }
        var perms = new Array();
        perms.push(one_per);
        perms.push('storage');
        var rets = api.hasPermission({
            list: perms
        });
        return rets;
    };
    ns.Util.reqPermission = function(one_per, callback) {
        var perms = new Array();
        perms.push(one_per);
        perms.push('storage');
        api.requestPermission({
            list: perms,
            code: 100001
        }, function(ret, err) {
            if (callback) {
                var list = ret.list;
                if (list && list.length > 0) {
                    var granted = true;
                    for (var i = 0; i < list.length; i++) {
                        if (!list[i].granted) {
                            granted = false;
                        }
                    }
                    if (granted) {
                        callback();
                    }
                }
                return;
            }
            var str = '请求结果：\n';
            str += '请求码: ' + ret.code + '\n';
            str += "是否勾选\"不再询问\"按钮: " + (ret.never ? '是' : '否') + '\n';
            str += '请求结果: \n';
            var list = ret.list;
            for (var i in list) {
                str += list[i].name + '=' + list[i].granted + '\n';
            }
        });
    };
})(window.Foresight);
