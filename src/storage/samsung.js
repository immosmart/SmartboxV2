(function () {
  "use strict";

  function setSamsungStorage() {
    var lStorage,
      keys = {},
      fileSysObj,
      commonDir,
      fileName,
      fileObj;

    if (typeof window.Filesystem === 'function' && !window.localStorage) {
      fileSysObj = new FileSystem();
      commonDir = fileSysObj.isValidCommonPath(curWidget.id);

      if ( !commonDir ) {
        fileSysObj.createCommonDir(curWidget.id);
      }
      fileName = curWidget.id + "_localStorage.db";
      fileObj = fileSysObj.openCommonFile(fileName, "r+");

      if ( fileObj ) {
        try {
          keys = JSON.parse(fileObj.readAll());
        } catch (e) {}
      } else {
        fileObj = fileSysObj.openCommonFile(fileName, "w");
        fileObj.writeAll("{}");
      }
      fileSysObj.closeCommonFile(fileObj);
    }

    function saveStorage() {
        fileObj = fileSysObj.openCommonFile(fileName, "w");
        fileObj.writeAll(JSON.stringify(keys));
        fileSysObj.closeCommonFile(fileObj);
    }

    lStorage = {
      keys: keys,
      setItem: function ( key, value ) {
        this.keys[key] = value;
        saveStorage();
        return value;
      },
      getItem: function ( key ) {
        return this.keys[key];
      },
      removeItem: function (key) {
        delete this.keys[key];
        saveStorage();
      },
      clear: function (  ) {
        this.keys = {};
        saveStorage();
      }
    };

    SB.storage = new SB._modules.Storage(lStorage);
  }

  SB.readyForPlatform('samsung', setSamsungStorage);

})();