var ns;
var app = new Vue({
    el: '#app',
    data: {
        form: {
            source: '',
            StartTime: '',
            EndTime: '',
            TypeIDs: '',
            TypeTitles: '',
            CompleteStatus: 0
        },
        list: [],
        showbg: false,
        source: 'pandiansearchbar'
    },
    methods: {
        do_search: function() {
            var that = this;
            api.sendEvent({
                name: 'do_pdtask_searchbar_complete',
                extra: {
                    source: that.form.source,
                    StartTime: that.form.StartTime,
                    EndTime: that.form.EndTime,
                    TypeIDs: that.form.TypeIDs,
                    TypeTitles: that.form.TypeTitles,
                    CompleteStatus: that.form.CompleteStatus
                }
            });
            setTimeout(function() {
                that.do_close();
            }, 100)
        },
        do_close: function() {
            var that = this;
            that.showbg = false;
            api.closeFrame();
        },
        do_reset: function() {
            var that = this;
            that.form.StartTime = '';
            that.form.EndTime = '';
            that.form.TypeIDs = '';
            that.form.TypeTitles = '';
            that.form.CompleteStatus = 0;
        },
        do_select_date: function(type) {
            var that = this;
            var currentDate = '';
            if (type == 1) {
                currentDate = that.form.StartTime;
            } else {
                currentDate = that.form.EndTime;
            }
            api.openPicker({
                type: 'date',
                date: currentDate,
                title: '选择日期'
            }, function(ret, err) {
                if (ret) {
                    var year = ret.year;
                    var month = (ret.month >= 10 ? ret.month : '0' + ret.month);
                    var day = (ret.day >= 10 ? ret.day : '0' + ret.day);
                    currentDate = year + '-' + month + '-' + day;
                    if (type == 1) {
                        that.form.StartTime = currentDate;
                    } else {
                        that.form.EndTime = currentDate;
                    }
                }
            });
        },
        do_select_type: function() {
            var that = this;
            var title = '选择资产分类';
            var name = 'choosemorezctype_frm';
            ns.openWin(name, title, {
                source: that.source,
                canchoosemorezctype: true,
                TypeIDs: that.form.TypeIDs
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.source = ns.getPageParam('source') || '';
    app.form.StartTime = ns.getPageParam('StartTime') || '';
    app.form.EndTime = ns.getPageParam('EndTime') || '';
    app.form.TypeIDs = ns.getPageParam('TypeIDs') || '';
    app.form.TypeTitles = ns.getPageParam('TypeTitles') || '';
    app.form.CompleteStatus = ns.getPageParam('CompleteStatus') || 0;
    app.showbg = true;
    api.addEventListener({
        name: 'do_choose_more_zctype_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.TypeTitles = ret.value.names;
                app.form.TypeIDs = ret.value.ids;
            }
        }
    });
}
