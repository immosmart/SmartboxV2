(function () {
  "use strict";

  var isInited = false;

  /**
   * Player constructor
   * @param {Object} plugin Native plugin api
   * @param {Object} [config] - Config player
   * @constructor
   */
  var Player = function(plugin, config) {
    config = config || {};
    SB.extend(this._plugin, plugin);

    this._plugin.$P = this;
    this._plugin.info = this.videoInfo;
    SB.extend(this.config, config);
    this.init();
  };

  // inherit player from events
  Player.prototype = new SBEvents();

  var proto = Player.prototype;

  /**
   * Stub for native plugin
   * @type {Object}
   * @private
   */
  proto._plugin = {
    init: $.noop,
    play: $.noop,
    stop: $.noop,
    pause: $.noop,
    resume: $.noop,
    seek: $.noop,
    setSize: $.noop
  };

  /**
   * Player config
   * @type {}
   */
  proto.config = {
    // default step for use in forward/backward methods
    seekStep: 5,
    // default size, will be set on each video
    size: {
      width: 1280,
      height: 720,
      left: 0,
      top: 0
    },
    // save video dimensions in video container
    autosize: true
  };

  /**
   * Current player state
   * @type {string} stop|play|pause
   */
  proto.state = 'stop';

  proto.videoInfo = {
    /**
     * Total video duration in seconds
     */
    duration: 0,
    /**
     * Video stream width in pixels
     */
    width: 0,
    /**
     * Video stream height in pixels
     */
    height: 0,
    /**
     * Current playback time in seconds
     */
    currentTime: 0,
    /**
     * Current seeking time
     */
    seekTime: null
  };

  /**
   * Initialize player plugin
   *
   * @examples
   * Player.init();
   */
  proto.init = function () {
    if (!isInited) {
      this._plugin.init();
      this.setSize(this.config.size);
      isInited = true;
    }
  };

  /**
   * Start playing video, or resume video from pause
   * @param {Object | String} options Options or video url
   * @param {String} options.url url of video
   * @param {Number} options.from start video time, 0 by default
   *
   * @examples
   *
   * Player.play({
   *  url: "movie.mp4"
   * }); // => runs video
   *
   * Player.play({
   *  url: "movie.mp4"
   *  from: 20
   * }); // => runs video from 20 second
   *
   * Player.play({
   *  url: "stream.m3u8"
   * }); // => runs stream
   */
  proto.play = function (options) {
    // if param is url
    if (typeof options === 'string') {
      options = {
        url: options
      }
    }

    if (options) {
      this.stop();
      this.state = 'play';
      this._plugin.play(options);
    } else if (!options && this.state === 'pause') {
      this.resume();
    }
  };

  /**
   * Stop video playback
   * @param {Boolean} silent if true player won't trigger "stop" event, false by default
   *
   * @examples
   * Player.stop(); // stop video
   */
  proto.stop = function (silent) {
    silent = silent || false;

    if (this.state !== 'stop') {
      this._plugin.stop();

      !silent && this.fire('stop');
      this.state = 'stop';
    }
  };

  /**
   * Pause video playback
   *
   * @examples
   * Player.pause(); // pause video
   */
  proto.pause = function () {
    if (this.state === 'play') {
      this._plugin.pause();
      this.state = 'pause';
      this.fire('pause');
    }
  };

  /**
   * Resume video playback if it in 'pause' state
   *
   * @examples
   * Player.pause(); //resumed
   */
  proto.resume = function () {
    if (this.state === 'pause') {
      this._plugin.resume();
      this.state = 'play';
      this.fire('pause');
    }
  };

  /**
   * Toggle pause/resume
   *
   * @examples
   * Player.togglePause(); // paused or resumed
   */
  proto.togglePause = function () {
    if (this.state === "play") {
      this.pause();
    } else if (this.state === 'pause'){
      this.resume();
    }
  };

  /**
   * Converts time in seconds to readable string in format H:MM:SS
   * @param {Number} time The time in seconds  to convert
   * @returns {String} result string in format H:MM:SS
   *
   * @examples
   * Player.formatTime(Player.videoInfo.duration); // => "1:30:27"
   */
  proto.formatTime = function (time) {
    var hours = Math.floor(time / (3600));
    var minutes = Math.floor(time / 60) - (hours * 60);
    var seconds = time - (hours * 3600) - (minutes * 60);

    minutes = (minutes < 10) ? ('0' + minutes) : minutes;
    seconds = (seconds < 10) ? ('0' + seconds) : seconds;

    return ((hours ? (hours + ':') : '') + minutes + ':' + seconds);
  };

  /**
   * Seek video playback
   * @param {Number} time time in seconds to seek
   */
  proto.seek = function (time) {

    if (this.state === 'stop' || !time) {
      return;
    }

    var duration = this.videoInfo.duration;

    time = time >> 0;
    time = time < 0 ? 0 : time;
    time = time > duration ? duration : time;

    this._plugin.seek(time);

    this.fire('seek', time);
  };

  /**
   * Method for fast forward
   * @param {Number} time Skip time in seconds
   */
  proto.forward = function (time) {
    time = time || this.config.jumpStep;

    if (this.state !== 'stop') {
      // convert time to number
      time = time >> 0;
      this.seek(this.videoInfo.currentTime + time);
    }
  };

  /**
   * Method for fast backward
   * @param {Number} time
   */
  proto.backward = function (time) {
    time = time || this.config.jumpStep;

    if (this.state !== 'stop') {
      this.seek(this.videoInfo.currentTime - time);
    }
  };

  /**
   * Set player size
   * @param {Object} opt Size options
   * @param {Number} opt.width Player width
   * @param {Number} opt.height Player height
   * @param {Number} opt.left Player left offset
   * @param {Number} opt.top Player top offset
   */
  proto.setSize = function (opt) {
    if (!opt || !opt.width || !opt.height) {
      throw 'Invalid player size options';
    }

    opt.left = opt.left || 0;
    opt.top = opt.top || 0;

    this._plugin.setSize(opt);
  };

  proto.onReady = function () {
    this.fire('ready');
    this.setSize(this.config.size);
  };

  proto.onBufferingStart = function () {
    this.fire('bufferingBegin');
  };

  proto.onBufferingEnd = function () {
    this.fire('bufferingEnd');
  };

  proto.onUpdate = function () {
    this.fire('update');
  };

  proto.onComplete = function () {
    this.fire('complete');
    this.stop();
  };

  proto.onError = function () {
    this.trigger('error');
  };

  // store Player constructor in SB
  SB._modules.Player = Player;
})();