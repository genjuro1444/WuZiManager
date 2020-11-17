var ns, screenClip;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            qrcodepath: '',
            ID: 0,
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'getmallvisitsharedata',
                ID: that.form.ID
            }, function(succeed, data, err) {
                if (succeed) {
                    that.form = data;
                } else {
                    api.toast({
                        msg: err,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        do_save: function() {
            var that = this;
            var imgele = $api.byId('qrcodeimg')
            var offset = $api.offset(imgele);
            var left = offset.l;
            var top = offset.t;
            var width = offset.w;
            var height = offset.h;
            var header_h = api.pageParam.header_h || 0;
            // api.openWin({
            //     name: 'clipopen_win',
            //     url: '../html/clipopen_win.html',
            //     bounces: false,
            //     pageParam:{
            //       x:left,
            //       y:top,
            //       w:width,
            //       h:height
            //     },
            //     rect: {
            //         x: 0,
            //         y: 0,
            //         w: 'auto',
            //         h: 'auto'
            //     }
            // })
            // return;
            // screenClip.screenShot({
            //     rect: {
            //         x: 0, //（可选项）数字类型；模块左上角的 x 坐标（相对于所属的 Window 或 Frame）；默认：0
            //         y: 0, //（可选项）数字类型；模块左上角的 y 坐标（相对于所属的 Window 或 Frame）；默认：0
            //         w: 320, //（可选项）数字类型；模块的宽度；默认：屏幕宽度
            //         h: 200 //（可选项）数字类型；模块的高度；默认：w屏幕高度
            //     },
            //     album: true,
            //     imgPath:'fs://temp/',
            //     imgName: '20190428.png'
            // }, function(ret, err) {
            //     if (ret.status) {
            //         ns.toast('已保存至本地')
            //     } else {
            //         ns.toast(err)
            //     }
            // });
            // return;
            screenClip.open({
                bg: '#d3d3d3',
                cutFrame: {
                    x: 0, //（可选项）数字类型；模块左上角的 x 坐标（相对于所属的 Window 或 Frame）；默认：0
                    y: top + header_h - 2, //（可选项）数字类型；模块左上角的 y 坐标（相对于所属的 Window 或 Frame）；默认：0
                    w: api.winWidth, //（可选项）数字类型；模块的宽度；默认：屏幕宽度
                    h: height + 4 //（可选项）数字类型；模块的高度；默认：w屏幕高度
                },
                save: {
                    album: true,
                    imgPath: 'fs://temp/',
                    imgName: new Date().valueOf() + '.png'
                }
            }, function(ret, err) {
                if (ret.status) {
                    ns.toast('保存成功');
                } else {
                    ns.toast(err);
                }
            });
        },
        openCover: function() {
            ns.openFrame('clipcover_frm', 'clipcover_frm.html');
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.ID = api.pageParam.id || 0;
    screenClip = api.require('screenClip');
    app.get_data();
};
