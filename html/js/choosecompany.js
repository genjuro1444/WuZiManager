var ns;
var app = new Vue({
    el: '#app',
    data: {
        filterText: '',
        list: [],
        form: {
            pid: 0,
            keywords: '',
            source: '',
            BranchCode: 0,
            CurrentBranchCodes: ''
        },
        defaultProps: {
            children: 'children',
            label: 'label'
        },
        showCheckBox: false,
        allkeylist: []
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
        set_unselect_class: function() {
            var that = this;
            var elems = $api.domAll('label.el-checkbox.is-disabled');
            for (var i = 0; i < elems.length; i++) {
                var parentElem = $api.closest(elems[i], 'div');
                $api.css(parentElem, 'color:#ccc;');
            }
        },
        get_data: function() {
            var that = this;
            var options = {
                action: 'APP_GETTHISUSERBRANCHTREE',
                keywords: that.form.keywords,
                CurrentBranchCodes: that.form.CurrentBranchCodes
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.list = data;
                    if (that.form.CurrentBranchCodes != '') {
                        that.showCheckBox = true;
                        // that.do_select_all();
                        if (that.form.BranchCode) {
                            setTimeout(function() {
                                that.$refs.tree1.setCheckedKeys([that.form.BranchCode]);
                                that.set_unselect_class();
                            }, 200);
                        }
                    } else {
                        setTimeout(function() {
                            that.$refs.tree1.setCurrentKey(that.form.BranchCode);
                        }, 200);
                    }
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
                that.do_choose(data.id, data.label);
                return;
            }
        },
        handleNodeClick: function(data) {
            var that = this;
            if (data.disabled) {
                return;
            }
            that.do_choose(data.id, data.label);
        },
        do_cancel: function() {
            var that = this;
            that.do_choose(0, '');
        },
        do_choose: function(ID, Title) {
            var that = this;
            //item.checked = true;
            api.sendEvent({
                name: 'do_choose_zccompany_complete',
                extra: {
                    id: ID,
                    name: Title,
                    source: that.form.source
                }
            });
            setTimeout(function() {
                api.closeWin({});
            }, 100)
        },
        do_select_all: function() {
            var that = this;
            if (that.allkeylist.length == 0) {
                that.get_all_keys(that.list);
            }
            that.$refs.tree1.setCheckedKeys(that.allkeylist);
        },
        get_all_keys: function(list) {
            var that = this;
            for (var i = 0; i < list.length; i++) {
                that.allkeylist.push(list[i].id);
                if (list[i].children.length) {
                    that.get_all_keys(list[i].children);
                }
            }
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.source = ns.getPageParam('source') || ''
    app.form.BranchCode = ns.getPageParam('BranchCode') || 0;
    app.form.CurrentBranchCodes = ns.getPageParam('CurrentBranchCodes') || '';
    app.get_data();
}
