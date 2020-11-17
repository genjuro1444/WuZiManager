var ns, wx, qq, weibo, popup;
var off_top_div = document.getElementById('test');
var offset = $api.offset(off_top_div);
var app = new Vue({
    el: '#app',
    data: {
        form: {
            keywords: '',
            searchtype: 0 //1分类搜索
        },
        list: []
    },
    methods: {
        get_data: function() {
            var that = this;
            that.do_create_input();
            that.get_list();
        },
        do_create_input: function() {
            var that = this;
            var UIInput = api.require('UIInput');
            var offset = $api.offset($api.byId('aui-inputbox'));
            var paddingTop = 25;
            if (api.systemType == 'ios') {
                paddingTop = 20;
            }
            UIInput.open({
                rect: {
                    x: 25,
                    y: offset.t,
                    w: api.winWidth - 120,
                    h: 30,
                },
                styles: {
                    bgColor: '#dddddd',
                    size: 13,
                    color: '#808080',
                    placeholder: {
                        color: '#808080'
                    }
                },
                autoFocus: true,
                maxRows: 1,
                placeholder: '请输入商品名称',
                keyboardType: 'search',
                fixedOn: api.frameName
            }, function(ret) {
                if (ret.eventType == 'search') {
                    UIInput.value(function(ret2) {
                        if (ret2) {
                            that.form.keywords = ret2.msg;
                            that.do_search();
                        }
                    });
                }
            });
        },
        do_search: function(keywords) {
            var that = this;
            if (keywords) {
                that.form.keywords = keywords;
            }
            if (that.form.keywords == '') {
                return;
            }
            that.form.keywords = $api.trim(that.form.keywords);
            that.add_in_list();
            api.setPrefs({
                key: 'searchbar_keywords',
                value: JSON.stringify(that.list)
            });
            var type = 0;
            var url = 'dl_category_frm.html';
            if (that.form.searchtype == 1) {
                url = 'dl_category_frm.html';
            } else if (that.form.searchtype == 2) {
                url = 'business_frm.html';
            } else if (that.form.searchtype == 3) {
                url = 'point_mall_frm.html';
            } else if (that.form.searchtype == 4) {
                url = 'pintuan_list_frm.html';
            } else if (that.form.searchtype == 5) {
                url = 'xianshi_list_frm.html';
            } else if (that.form.searchtype == 6) {
                url = 'xianshi_list_frm.html';
                type = 22;
            }
            ns.openWin('search_result_frm', '搜索结果', {
                title: '搜索结果',
                url: url,
                keywords: that.form.keywords,
                type: type
            });
        },
        do_cancel: function() {
            api.closeWin();
        },
        do_remove_keywords: function() {
            var that = this;
            that.list = [];
            api.removePrefs({
                key: 'searchbar_keywords'
            });
        },
        add_in_list: function() {
            var that = this;
            if (that.form.keywords == '') {
                return;
            }
            if (that.list.length == 0) {
                that.list.push(that.form.keywords);
            }
            for (var i = 0; i < that.list.length; i++) {
                if (that.list[i] == that.form.keywords) {
                    break;
                }
                if (i == (that.list.length - 1)) {
                    that.list.push(that.form.keywords);
                }
            }
            return;
        },
        get_list: function() {
            var that = this;
            api.getPrefs({
                key: 'searchbar_keywords'
            }, function(ret, err) {
                if (ret && ret.value) {
                    that.list = eval('(' + ret.value + ')');
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    var header = $api.byId('aui-header');
    $api.fixStatusBar(header);
    ns = window.Foresight.Util;
    app.form.searchtype = api.pageParam.searchtype || 0;
    app.get_data();
    api.addEventListener({
        name: 'do_search_start'
    }, function(ret, err) {
        if (ret) {
            setTimeout(function() {
                app.do_cancel();
            }, 200)
        }
    });
}
