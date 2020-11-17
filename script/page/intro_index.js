var app, ns, countdown;
app = new Vue({
    el: '#app',
    data: {
        list: [],
        imagelist: [],
        cachedone: false,
        totalsecond: 0,
        current: 0,
        footer_banner_img: '',
        footer_banner_cache_img: '',
        launch_done_complete: false,
        cache_index: 0,
        form: {
            id: 0,
            type: 0
        }
    },
    methods: {
        get_all: function() {
            var that = this;
            setTimeout(function() {
                that.remove_launch_view();
            }, 5000);
            setTimeout(function() {
                that.get_rotating_data();
            }, 100);
        },
        get_rotating_data: function() {
            var that = this;
            ns.post({
                action: 'getrotatingimages',
                type: 7,
            }, function(succeed, data, err) {
                if (succeed && data) {
                    that.imagelist = data.imagelist;
                    that.totalsecond = data.totalsecond;
                    that.footer_banner_img = data.footer_banner_img;
                }
                if (that.imagelist.length == 0) {
                    setTimeout(function() {
                        that.do_close();
                        that.remove_launch_view();
                    }, 500);
                    return;
                }
                that.image_cache_footer();
                that.image_cache();
            }, { needcloselaunch: true });
        },
        remove_launch_view: function() {
            var that = this;
            if (that.launch_done_complete) {
                return;
            }
            that.launch_done_complete = true;
            api.removeLaunchView({
                animation: {
                    type: 'fade',
                    duration: 500
                }
            });
        },
        cache_image_done: function() {
            var that = this;
            if (that.cachedone) {
                that.remove_launch_view();
                setTimeout(function() {
                    that.slider_work();
                    that.do_count_down();
                }, 200)
            }
        },
        image_cache_footer: function() {
            var that = this;
            if (that.footer_banner_img == '') {
                return;
            }
            api.imageCache({
                url: that.footer_banner_img,
                thumbnail: false
            }, function(ret, err) {
                if (ret.status) {
                    that.footer_banner_cache_img = ret.url;
                }
            });
        },
        image_cache: function() {
            var that = this;
            var item = that.imagelist[that.cache_index];
            api.imageCache({
                url: item.imageurl,
                thumbnail: false
            }, function(ret, err) {
                that.cache_index++;
                if (ret.status) {
                    item.cacheurl = ret.url;
                }
                if (that.cache_index <= that.imagelist.length - 1) {
                    that.image_cache();
                } else {
                    that.cachedone = true;
                    that.cache_image_done();
                }
            });
        },
        slider_work: function() {
            var that = this;
            var win_height = api.winHeight;
            var footer_height = 0;
            var bottom_banner = $api.byId('bottom_banner');
            if (that.footer_banner_img != '') {
                var offset_bottom_banner = $api.offset(bottom_banner);
                footer_height = offset_bottom_banner.h;
            }
            var center_height = win_height - footer_height;
            var slide = new auiSlide({
                "container": document.getElementById("aui-slide"),
                "height": center_height,
                "speed": 300,
                "autoPlay": 3000, //自动播放
                "loop": false,
                "pageShow": true,
                "pageStyle": 'dot',
                'dotPosition': 'center'
            });
            slide.app = that;
            var auto_play_interval = null;
            that.do_slider(0, slide);
        },
        do_slider: function(index, slide) {
            var that = this;
            if (index == that.imagelist.length - 1) {
                return;
            }
            setTimeout(function() {
                slide.timePlay(index, that.imagelist.length - 1);
                index = index + 1;
                that.do_slider(index, slide);
            }, that.imagelist[index].waitsecond * 1000)
        },
        do_count_down: function() {
            var that = this;
            countdown = setInterval(function() {
                if (that.totalsecond <= 0) {
                    that.totalsecond = 0;
                    that.do_close();
                    return;
                }
                that.totalsecond--;
            }, 1000);
        },
        open_rotating: function(item) {
            var that = this;
            if (item.productid == 0) {
                return;
            }
            that.form.id = item.productid || 0;
            that.form.type = item.type || 0;
            that.do_close();
        },
        do_close: function() {
            var that = this;
            if (countdown) {
                clearInterval(countdown);
            }
            api.sendEvent({
                name: 'close_intro_success',
                extra: {
                    id: that.form.id,
                    type: that.form.type
                }
            });
            api.closeWin({
                animation: {
                    type: 'reveal',
                    duration: 500
                }
            })
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.get_all();
    var last_out_time;
    api.addEventListener({
        name: 'keyback'
    }, function(ret, err) {
        if (last_out_time && last_out_time.valueOf() >= (new Date().valueOf() - 1000)) {
            api.closeWidget({
                silent: true
            });
            return;
        }
        last_out_time = new Date();
        api.toast({
            msg: '再按一次退出程序',
            duration: 1000
        });
    });
};
