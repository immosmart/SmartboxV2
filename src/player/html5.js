(function () {
  "use strict";

  var Plugin = {
    init: function () {
      var videoEl = document.createElement('video');
      videoEl.id = 'sb_player';

      document.body.appendChild(videoEl);
      this.$video = videoEl;
      this.setEvents();
    },
    setEvents: function () {
      var self = this,
        $P = this.$P,
        info = this.info,
        video = this.$video;
      $(video).on({
        'loadedmetadata': function () {
          info.width = video.videoWidth;
          info.height = video.videoHeight;
          info.duration = video.duration;
          if(self.from) {
            video.currentTime = self.from;
            delete self.from;
          }
          $P.onReady();
        },
        'loadstart': function () {
          $P.onBufferingStart();
        },
        'playing': function () {
          $P.onBufferingEnd();
        },
        'timeupdate': function(){
          info.currentTime = video.currentTime;
          $P.onUpdate();
        },
        'ended': function () {
          $P.onComplete();
        },
        'error': function () {
          $P.onError();
        }
      });
    },
    play: function (opt) {
      this.$video.src = opt.url;
      if (opt.from) {
        this.from = opt.from;
      }
      this.$video.play();
    },
    stop: function () {
      this.$video.pause();
      this.$video.src = '';
      delete self.from;
    },
    pause: function () {
      this.$video.pause();
    },
    resume: function () {
      this.$video.play();
    },
    seek: function (time) {
      this.$video.currentTime = time;
    },
    setSize: function (opt) {
      var style = this.$video.style;
      style.position = 'absolute';
      style.width = opt.width + 'px';
      style.height = opt.height + 'px';
      style.top = opt.top + 'px';
      style.left = opt.left + 'px';
    }
  };

  function initPlayer() {
    SB.player = new SB._modules.Player(Plugin);
  }

  SB.readyForPlatform('default', initPlayer);
  SB.readyForPlatform('philips', initPlayer);
})();