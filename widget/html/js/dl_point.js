var ns;
var app = new Vue({
    el: '#app',
    data: {
    },
methods:{
  open_pointguize: function(item) {
      var that = this;
      ns.openWin('dl_pointguize_frm', '积分规则', {
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
