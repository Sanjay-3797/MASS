/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/worksheet/worksheet/model/models",
  ],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("com.worksheet.worksheet.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();
        this.setModel(models.createDeviceModel(), "device");
        sap.ui.loader.config({
          paths: {
            "com/list/masslist": "/sap/bc/ui5_ui5/sap/zmassmatproc",
          }
        });
        //jQuery.sap.registerModulePath("zmassmatproc", "/sap/bc/ui5_ui5/sap/zmassmatproc");
      },
    });
  }
);
