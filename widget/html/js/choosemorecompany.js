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
            BranchCodes: '',
            CurrentBranchCodes: ''
        },
        defaultProps: {
            children: 'children',
            label: 'label'
        },
        checklist: [],
        selectalltype: 0,
        allkeylist: [],
    },
    watch: {
        filterText(val) {
            this.$refs.tree1.filter(val);
        }
    },
    methods: {
        do_select_all: function(selectalltype) {
            var that = this;
            that.selectalltype = selectalltype;
            if (that.selectalltype == 2) {
                that.$refs.tree1.setCheckedKeys([]);
            } else {
                if (that.allkeylist.length == 0) {
                    that.get_all_keys(that.list);
                }
                that.$refs.tree1.setCheckedKeys(that.allkeylist);
            }
        },
        get_all_keys: function(list) {
            var that = this;
            for (var i = 0; i < list.length; i++) {
                that.allkeylist.push(list[i].id);
                if (list[i].children.length) {
                    that.get_all_keys(list[i].children);
                }
            }
        },
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
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
                    setTimeout(function() {
                        if (that.form.BranchCodes) {
                            that.$refs.tree1.setCheckedKeys(that.form.BranchCodes.split(','));
                        }
                    }, 200);
                } else if (err) {
                    that.list = [];
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        get_checked_keys: function() {
            var that = this;
            return that.$refs.tree1.getCheckedKeys();
        },
        handleNodeClick: function(data) {
            var that = this;
            that.do_check_node(data, false);
        },
        get_checked_labels: function() {
            var that = this;
            var list = that.$refs.tree1.getCheckedNodes();
            var names = [];
            for (var i = 0; i < list.length; i++) {
                names.push(list[i].label)
            }
            return names;
        },
        do_choose: function() {
            var that = this;
            //item.checked = true;
            var idlist = that.get_checked_keys();
            var labellist = that.get_checked_labels();
            api.sendEvent({
                name: 'do_choose_more_zccompany_complete',
                extra: {
                    ids: idlist.join(','),
                    names: labellist.join(','),
                    source: that.form.source
                }
            });
            setTimeout(function() {
                api.closeWin({});
            }, 100)
        },
        do_check_node: function(data, ischeckclick) {
            var that = this;
            that.checklist = that.get_checked_keys();
            if (that.check_in_array(data.id, that.checklist)) {
                if (ischeckclick) {
                    that.get_children_keys(data, true);
                } else {
                    that.delete_from_array(data.id, that.checklist);
                    that.get_children_keys(data, false);
                }
            } else {
                if (ischeckclick) {
                    that.get_children_keys(data, false);
                } else {
                    that.checklist.push(data.id);
                    that.get_children_keys(data, true);
                }
            }
        },
        check_in_array: function(value, array) {
            var that = this;
            if (array.indexOf(value) == -1) {
                return false;
            } else {
                return true;
            }
        },
        delete_from_array: function(value, array) {
            var that = this;
            array.splice(array.indexOf(value), 1);
        },
        handle_tree_check: function(data) {
            var that = this;
            that.do_check_node(data, true);
        },
        get_children_keys: function(data, canpush) {
            var that = this;
            that.$refs.tree1.setCheckedKeys(that.checklist);
            return;
            if (data.children) {
                for (var i = 0; i < data.children.length; i++) {
                    var node = data.children[i];
                    if (canpush) {
                        if (!that.check_in_array(node.id, that.checklist)) {
                            that.checklist.push(node.id);
                        }
                    } else {
                        that.delete_from_array(node.id, that.checklist);
                    }
                    that.get_children_keys(node, canpush);
                }
            }
            that.$refs.tree1.setCheckedKeys(that.checklist);
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.source = ns.getPageParam('source') || ''
    app.form.BranchCodes = ns.getPageParam('BranchCodes') || '';
    app.form.CurrentBranchCodes = ns.getPageParam('CurrentBranchCodes') || '';
    app.get_data();
    api.addEventListener({
        name: 'do_choose_more_company'
    }, function(ret, err) {
        app.do_choose();
    });
}
