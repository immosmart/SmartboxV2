(function () {
  "use strict";

  var isStandBy = false,
    stb;

  var Mag = {
    detect: function () {
      return !!window.gSTB;
    },

    keys: {
      RIGHT: 39,
      LEFT: 37,
      DOWN: 40,
      UP: 38,
      RETURN: 8,
      EXIT: 27,
      TOOLS: 122,
      FF: 70,
      RW: 66,
      NEXT: 34,
      PREV: 33,
      ENTER: 13,
      RED: 112,
      GREEN: 113,
      YELLOW: 114,
      BLUE: 115,
      CH_UP: 901,
      CH_DOWN: 902,
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
      PRECH: 116,
      POWER: 85,
      //SMART: 36,
      PLAY: 82,
      STOP: 83,
      //PAUSE: 99,
      //SUBT: 76,
      INFO: 89,
      APP: 123
      //REC: 82
    },

    setPlugins: function () {
      var isStandBy = false;

      stb = window.gSTB;

      // prohibition of keyboard showing on click keyboard button
      stb.EnableVKButton(false);

      window.moveTo(0, 0);
      window.resizeTo(1280, 720);
    },

    sendReturn: function () {
      this.exit();
    },

    getMac: function () {
      return stb.GetDeviceMacAddress();
    },

    getNativeDUID: function () {
      return stb.GetDeviceSerialNumber();
    },

    exit: function () {
      gSTB.DeinitPlayer();
      window.location = 'file:///home/web/services.html';
    }
  };

  SB('mag', function () {
    var $body = $(document.body);

    // hack for ch+/ch-
    $body.on('keydown', function (e) {
      var ev;
      if ( e.keyCode === 9) {
        e.stopPropagation();

        e.keyCode = e.shiftKey? 902 : 901;

        ev = $.Event("keydown", e);
        $body.trigger(ev);
      }
    });

    // trigger 'standby_set', 'standby_unset' when click on power button
    $body.on('nav_key:power', function () {
      var eventName = 'standby_';
      isStandBy = !isStandBy;

      eventName += isStandBy ? 'set' : 'unset';
      stb.StandBy(isStandBy);

      SB.trigger(eventName);
    });
  });

  SB.createPlatform('mag', Mag);
})();