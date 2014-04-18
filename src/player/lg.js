(function () {
  "use strict";

  var isReady = false, from;

  var Plugin = {
    updateTime: 500,
    init: function () {
      this.wrap = document.createElement('div');
      this.wrap.className = 'playerWrtap';
    },
    createPlayer: function () {
      this.removePlayer();
      this.wrap.innerHTML = '<object type="video/mp4" data="" width="1280" height="720" id="pluginPlayer" style="z-index: 0; position: absolute; left: 0; top: 0;"></object>';
      this.plugin = this.wrap.childNodes[0];
      this.setEvents();
    },
    removePlayer: function () {
      if (this.plugin) {
        this.wrap.removeChild(this.plugin);
        clearInterval(this.updateIntrvl);
        this.plugin = null;
      }
    },
    setEvents: function () {
      var plugin = this.plugin;
      plugin.onPlayStateChange = SB.bind(this.onEvent, this);
      plugin.onBuffering = SB.bind(this.onBuffering, this);
      plugin.onError = SB.bind(this.onError, this);
      this.updateIntrvl = setInterval(SB.bind(this.onUpdate,this), this.updateTime);
    },

    onEvent: function () {
      if (this.plugin.playState == 5) {
        this.$P.onComplete();
      } else if (this.plugin.playState == 6) {
        this.$P.onError();
      }
    },

    onBuffering: function (isStarted) {
      if(isStarted) {
        this.$P.onBufferingStart();
      } else {
        this.$P.onBufferingEnd();
      }
    },

    onError: function () {
      this.$P.onError();
    },

    onUpdate: function () {
      if (!this.plugin) {
        return;
      }

      var info = this.plugin.mediaPlayInfo();

      if (info && info.duration && !isReady) {
        this.onReady(info);
      }

      if (!isReady) {
        return;
      }

      this.info.currentTime = info.currentPosition / 1000;
      this.$P.onUpdate();
    },

    onReady: function (info) {

      isReady = true;

      this.info.duration = info.duration / 1000;

      if (from) {
        var self = this;
        var onBufEnd = function () {
          self.$P.off('bufferingEnd', onBufEnd);
          self.seek(from);
        };
        this.$P.on('bufferingEnd', onBufEnd);
      }

      this.$P.onReady();
    },

    play: function (options) {
      isReady = false;
      this.createPlayer();
      this.plugin.data = options.url;
      this.plugin.play(1);

      from = options.from || 0;
    },

    stop: function () {
      this.plugin.stop();
    },
    pause: function () {
      this.plugin.play(0);
    },
    resume: function () {
      this.plugin.play(1);
    },
    seek: function (time) {
      this.plugin.seek(time * 1000);
    },
    setSize: function (size) {
      if (size.width) {
        this.plugin.width = size.width;
      }

      if (size.height) {
        this.plugin.height = size.height;
      }

      if (size.left) {
        this.plugin.style.left = size.left + 'px';
      }

      if (size.top) {
        this.plugin.style.top = size.top + 'px';
      }
    }
  };

  SB.readyForPlatform('lg', function () {
    SB.player = new SB._modules.Player(Plugin);
  });
})();