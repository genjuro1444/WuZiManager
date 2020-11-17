var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            id: 0,
            title: '',
            lon: '',
            lat: ''
        },
        postdone: true,
        bMapInstalled: false
    },
    methods: {
        get_data: function() {
            bMapInstalled = api.appInstalled({
                sync: true,
                appBundle: 'android.intent.action.VIEW'
            });
        },
        do_close: function() {
            api.closeFrame();
        },
        do_open_bd_navi: function() {
            var that = this;
            var appParam = 'destination=latlng:' +
                that.form.lat +
                ',' +
                that.form.lon +
                '|name:' + that.form.title +
                '&mode=driving&src=' +
                api.appName;
            api.openApp({
                androidPkg: 'android.intent.action.VIEW',
                uri: 'intent://map/direction?' + appParam + '#Intent;scheme=bdapp;package=com.baidu.BaiduMap;end',
            }, function(ret, err) {
                if (!ret) {
                    ns.toast('请先安装百度地图APP');
                }
            });
        },
        do_open_gaode_navi: function() {
            var that = this;
            var latlng = that.bd_decrypt(that.form.lon, that.form.lat);
            var appParam = 'sourceApplication=' +
                api.appName +
                '&lat=' + latlng.lat +
                '&lon=' + latlng.lon +
                '&dev=0';
            api.openApp({
                uri: 'androidamap://navi?' + appParam,
            }, function(ret, err) {
                if (!ret) {
                    ns.toast('请先安装高德地图APP');
                }
            });
        },
        do_open_tencent_navi: function() {
            var that = this;
            var latlng = that.bd_decrypt(that.form.lon, that.form.lat);
            var appParam = 'type=drive' +
                '&fromcoord=CurrentLocation' +
                '&to=' + that.form.title +
                '&tocoord=' + latlng.lat + ',' + latlng.lon +
                '&referer=S4VBZ-TRLKS-WQCOL-6SMJ6-WBIFJ-FFBRT';
            api.openApp({
                uri: 'qqmap://map/routeplan?' + appParam,
            }, function(ret, err) {
                if (!ret) {
                    ns.toast('请先安装腾讯地图APP');
                }
            });
        },
        bd_decrypt: function(bd_lon, bd_lat) {
            var X_PI = 3.14159265358979324;
            var x = bd_lon - 0.0065;
            var y = bd_lat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
            var gg_lon = z * Math.cos(theta);
            var gg_lat = z * Math.sin(theta);
            return {
                lon: gg_lon,
                lat: gg_lat
            }
        },
        do_cell: function(phone) {
            var that = this;
            ns.confirmPer('phone', function() {
                api.call({
                    type: 'tel_prompt',
                    number: phone
                });
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.title = api.pageParam.title || '';
    app.form.lon = api.pageParam.lon || '';
    app.form.lat = api.pageParam.lat || '';
    api.addEventListener({
        name: 'doclosemappop'
    }, function(ret, err) {
        setTimeout(function() {
            app.do_close();
        }, 1000)
    });
    app.get_data();
}
