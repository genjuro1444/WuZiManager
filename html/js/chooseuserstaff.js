var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        form: {
            keywords: '',
            branchcode: 0,
            userGW: '',
            source: ''
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {
                action: 'APP_GETUSERLISTBYBRANCHANDGW',
                branchcode: that.form.branchcode,
                userGW: that.form.userGW,
                keywords: that.form.keywords
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.list = data.list;
                } else if (err) {
                    that.list = [];
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_cancel: function() {
            var that = this;
            that.do_choose({
                id: 0,
                name: ''
            });
        },
        do_choose: function(item) {
            var that = this;
            item.checked = true;
            api.sendEvent({
                name: 'do_choose_zcuseuser_complete',
                extra: {
                    id: item.id,
                    name: item.name,
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
                    searchBarBtn.classList.add("aui-text-info");
                    searchBarBtn.textContent = "搜索";
                }
                searchBarInput.oninput = function() {
                    if (this.value.length) {
                        searchBarBtn.style.marginRight = 0;
                        searchBarClearBtn.style.display = 'block';
                        searchBarBtn.classList.add("aui-text-info");
                        searchBarBtn.textContent = "搜索";
                    } else {
                        searchBarClearBtn.style.display = 'none';
                        searchBarBtn.classList.remove("aui-text-info");
                        searchBarBtn.textContent = "";
                    }
                }
            }
            searchBarClearBtn.onclick = function() {
                searchBarBtn.style.marginRight = "-" + searchBarBtn.offsetWidth + "px";
                this.style.display = 'none';
                searchBarInput.value = '';
                searchBarBtn.classList.remove("aui-text-info");
                searchBarBtn.textContent = "";
            }
            searchBarBtn.onclick = function() {
                var keywords = searchBarInput.value;
                app.form.keywords = keywords;
                if (keywords.length) {
                    searchBarInput.blur();
                } else {
                    this.style.marginRight = "-" + this.offsetWidth + "px";
                    searchBarInput.value = '';
                    searchBarInput.blur();
                    searchBarBtn.textContent = "";
                }
                app.get_data();
            }
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.branchcode = ns.getPageParam('id') || 0;
    app.form.userGW = ns.getPageParam('userGW') || '';
    app.form.source = ns.getPageParam('source') || ''
    app.search_init();
    app.get_data();
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
            app.get_data();
        }
    }
}
