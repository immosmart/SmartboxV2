(function (_global) {
  "use strict";

  var readyCallbacks = [],
    existingPlatforms = {},
    _ready = false,
    userAgent = navigator.userAgent.toLowerCase(),
    Smartbox;

  //private func for applying all ready callbacks
  function onReady() {
    var cb, scope;
    _ready = true;

    for ( var i = 0, len = readyCallbacks.length; i < len; i++ ) {
      cb = readyCallbacks[i][0];
      scope = readyCallbacks[1];
      if (typeof cb === 'function') {
        cb.call(scope);
      }
    }

    // no need anymore
    readyCallbacks = null;

    window.SBDevice = Smartbox.device;
    window.SBStorage = Smartbox.storage;
    if (Smartbox.player) {
      window.SBPlayer = Smartbox.player;
    }
  }

  //TODO: add own extend func
  var extend = (function(){
    if (_global._) {
      return _global._.extend
    } else {
      return _global.$.extend
    }
  })();

  /**
   * Detecting current platform
   * @returns {boolean} true if running on current platform
   */
  function detect ( slug ) {
    return userAgent.indexOf(slug) !== -1;
  }

  /**
   * Smartbox is shortcut for Smartbox.ready or Smartbox.readyforPlatform
   * @param platform {String}
   * @param cb {Function}
   * @param scope {Object}
   */
  Smartbox = function ( platform, cb , scope) {
    if ( typeof platform === 'string' ) {
      Smartbox.readyForPlatform(platform, cb, scope);
    } else if ( typeof platform === 'function' ) {
      // first arg - cb, second - scope
      Smartbox.ready(platform, cb);
    }
  };

  /**
   * Current library version
   * @type {number}
   */
  Smartbox.version = 2.0;

  /**
   * Current platform name
   * @type {string}
   */
  Smartbox.platformName = 'default';

  Smartbox.config = {};

  /**
   * For storing plugin constructors
   * @type {{}}
   * @private
   */
  Smartbox._modules = {};

  // calling cb after library initialise
  Smartbox.ready = function ( cb, scope ) {
    scope = scope || _global;

    if ( _ready ) {
      cb.call(scope);
    } else {
      readyCallbacks.push([cb, scope]);
    }
  };

  // calling cb after library initialise if platform is current
  Smartbox.readyForPlatform = function ( platform, cb, scope ) {
    var self = this;
    this.ready(function () {
      if ( platform == self.platformName ) {
        cb.call(this);
      }
    }, scope);
  };

  Smartbox.createPlatform = function ( platformName, platformApi ) {
    var isCurrent;

    // return if already have device
    if (this.device) {
      return;
    }

    if (platformName === 'default') {
      // for use default platform later
      existingPlatforms[platformName] = platformApi;
    } else {
      isCurrent = platformApi.detect && platformApi.detect();

      if ( isCurrent || detect(platformApi.platformUserAgent) ) {
        this.platformName = platformName;
        this.device = new this._modules.Platform();
        extend(this.device, platformApi);

        if (typeof this.device.onDetect === 'function') {
          this.device.onDetect();
        }
      }
    }
  };

  Smartbox.detectDevice = function () {

    if (!this.device) {

      if (!existingPlatforms['default']) {
        throw 'Default platform is not defined';
      }

      this.device = new this._modules.Platform();
      this.platformName = 'default';

      // mix device API to device instance
      extend(this.device, existingPlatforms[this.platformName]);

      // don't need anymore
      existingPlatforms = null;
    }

    return this.device;
  };

   /**
   * Asynchroniosly adding javascript files
   * @param filesArray {Array} array of sources of javascript files
   * @param cb {Function} callback on load javascript files
   */
   Smartbox.addExternalJS = function ( filesArray, cb ) {
    var loadedScripts = 0,
      len = filesArray.length,
      el;

     alert('call add External js');

    function onloadScript () {
      loadedScripts++;

      if ( loadedScripts === len ) {
        cb && cb.call();
      }
    }

    if ( filesArray.length ) {
      for ( var i = 0; i < len; i++ ) {
        el = document.createElement('script');
        el.type = 'text/javascript';
        el.onload = onloadScript;
        el.src = filesArray[i];
        document.body.appendChild(el);
      }
    } else {
      // if no external js simple call cb
      cb && cb.call(this);
    }
  };

  /**
   * Add external css filess
   * @param filesArray {Array} array of css sources
   */
  Smartbox.addExternalCSS = function ( filesArray ) {
    var $externalCssContainer,
      len = filesArray.length,
      i = 0,
      el, src;

    if ( len ) {
      $externalCssContainer = document.createDocumentFragment();

      while (i < len) {
        src = filesArray[i];
        if (src) {
          el = document.createElement('link');
          el.rel = 'stylesheet';
          el.href = src;

          $externalCssContainer.appendChild(el);
        }
      }

      document.body.appendChild($externalCssContainer);
    }
  };

  Smartbox.extend = extend;

  Smartbox.bind = function (cb,scope) {
    return function () {
      return cb.apply(scope, arguments);
    }
  };

  // mix events to Smartbox
  extend(Smartbox, SBEvents.prototype);

  /**
   * Init library
   */
  function initialize() {
    var device = Smartbox.detectDevice();

    device.initialize(function() {
      device.getDUID();
      // wait for calling others $()
      setTimeout(function () {
        onReady();
        onReady = null;
      }, 10);
    });
  }

  _global.SB = Smartbox;

  // start Smartbox
  $(initialize);

  SB(function () {
    document.getElementById('test').innerHTML = 'IT\'s OK';
  })
})(this);
