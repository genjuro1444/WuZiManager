var ns;
var searchBar, searchBarInput, searchBarBtn, searchBarClearBtn;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            keywords: '',
            getids: false,
            getzcdetail: false,
            pandianroom: false,
            pandianzc: false,
            source: ''
        },
        list: []
    },
    methods: {
        do_search_by_key: function(keywords) {
            var that = this;
            that.form.keywords = keywords;
            that.do_search();
        },
        do_search: function() {
            var that = this;
            if (!that.form.keywords) {
                return;
            }
            that.add_in_list();
            var cansave = false;
            var title = '搜索结果';
            var name = '';
            if (that.form.getzcdetail) {
                name = 'zcgl_frm';
                ns.openWin(name, title, {
                    keywords: that.form.keywords,
                    canadd: false,
                    hideeditbtn: true
                });
                return;
            }
            if (that.form.getids || that.form.pandianroom || that.form.pandianzc) {
                name = 'choosezc_frm';
                ns.openWin(name, title, {
                    keywords: that.form.keywords,
                    cansave: true
                });
                return;
            }
            api.sendEvent({
                name: 'do_search_complete',
                extra: {
                    keywords: that.form.keywords,
                    source: that.form.source
                }
            });
            setTimeout(function() {
                api.closeWin({});
            }, 100)
        },
        search_init: function() {
            var that = this;
            searchBar = document.querySelector(".aui-searchbar");
            searchBarInput = document.querySelector(".aui-searchbar input");
            searchBarBtn = document.querySelector(".aui-searchbar .aui-searchbar-btn");
            searchBarClearBtn = document.querySelector(".aui-searchbar .aui-searchbar-clear-btn");
            if (searchBar) {
                searchBarInput.onclick = function() {
                    searchBarBtn.style.marginRight = 0;
                }
                searchBarInput.oninput = function() {
                    if (this.value.length) {
                        searchBarClearBtn.style.display = 'block';
                        searchBarBtn.classList.add("aui-text-info");
                        searchBarBtn.textContent = "搜索";
                    } else {
                        searchBarClearBtn.style.display = 'none';
                        searchBarBtn.classList.remove("aui-text-info");
                        searchBarBtn.textContent = "取消";
                    }
                }
            }
            searchBarClearBtn.onclick = function() {
                this.style.display = 'none';
                searchBarInput.value = '';
                searchBarBtn.classList.remove("aui-text-info");
                searchBarBtn.textContent = "取消";
            }
            searchBarBtn.onclick = function() {
                var keywords = searchBarInput.value;
                if (keywords.length) {
                    searchBarInput.blur();
                    app.form.keywords = keywords;
                    app.do_search();
                } else {
                    app.do_cancel();
                    return;
                    this.style.marginRight = "-" + this.offsetWidth + "px";
                    searchBarInput.value = '';
                    searchBarInput.blur();
                }
            }
        },
        do_cancel: function() {
            api.closeWin();
        },
        do_remove_keywords: function() {
            var that = this;
            that.list = [];
            ns.removePrefs(['searchbar_keywords']);
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
            ns.setPrefs({
                'searchbar_keywords': JSON.stringify(that.list)
            });
        },
        get_list: function() {
            var that = this;
            var searchkeywords = ns.getPrefs('searchbar_keywords');
            if (searchkeywords) {
                that.list = eval('(' + searchkeywords + ')');
            }
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.getids = ns.getPageParam('getids') || false;
    app.form.getzcdetail = ns.getPageParam('getzcdetail') || false;
    app.form.pandianroom = ns.getPageParam('pandianroom') || false;
    app.form.pandianzc = ns.getPageParam('pandianzc') || false;
    app.form.source = ns.getPageParam('source') || '';
    app.search_init();
    app.get_list();
    api.addEventListener({
        name: 'do_choose_zc_complete'
    }, function(ret) {
        api.closeWin();
    });
}

function doEnterSearchKey() {
    var keycode = '';
    if (window.event) { // IE8 及更早IE版本
        keycode = event.keyCode;
    } else if (event.which) { // IE9/Firefox/Chrome/Opera/Safari
        keycode = event.which;
    }
    if (keycode == 13) {
        var keywords = searchBarInput.value;
        if (keywords.length) {
            searchBarInput.blur();
            app.form.keywords = keywords;
            app.do_search();
        }
    }
}
