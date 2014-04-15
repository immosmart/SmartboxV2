(function () {
  "use strict";

  function setMagStorage() {
    var stb = window.gSTB;
    var lStorage = {
      setItem: function ( name, data ) {
        if (typeof data === 'object') {
          data = JSON.stringify(data);
        }
        stb.SaveUserData(name, encodeURIComponent(data));
      },
      clear: $.noop,
      getItem: function (name) {
        return decodeURIComponent(stb.LoadUserData(name));
      },
      removeItem: function (name) {
        stb.SaveUserData(name, null);
      }
    };

    SB.storage = SB._modules.Storage(lStorage);
  }

  SB('mag', setMagStorage);
})();