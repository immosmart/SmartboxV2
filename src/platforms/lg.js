(function () {
  "use strict";

  var LG = {
    platformUserAgent: 'netcast',

    keys: {
      ENTER: 13,
      PAUSE: 19,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      N0: 48,
      N1: 49,
      N2: 50,
      N3: 51,
      N4: 52,
      N5: 53,
      N6: 54,
      N7: 55,
      N8: 56,
      N9: 57,
      RED: 403,
      GREEN: 404,
      YELLOW: 405,
      BLUE: 406,
      RW: 412,
      STOP: 413,
      PLAY: 415,
      FF: 417,
      RETURN: 461,
      CH_UP: 33,
      CH_DOWN: 34
    },

    setPlugins: function () {
      //this._listenGestureEvent();

      var el = document.getElementById('device');

      if (!(el && el.type === "application/x-netcast-info")) {
        el = document.createElement('object');
        el.type = "application/x-netcast-info";
        el.id = "device";
        el.width = 0;
        el.height = 0;
        document.body.appendChild(el);
      }

      this._plugin = el;

      this.modelCode = this._plugin.version;
      this.productCode = this._plugin.platform;

      this.getDUID();
    },

    getNativeDUID: function () {
      return this._plugin.serialNumber;
    },

    getMac: function () {
      return this._plugin.net_macAddress.replace(/:/g, '');
    },

    getUsedMemory: function () {
      var mem = window.NetCastGetUsedMemorySize;

      if (mem) {
        return window.NetCastGetUsedMemorySize();
      } else {
        return false;
      }
    },

    sendReturn: function () {
      window.NetCastBack();
    },

    exit: function () {
      window.NetCastExit();
    }
  };

  SB.createPlatform('lg', LG);
})();