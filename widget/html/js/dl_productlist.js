var ns, toast, map;
var app = new Vue({
    el: '#app',
    data: {
        categoryid: 0, //商品类型
        current_sortby: 1, //排序条件
        productName:'',//模糊查询
        form: {
            pageindex: 0,
            pagesize: 10,
            issuggestion: 0
        },
        sortorders: [
            { title: '默认', index: 5, is_active: true },
            { title: '最新', index: 1, is_active: false },
            { title: '销量', index: 2, is_active: false },
            { title: '价格', index: 3, is_active: false, sort_by_price: 1 },
        ],
        type: 0,
        selectmenuid: 0
    },
    methods: {
        check_current_sort: function() {
            var that = this;
            if (that.type == 23) {
                for (var i = 0; i < that.sortorders.length; i++) {
                    that.sortorders[i].is_active = false;
                }
                that.current_sortby = 1;
                that.sortorders[1].is_active = true;
            }
        },
        get_data: function() {
            this.openProductItems();
        },
        openProductItems: function() {
            var height = $api.offset($api.byId('top_menus')).h;
            api.openFrame({
                name: 'dl_productitems',
                url: './dl_productitems.html',
                rect: {
                    x: 0,
                    y: height+80,
                    w: 'auto',
                    h: 'auto'
                },
                pageParam:{
                  categoryid:this.categoryid,
                  sortorder:this.current_sortby
                }
            });
        },
        search_sort: function(item) {
            var that = this;
            for (var i = 0; i < that.sortorders.length; i++) {
                that.sortorders[i].is_active = false;
            }
            item.is_active = true;
            that.current_sortby = item.index;
            if (item.index == 3) {
                if (item.sort_by_price == 1 || item.sort_by_price == 3) {
                    item.sort_by_price = 2;
                    that.current_sortby = 4;
                } else {
                    item.sort_by_price = 3;
                    that.current_sortby = 3;
                }
            }
            api.sendEvent({
                name: 'reloadproductlist',
                extra: {
                    sortOrder: that.current_sortby,
                }
            });

        },
        open_search_bar:function(){
          var delay = 0;
          if (api.systemType != 'ios') {
              delay = 100;
          }
          api.openWin({
              name: 'dl_searchbar_frm',
              url: './dl_searchbar_frm.html',
              delay: delay,
              slidBackEnabled: false,
              vScrollBarEnabled: false,
              pageParam: {
                  searchtype: 1,
              },
              rect: {
                  x: 0,
                  y: 0,
                  w: 'auto',
                  h: 'auto',
              },
              animation: {
                  type: 'movein',
                  subType: 'from_bottom'
              }
          });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    map = api.require('bMap');
    ns = window.Foresight.Util;
    app.categoryid = api.pageParam.id;
    toast = new auiToast();
    app.get_data();
};
