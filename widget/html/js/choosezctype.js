var ns, toast;
var app = new Vue({
    el: '#app',
    data: {
        filterText: '',
        list: [],
        form: {
            pid: 0,
            keywords: ''
        },
        defaultProps: {
            children: 'children',
            label: 'label'
        },
        source: ''
    },
    watch: {
        filterText(val) {
            this.$refs.tree1.filter(val);
        }
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },
        get_data: function() {
            var that = this;
            var options = {
                action: 'APP_GETZCGLTYPELISTTREE_SIMPLE',
                keywords: that.form.keywords,
                onlysub: ns.AllowAuth('PARENTZCGL') == 1 ? 0 : 1
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.list = data;
                } else if (err) {
                    that.list = [];
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_check_click: function(data, ischecked) {
            var that = this;
            if (ischecked) {
                that.do_choose(data.ID, data.label, data.MonthAge);
                return;
            }
        },
        handleNodeClick: function(data) {
            var that = this;
            that.do_choose(data.ID, data.label, data.MonthAge);
        },
        do_cancel: function() {
            var that = this;
            that.do_choose(0, '', 0);
        },
        do_choose: function(ID, Title, MonthAge) {
            var that = this;
            //item.checked = true;
            api.sendEvent({
                name: 'do_choose_zctype_complete',
                extra: {
                    name: Title,
                    id: ID,
                    monthage: MonthAge,
                    source: that.source
                }
            });
            setTimeout(function() {
                api.closeWin({});
            }, 100)
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.source = ns.getPageParam('source') || '';
    app.get_data();
}
