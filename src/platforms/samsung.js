(function ( SB ) {

  var Samsung = {},
    doc = window.document;

  var plugins = {
    audio: 'SAMSUNG-INFOLINK-AUDIO',
    pluginObjectTV: 'SAMSUNG-INFOLINK-TV',
    pluginObjectTVMW: 'SAMSUNG-INFOLINK-TVMW',
    pluginObjectNetwork: 'SAMSUNG-INFOLINK-NETWORK',
    pluginObjectNNavi: 'SAMSUNG-INFOLINK-NNAVI',
    pluginPlayer: 'SAMSUNG-INFOLINK-PLAYER',
    EXTERNALWIDGET: 'SAMSUNG-INFOLINK-EXTERNALWIDGETINTERFACE'
  };

  Samsung.platformUserAgent = 'maple';

  Samsung.files = [
    'src/libs/json2.js',
    '$MANAGER_WIDGET/Common/API/Plugin.js',
    '$MANAGER_WIDGET/Common/API/Widget.js',
    '$MANAGER_WIDGET/Common/API/TVKeyValue.js'
  ];

  Samsung.init = function (cb,scope) {
    var self = this;

    if (this.version > 2011) {
      SB.addExternalJS(this.files, function () {
        self.onReady(cb,scope);
      });
    } else {
      this.onReady(cb,scope);
    }
  };

  Samsung.onDetect = function () {
    var version = this.getVersion();
    if (version <= 2011) {
      var htmlString = '';

      for (var i = 0; i < this.files.length; i++) {
        htmlString += '<script type="text/javascript" src="' + this.files[i] + '"></script>';
      }
      for (var id in plugins) {
        htmlString += '<object id=' + id + ' border=0 classid="clsid:' + plugins[id] + '" style="opacity:0.0;background-color:#000000;width:0px;height:0px;"></object>';
      }
      document.write(htmlString);
    }
  };

  /**
   * Return version of samsung smart tv
   * @returns {number}
   */
  Samsung.getVersion = function () {
    var ua,
      version;

    if ( !this.version ) {
      ua = navigator.userAgent.toLowerCase();
      if ( ua.indexOf('maple 5') >= 0 ) {
        version = 2010;
      } else if ( ua.indexOf('maple 6') >= 0 ) {
        version = 2011;
      } else if ( ua.indexOf('smarttv; maple2012') >= 0 ) {
        version = 2012;
      } else if ( ua.indexOf('maple') >= 0 ) {
        version = 2013;
      }

      this.version = version;
    }

    return this.version;
  };

  /**
   * Function calls when all samsung files and objects are ready
   */
  Samsung.onReady = function (cb,scope) {

    alert('Ready calls');

    this.setPlugins();

    var NNAVIPlugin = this.pluginObjectNNavi,
      TVPlugin = this.pluginObjectTV,
      PL_NNAVI_STATE_BANNER_NONE = 0,
      PL_NNAVI_STATE_BANNER_VOL = 1,
      PL_NNAVI_STATE_BANNER_VOL_CH = 2,
      self = this;

    this.tvKey = new Common.API.TVKeyValue();
    this.pluginAPI = new Common.API.Plugin();
    this.widgetAPI = new Common.API.Widget();

    this.modelCode = NNAVIPlugin.GetModelCode();
    this.firmware = NNAVIPlugin.GetFirmware();
    this.systemVersion = NNAVIPlugin.GetSystemVersion(0);
    this.productCode = TVPlugin.GetProductCode(1);

    this.productType = TVPlugin.GetProductType();

    this.setKeys();

    this.pluginAPI.SetBannerState(1);
    this.pluginAPI.setOffScreenSaver();
    NNAVIPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL_CH);

    function unregisterKey(key){
      try{
        self.pluginAPI.unregistKey(self.tvKey['KEY_'+key]);
      }catch(e){
        $$error(e);
      }
    }

    if (!SB.config.customVolumeEnable) {
      unregisterKey('VOL_UP');
      unregisterKey('VOL_DOWN');
      unregisterKey('MUTE');
    }

    this.widgetAPI.sendReadyEvent();

    if (cb) {
      cb.call(scope || window);
    }
  };

  Samsung.setKeys = function () {
    var keys = this.keys = {};

    for (var key in this.tvKey) {
      if (this.tvKey.hasOwnProperty(key)) {
        // key name starts with 'KEY_'
        keys[key.slice(4)] = this.tvKey[key];
      }
    }

    this.keys['RW'] = 69;

    document.body.onkeydown = function ( event ) {
      var keyCode = event.keyCode;
      $$log('keyDown ' + keyCode);

      switch ( keyCode ) {
        case keys.RETURN:
        case keys.EXIT:
        case 147:
        case 261:
          event.preventDefault();
          break;
        default:
          break;
      }
    }
  };

  /**
   * Set plugins for use inner API
   */
  Samsung.setPlugins = function () {
    this.pluginAudio = this.detectPlugin('audio', 'SAMSUNG-INFOLINK-AUDIO');
    this.pluginObjectTV =  this.detectPlugin('pluginObjectTV', 'SAMSUNG-INFOLINK-TV');
    this.pluginObjectTVMW = this.detectPlugin('pluginObjectTVMW', 'SAMSUNG-INFOLINK-TVMW');
    this.pluginObjectNetwork = this.detectPlugin('pluginObjectNetwork', 'SAMSUNG-INFOLINK-NETWORK');
    this.pluginObjectNNavi = this.detectPlugin('pluginObjectNNavi', 'SAMSUNG-INFOLINK-NNAVI');
    this.pluginPlayer = this.detectPlugin('pluginPlayer', 'SAMSUNG-INFOLINK-PLAYER');
    this.pluginSDI = this.detectPlugin('EXTERNALWIDGET', 'SAMSUNG-INFOLINK-EXTERNALWIDGETINTERFACE');
  };

  /**
   * Return node if object exist otherwise create object, appending to DOM and return new node
   * @param id
   * @param clsid
   * @returns {HTMLElement}
   */
  Samsung.detectPlugin = function (id, clsid) {
    var cur = doc.getElementById(id),
      pluginEl;

    if (cur && cur.nodeName.toLowerCase() === 'object') {
     return cur;
    }

    pluginEl = document.createElement('object');
    pluginEl.id = id;
    pluginEl.setAttribute('classid', 'clsid:' + clsid);
    pluginEl.setAttribute('style', 'opacity:0.0;background-color:#000000;width:0px;height:0px;');
    document.body.appendChild(pluginEl);

    return pluginEl;
  };

  Samsung.getFirmware = function () {
    return this.firmware;
  };

  Samsung.getIP = function () {
    return (this.pluginObjectNetwork(1) || this.pluginObjectNetwork.GetIP(0));
  };

  Samsung.checkConnect = function (cb) {
    var status = (this.pluginObjectNetwork.CheckPhysicalConnection(1) == 1 ||
                  this.pluginObjectNetwork.CheckPhysicalConnection(0) == 1);

    cb && cb.call(this, status);
  };

  Samsung.exit = function () {
    this.widgetAPI.sendExitEvent();
  };

  Samsung.sendReturn = function () {
    this.widgetAPI.sendReturnEvent();
  };

  SB.createPlatform('samsung', Samsung);
})(window.SB);