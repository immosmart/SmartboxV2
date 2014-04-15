(function () {

  /**
   * Platform constructor
   * @returns {SBPlatform}
   * @constructor
   */
  var SBPlatform = function () {
    return this;
  };

  var proto = SBPlatform.prototype;

  proto.DUID = '';
  proto.platformUserAgent = 'not found';
  proto.keys = '';

  /**
   * Get DUID in case of Config
   * @return {string} DUID
   */
  proto.getDUID = function () {
    var duid = SB.config.DUID || 'real';
    switch ( duid ) {
      case 'real':
        this.DUID = this.getNativeDUID();
        break;
      case 'mac':
        this.DUID = this.getMac();
        break;
      case 'random':
        this.DUID = this.getRandomDUID();
        break;
      /*case 'local_random':
       this.DUID = this.getLocalRandomDUID();
       break;*/
      default:
        this.DUID = Config.DUIDSettings;
        break;
    }

    return this.DUID;
  };

  /**
   * Returns random DUID for platform
   * @returns {string}
   */
  proto.getRandomDUID = function () {
    return (new Date()).getTime().toString(16) + Math.floor(Math.random() * parseInt("10000", 16)).toString(16);
  };

  /**
   * Returns MAC for platform if exist
   * @returns {string}
   */
  proto.getMac = function () {
    return '';
  };

  /**
   * Returns native DUID for platform if exist
   * @returns {string}
   */
  proto.getNativeDUID = function () {
    return '';
  };

  /**
   * Set custom plugins for platform
   */
  proto.setPlugins = $.noop;

  // TODO: volume for all platforms
  proto.volumeUp = $.noop;
  proto.volumeDown = $.noop;
  proto.getVolume = $.noop;
  proto.exit = $.noop;
  proto.sendReturn = $.noop;

  proto.initialize = function (cb, scope) {
    this.setPlugins();
    this.init(cb, scope);
  };

  proto.init = function (cb, scope) {
    cb.call(scope);
  };

  proto.checkConnect = $.noop;

  proto.detect = $.noop;

  // saving constructor in smartbox modules
  SB._modules.Platform = SBPlatform;
})();