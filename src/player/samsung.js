(function () {
  "use strict";

  var Plugin = {
    usePlayerObject: true,
    init: function () {
      var style, wrap;

      if (this.usePlayerObject) {
        this.plugin = SB.device.pluginPlayer;
        style = this.plugin.style;
        style.position = 'absolute';
        style.width = '1280px';
        style.height = '720px';
        style.left = '0px';
        style.top = '0px';
        style.zIndex = 0;
      } else {
        this.plugin = SB.device.sefPlayer;
        this.plugin.Open('Player', '0001', 'InitPlayer');
      }

      this.setEvents();
    },
    setEvents: function () {
      var plugin = this.plugin,
        bind = SB.bind;
      plugin.OnStreamInfoReady = bind(this.OnStreamInfoReady, this);
      plugin.OnRenderingComplete = bind(this.OnRenderingComplete, this);
      plugin.OnCurrentPlayTime = bind(this.OnCurrentPlayTime, this);
      plugin.OnCurrentPlaybackTime = bind(this.OnCurrentPlayTime, this);
      plugin.OnBufferingStart = bind(this.OnBufferingStart, this);
      plugin.OnBufferingComplete = bind(this.OnBufferingComplete, this);
      plugin.OnConnectionFailed = bind(this.onError, this);
      plugin.OnNetworkDisconnected = bind(this.onError, this);
      //plugin.OnBufferingProgress = 'Player.OnBufferingProgress';
      //plugin.OnAuthenticationFailed = 'Player.OnAuthenticationFailed';

      plugin.OnEvent = bind(this.onEvent, this);
    },

    OnStreamInfoReady: function () {
      alert('### Player event: OnStreamInfoReady');
      var info = this.info,
        duration, width, height, resolution;

      try {
        duration = this.doPlugin('GetDuration');
      } catch (e) {
        alert('######## ' + e.message);
      }

      duration = Math.ceil(duration / 1000);

      if (this.usePlayerObject) {
        width = this.doPlugin('GetVideoWidth');
        height = this.doPlugin('GetVideoHeight');
      } else {
        resolution = this.doPlugin('GetVideoResolution');
        if (resolution == -1) {
          width = 0;
          height = 0;
        } else {
          var arrResolution = resolution.split('|');
          width = arrResolution[0];
          height = arrResolution[1];
        }
      }

      info.duration = duration;
      info.width = (width >> 0);
      info.height = (height >> 0);
      this.$P.onReady();
    },

    OnRenderingComplete: function () {
      alert('### Player event: OnRenderingComplete');
      this.$P.onComplete();
    },

    OnCurrentPlayTime: function (time) {
      if (this.$P.state == 'play') {
        this.info.currentTime = time / 1000;
        this.$P.onUpdate();
      }
    },

    OnBufferingStart: function () {
      alert('### Player event: OnBufferingStart');
      this.$P.onBufferingStart();
    },

    OnBufferingComplete: function () {
      alert('### Player event: OnBufferingComplete');
      this.$P.onBufferingEnd();
    },

    onError: function () {
      alert('### Player event: onError');
    },

    /**
     * '1' : 'CONNECTION_FAILED',
     * '2' : 'AUTHENTICATION_FAILED',
     * '3' : 'STREAM_NOT_FOUND',
     * '4' : 'NETWORK_DISCONNECTED',
     * '5' : 'NETWORK_SLOW',
     * '6' : 'RENDER_ERROR',
     * '7' : 'RENDERING_START',
     * '8' : 'RENDERING_COMPLETE',
     * '9' : 'STREAM_INFO_READY',
     * '10' : 'DECODING_COMPLETE',
     * '11' : 'BUFFERING_START',
     * '12' : 'BUFFERING_COMPLETE',
     * '13' : 'BUFFERING_PROGRESS',
     * '14' : 'CURRENT_PLAYBACK_TIME',
     * '15' : 'AD_START',
     * '16' : 'AD_END',
     * '17' : 'RESOLUTION_CHANGED',
     * '18' : 'BITRATE_CHANGED',
     * '19' : 'SUBTITLE',
     * '20' : 'CUSTOM'
     * @param type
     */
    onEvent: function (event) {
      switch (event) {
        case 9:
          this.OnStreamInfoReady();
          break;
        case 3:
        case 4:
          this.onError();
          break;
        case 8:
          this.OnRenderingComplete();
          break;
        case 14:
          this.OnCurrentPlayTime(arg1);
          break;
        case 13:
          //this.OnBufferingProgress(arg1);
          break;
        case 12:
          this.OnBufferingComplete();
          break;
        case 11:
          this.OnBufferingStart();
          break;
      }
    },

    doPlugin: function () {
      var result,
        plugin = this.plugin,
        methodName = arguments[0],
        args = Array.prototype.slice.call(arguments, 1, arguments.length) || [];

      if (this.usePlayerObject) {
        try {
          result = plugin[methodName].apply(plugin, args);
        } catch (e) {
          throw 'Plugin player error: ' + e.message;
        }
      }
      else {
        if (methodName.indexOf('Buffer') != -1) {
          methodName += 'Size';
        }
        args.unshift(methodName);
        try {
          result = plugin.Execute.apply(plugin, args);
        } catch (e) {
          throw 'SEF player error: ' + e.message;
        }
      }
      return result;
    },
    play: function (opt) {
      var url = this.parseUrl(opt.url);
      this.doPlugin('InitPlayer', url);
      this.doPlugin('StartPlayback', opt.from || 0);
    },


    parseUrl: function (url) {
      if ((url.indexOf('.m3u8') !== -1) && (url.indexOf('COMPONENT=HLS') === -1)) {
        url += '|COMPONENT=HLS';
      }

      return url;
    },

    stop: function () {
      this.doPlugin('Stop');
    },
    pause: function () {
      this.doPlugin('Pause');
    },
    resume: function () {
      this.doPlugin('Resume');
    },
    seek: function (time) {
      var jump = Math.floor(time - this.info.currentTime) + 1;

      if (jump < 0) {
        this.doPlugin('JumpBackward', -jump);
      } else {
        this.doPlugin('JumpForward', jump);
      }
    },
    setSize: function (size) {
      var width = size.width,
        height = size.height,
        x = size.left,
        y = size.top,
        videoWidth = this.info.width,
        videoHeight = this.info.height,
        windowRate, clipRate, w, h;

      // check if no video sizes
      if (!videoWidth || !videoHeight) {
        return;
      }

      if(this.$P.config.autosize) {
        windowRate = width / height;
        clipRate = videoWidth / videoHeight;

        if (windowRate > clipRate) {
          w = height * clipRate;
          h = height;
          x += (width - w) / 2;
        }
        else {
          w = width;
          h = width / clipRate;
          y += (height - h) / 2;
        }
      }
      else {
        w = width;
        h = height;
      }

      //Player DPI is not the same as window DPI
      // maximum samsung player dimension is 960 * 540, it is 0.75 from 1280 * 720
      x = Math.floor(x * 0.75);
      y = Math.floor(y * 0.75);
      w = Math.floor(w * 0.75);
      h = Math.floor(h * 0.75);
      this.doPlugin('SetDisplayArea', x, y, w, h);
    }
  };


  SB.readyForPlatform('samsung', function () {
    SB.player = new SB._modules.Player(Plugin);
  });
})();