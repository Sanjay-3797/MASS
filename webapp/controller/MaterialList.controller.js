sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    JSONModel,
    
  ) {
    "use strict";
    return Controller.extend(
      "com.worksheet.worksheet.controller.MaterialList",
      {
        onInit: function () {
          this.getOwnerComponent()
            .getRouter()
            .getRoute("RouteMaterialList")
            .attachPatternMatched(this.patternMatch, this);
          
          this.sheetNames = [];
          this.sheetData = [];
          this.fileContent = [];
          this.mattype = [];
          this.error = [];
          this.getView().setModel(new JSONModel(), "excelData");
        },
        patternMatch: function (oEvent) {
          var id = oEvent.getParameters().arguments.id;
          let newArr = id.split(",");
          let list = newArr.map((item) => {
            return { mType: item };
          });
          this.getOwnerComponent().getModel("MaterialType").setData({ list });
        },
        
        onExport: function (e) {
          this.table = this.getView().byId("Mtype_table");
          this.table.setBusy(true);
          this.mtype = e
            .getSource()
            .getParent()
            .getCells()[0]
            .getProperty("title");
          var oModel = this.getOwnerComponent().getModel(
            "ZP_QU_DG_CONFGREQ_CDS"
          );
          var sPath = "/ZP_QU_DG_CONFGREQ";
          var aFilters = [
            new sap.ui.model.Filter(
              "Mattype",
              sap.ui.model.FilterOperator.EQ,
              this.mtype
            ),
          ];
          var that = this;
          oModel.read(sPath, {
            filters: aFilters,
            success: function (res) {
              this.sheetName = res;
              if (!res.results.length) {
                sap.m.MessageBox.error("Your Material Type contains Empty");
                this.table.setBusy(false);
                return;
              }
              var configId = res.results[0].Configid;
              // Assuming you get an array of results
              var Spath =
                "/ZP_QU_DG_CONFGREQ(guid'" + configId + "')/to_confgview";
              var bFilters = [
                new sap.ui.model.Filter(
                  "Hidden",
                  sap.ui.model.FilterOperator.NE,
                  "true"
                ),
              ];
              var sorter = [new sap.ui.model.Sorter("Descrip", false)];
              oModel.read(Spath, {
                filters: bFilters,
                sorters: sorter,
                success: function (res) {
                  this.read(res);
                }.bind(this),
                error: function (err) {
                  sap.m.MessageBox.error(
                    "Cannot Fetch Data:" + JSON.stringify(err)
                  );
                  that.table.setBusy(false);
                },
              });
            }.bind(this),
            error: function (err) {
              sap.m.MessageBox.error(
                "Cannot Fetch Data :" + JSON.stringify(err)
              );
              that.table.setBusy(false);
            },
          });
        },
        read: function (res) {
          this.wsheetName = [];
          var that = this;
          res.results.forEach(function (data) {
            that.wsheetName.push(data.Descrip);
          });
          var oModel = this.getOwnerComponent().getModel(
            "ZP_QU_DG_CONFGREQ_CDS"
          );
          var sPath = [];
          res.results.forEach((data) => {
            sPath.push(
              "/ZP_QU_DG_CONFGVIEW(Configid=guid'" +
                data.Configid +
                "',Viewid='" +
                data.Viewid +
                "')/to_confgfld"
            );
          });
          this.sheetDatas = [];
          var successfulReads = 0;
          var totalPaths = sPath.length;

          sPath.forEach((data) => {
            oModel.read(data, {
              success: function (res) {
                this.sheetDatas.push(res);
                successfulReads++;
                if (successfulReads === totalPaths) {
                  // Call your function here
                  this.Export(this.sheetDatas);
                }
              }.bind(this),
              error: function (err) {
                sap.m.MessageBox.error(
                  "Cannot Fetch Data :" + JSON.stringify(err)
                );
                that.table.setBusy(false);
              },
            });
          });
        },
        Export: function (data) {
          console.log(data);
          var that = this;
          var workbook = XLSX.utils.book_new();
          var fileName = this.mtype + ".xlsx";

          data.forEach((dataItem, index) => {
            var headers = [];
            var formattedData = [];

            dataItem.results.forEach(function (row) {
              headers.push(row.Fldname);
              formattedData.push(row.Descrip);
            });

            var worksheet = XLSX.utils.aoa_to_sheet([headers, formattedData]);

            var colWidths = headers.map(() => ({ wch: 17 }));
            worksheet["!cols"] = colWidths;
            var sheetName = this.wsheetName[index % this.wsheetName.length]; // Loop through sheetNames in a circular manner
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            if (index === data.length - 1) {
              // This is the last iteration
              XLSX.writeFile(workbook, fileName, {
                bookType: "xlsx",
                type: "file",
              });
              that.table.setBusy(false);
            }
          });
        },

        onSubmitExcel: function (oEvent) {
          debugger        
          let oTable = this.getView().byId("Mtype_table").getItems();
          let aFileUploader = [];
          oTable.forEach((item) => {
            aFileUploader.push(item.getAggregation("cells")[2]);
          });
          var empty=0
          aFileUploader.forEach((data) => {
            if(data.getProperty('value')!==''){
              empty+=1;
            }
          })
          if(empty>0){
            var oModel = this.getOwnerComponent().getModel('ZQU_DG_MATERIAL_MASS_UPLOAD_SRV');
            var sPath = "/MassUploadSet";
            oModel.read(sPath, {
                success: function(res) {
                    this.processMassUpload(res.results[0].REQID)
                }.bind(this),
                error: function(err) {
                    sap.m.MessageBox.error("Cannot Fetch Data :" + JSON.stringify(err));
                }
            });
          }
          else{
            sap.m.MessageBox.error('Please upload atleast one Material File')
            return
          }
        },
        processMassUpload: function (reqid) {
          let oTable = this.getView().byId("Mtype_table").getItems();
          let aFileUploader = [];
          let that = this;
          this.reqid = reqid;
          oTable.forEach((item) => {
            aFileUploader.push(item.getAggregation("cells")[2]);
          });
          this.count = 0;
          aFileUploader.forEach((data) => {
            var oDataModel = that
              .getView()
              .getModel("ZQU_DG_MATERIAL_MASS_UPLOAD_SRV");
            var sTokenForUpload = oDataModel.getSecurityToken();
            var oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
              name: "X-CSRF-Token",
              value: sTokenForUpload,
            });

            var sFile = data.getValue();
            var oHeaderSlug = new sap.ui.unified.FileUploaderParameter({
              name: "SLUG",
              value: `${sFile}|${reqid}`,
            });

            //Header parameter need to be removed then added.
            data.removeAllHeaderParameters();
            data.addHeaderParameter(oHeaderParameter);
            data.addHeaderParameter(oHeaderSlug);
            var sUrl = oDataModel.sServiceUrl + "/MassUploadSet";
            data.setUploadUrl(sUrl);
            data.upload();
            this.count++;
          });
        },
        handleUploadComplete: function (oEvent) {
          var sResponse = oEvent.getParameter("status");
          let error = oEvent.getParameters("response").response;
          if (sResponse === 201 || sResponse === 202 || sResponse === 204) {
            sap.m.MessageToast.show(
              `Files (${this.count}) uploaded Successfully`
            );
            this.getOwnerComponent().getRouter().navTo("RouteListReport",{id:this.reqid});
            // Seee -----------------------------------------------------------------------------
          } else {
            sap.m.MessageToast.show("Upload Failed" + error);
          }
        }
      }
    );
  }
);
