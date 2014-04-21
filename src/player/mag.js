(function () {
  "use strict";

  var updIntrvl, stb;


  var Plugin = {
    init: function (  ) {
      stb = window.gSTB;
      stb.InitPlayer();
      stb.SetViewport(1280, 720, 0, 0);
      stb.SetTopWin(0);
      this.setEvents();
    },
    setEvents: function () {
      var self = this;
      window.stbEvent = {
        onEvent: function (data) {
          data = String(data);
          if (data == '1') {
            self.$P.onComplete();
          } else if (data == '2') {
            self.info.duration = stb.GetMediaLen() + 1;
            self.info.currentTime = 0;
            self.$P.onReady();
          }
          else if (data == '4') {
            self.$P.onBufferingEnd();
          }
          else if (data == '7') {
            var vi = eval(stb.GetVideoInfo());
            self.info.width = vi.pictureWidth;
            self.info.height = vi.pictureHeight;
          }
        },
        event: 0
      };
    },
    play: function ( options ) {
      stb.Play(options.url);
      startUpdate();
      if(options.from){
        this.seek(options.from);
      }
    },
    stop: function (  ) {
      stb.Stop();
      stopUpdate();
    },
    pause: function (  ) {
      stb.Pause();
      stopUpdate();
    },
    resume: function (  ) {
      stb.Continue();
      startUpdate();
    },
    seek: function ( time ) {
      stb.SetPosTime(time);
    },
    startUpdate: function () {
      var self = this;
      updIntrvl && clearInterval(updIntrvl);
      updIntrvl = setInterval(function () {
        self.info.currentTime = stb.GetPosTime();
        self.$P.onUpdate();
      }, 500);
    },
    stopUpdate: function () {
      if (updIntrvl) {
        clearInterval(updIntrvl);
        updIntrvl = null;
      }
    },
    setSize: function (  ) {

    }
  };

  SB.readyForPlatform('mag', function () {
    SB.player = SB._modules.Player(Plugin);
  })

})();