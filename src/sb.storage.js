(function () {

  var deviceStorage = function(plugin) {
    this._plugin = plugin;
    return this;
  };

  var proto = deviceStorage.prototype;

  proto.setData = function (name, val) {
    this._plugin.setItem(name, JSON.stringify(val))
  };

  proto.getData = function (name) {
    var result;

    try {
      result = JSON.parse(this._plugin.getItem(name));
    } catch(e) {}

    return result;
  };

  proto.removeData = function(name) {
    this._plugin.removeItem(name);
  };

  SB._modules.Storage = deviceStorage;

  if (typeof localStorage === 'object') {
    SB.storage = new deviceStorage(localStorage);
  } else {
    SB.storage = new deviceStorage({
      setItem: $.noop,
      getItem: $.noop,
      removeItem: $.noop
    });
  }
})();