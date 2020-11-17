var ns, h = 0;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            lightIsOn: false,
            lightTitle: '打开手电筒',
            canwritezc: true
        }
    },
    methods: {
        moveline: function() {
            var line = $api.byId('line');
            if (h == 250) {
                h = 0;
            } else {
                h = h + 1;
            }
            var hstr = h + 'px';
            document.getElementById('line').style.cssText = "height:" + hstr;
        },
        closeScanner: function() {
            api.sendEvent({
                name: 'do_close_scan',
                extra: {
                    isclose: true
                }
            });
        },
        openWriteNumber: function() {
            api.sendEvent({
                name: 'do_close_scan',
                extra: {
                    canwrite: true
                }
            });
        },
        switchLight: function() {
            var that = this;
            that.form.lightIsOn = !that.form.lightIsOn;
            that.form.lightTitle = that.form.lightIsOn ? '关闭手电筒' : '打开手电筒';
            api.sendEvent({
                name: 'do_switch_light',
                extra: {
                    lightIsOn: that.form.lightIsOn
                }
            });
        },
        set_height: function() {
            var that = this;
            var table = $api.dom('table.scantable');
            var firsttd = $api.dom('td.firsttd');
            var secondtds = $api.domAll('td.secondtd');
            var thirdtd = $api.dom('td.thirdtd');
            var second_center = $api.dom('td.second_center');
            var header_h = $api.offset($api.byId('aui-header')).h;
            var footer_h = $api.offset($api.byId('aui-footer')).h;
            var scanport_w = $api.offset($api.dom('.scanport')).w;
            var scanport_h = $api.offset($api.dom('.scanport')).h;
            var top_bottom_h = (api.winHeight - header_h - footer_h - scanport_h) / 2;
            var center_w = (api.winWidth - scanport_w) / 2;
            $api.css(table, 'height:' + (api.winHeight - header_h - footer_h) + 'px;');
            $api.css(firsttd, 'height:' + top_bottom_h + 'px;');
            $api.css(second_center, 'width:' + scanport_w + 'px;height:' + scanport_h + 'px;');
            $api.css(thirdtd, 'height:' + top_bottom_h + 'px;');
            for (var i = 0; i < secondtds.length; i++) {
                var secondtd = secondtds[i];
                $api.css(secondtd, 'width:' + center_w + 'px;');
            }
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.canwritezc = ns.getPageParam('canwritezc');
    app.set_height();
    setInterval(function() {
        app.moveline();
    }, 15);
    var header = $api.byId('aui-header');
    $api.css(header, 'border-top: solid 0px #000;');
    api.addEventListener({
        name: 'keyback'
    }, function(ret, err) {
        app.closeScanner();
    });
}
