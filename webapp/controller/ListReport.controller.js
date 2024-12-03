sap.ui.define([
    "sap/ui/core/mvc/Controller",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,) {
        "use strict";
        return Controller.extend("com.worksheet.worksheet.controller.ListReport", {
            onInit: function () {    
                debugger
                this.confirm=false;  
                this.getOwnerComponent().getRouter().getRoute("RouteListReport").attachPatternMatched(this.patternMatch,this);	
                this.reqid=this.getOwnerComponent().getRouter().getRoute("RouteListReport")._oRouter.oHashChanger.hash.split('/')[1]		
            },
            formatIframeSrc: function () {
                return '<iframe src="http://airdithanaprd.airditsoftware.com:8010/sap/bc/ui5_ui5/sap/zmassmatproc/index.html?parent_reqid=' + this.reqid + 
                       '" class="iFrameClass" loading="eager" allowfullscreen="true" title="CM Report"></iframe>';
            },
            patternMatch:function(oEvent){     
                debugger            
                this.reqid= oEvent.getParameters().arguments.id; 
                this.refreshIframe();   
            }, 
            refreshIframe: function () {
                var oHtmlControl = this.getView().byId("iframeContainer");
                oHtmlControl.setContent(this.formatIframeSrc());
            },
    
            onBeforeRendering: function () {
                var oHtmlControl = this.getView().byId("iframeContainer");
                if (oHtmlControl) {
                    oHtmlControl.setContent("");
                }
            },
    
            onAfterRendering: function () {
                this.refreshIframe(); 
            }
    
        });
    });
