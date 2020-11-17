var ns;
var app = new Vue({
    el: '#app',
    data: {},
    methods:{
      open_shop: function(item) {
          var that = this;
          ns.openWin('dl_shop_frm', '新世纪百货', {
              id: 0,
          });
        },
        open_productmsg:function(item){
          var that = this;
          ns.openWin('dl_product_frm', '商品详情', {
              id: 0,
          });
        }
      }
    });
    apiready = function() {
        api.parseTapmode();
        ns = window.Foresight.Util;
        // app.get_data();
    };

// apiready = function() {
//     api.parseTapmode();
//     ns = window.Foresight.Util;
//     var top_tab = 　$api.byId('tab')
//     var body_h = api.winHeight;
//     var top_tab_h = $api.offset(top_tab).h;
//     var header_h = api.pageParam.header_h;
//     var status = api.pageParam.status;
//     api.openFrameGroup({
//         name: 'top_tab_switch',
//         scrollEnabled: true,
//         rect: {
//             x: 0,
//             y: top_tab_h + header_h,
//             w: 'auto',
//             h: body_h - top_tab_h - header_h
//         },
//         index: 0,
//         preload: 0,
//         frames: [{
//             name: 'myorderlist_frm',
//             url: 'myorderlist_frm.html',
//             bounces: false,
//             pageParam: {
//                 status: 0
//             }
//         }, {
//             name: 'myorderlist_frm',
//             url: 'myorderlist_frm.html',
//             bounces: false,
//             pageParam: {
//                 status: 1
//             }
//         }, {
//             name: 'myorderlist_frm',
//             url: 'myorderlist_frm.html',
//             bounces: false,
//             pageParam: {
//                 status: 5
//             }
//         }, {
//             name: 'myorderlist_frm',
//             url: 'myorderlist_frm.html',
//             bounces: false,
//             pageParam: {
//                 status: 2   //待收货
//             }
//         },{
//             name: 'myorderlist_frm',
//             url: 'myorderlist_frm.html',
//             bounces: false,
//             pageParam: {
//                 status: 3   //已完成
//             }
//         },  {
//             name: 'myorderlist_frm',
//             url: 'myorderlist_frm.html',
//             bounces: false,
//             pageParam: {
//                 status: 6   //退款中
//             }
//         },{
//             name: 'myorderlist_frm',
//             url: 'myorderlist_frm.html',
//             bounces: false,
//             pageParam: {
//                 status: 10   //退款失败
//             }
//         },{
//             name: 'myorderlist_frm',
//             url: 'myorderlist_frm.html',
//             bounces: false,
//             pageParam: {
//                 status: 4 //已关闭退款
//             }
//         }]
//     },
//      function(ret, err) {
//         var top_tab = $api.byId('tab');
//         var tabAct = $api.dom(top_tab, '.aui-tab-item.aui-active');
//         $api.removeCls(tabAct, 'aui-active');
//         var name = ret.name;
//         var index = ret.index;
//         $api.addCls($api.byId('tabbar' + index), 'aui-active');
//     })
// }
