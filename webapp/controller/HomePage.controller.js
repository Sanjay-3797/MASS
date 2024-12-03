sap.ui.define(
  [
    "sap/ui/core/mvc/Controller"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller
  ) {
    "use strict";

    return Controller.extend("com.worksheet.worksheet.controller.HomePage", {
      onInit: function () {
        this.aSelectedKeys = [];
      },

      formatMaterialType: function (materialType) {
        var materialTypeText = this.getView()
          .getModel("ZC_QU_DG_MATERIALREQUESTS_CDS")
          .getProperty(
            "/I_MaterialType('" + materialType + "')/MaterialType_Text"
          );
        return materialType + " (" + materialTypeText + ")";
      },
      validMaterial:function(){
        
        var hasDuplicates = new Set(this.aSelectedKeys).size !== this.aSelectedKeys.length;

        if (hasDuplicates) {
            sap.m.MessageBox.error("Error: Array contains duplicates");
        } else {
          let str = this.aSelectedKeys.join(',');
          if(str===''){
            sap.m.MessageBox.error("Please Select atleast one material")
            return
          }else{
            this.getOwnerComponent().getRouter().navTo("RouteMaterialList",{id:str});
          }
        }
      },

      onFirstOptionsChange: function (oEvent) {
        var id=oEvent.getSource().getId();
        var that = this;
        var selectedValue=oEvent.getSource().getValue()
        var sSelectedKey = oEvent.getSource().getSelectedItem().getKey();
        this.aSelectedKeys.forEach(function (oContent) {
          if (oContent === sSelectedKey) {
            sap.ui.getCore().byId(id).setValueState('Error')
            sap.ui.getCore().byId(id).setValueStateText('Duplicate Material Type Detected');
            sap.ui.getCore().byId(id).setValue('')
          }else{
            if(sap.ui.getCore().byId(id).getValueState() === 'Error'){
            sap.ui.getCore().byId(id).setValueState('None')
            sap.ui.getCore().byId(id).setValue(selectedValue)
            }
          }
        });
        this.aComboBoxes = this.getView()
          .byId("grid-2")
          .getContent()
          .filter(function (oContent) {
            return oContent instanceof sap.m.ComboBox;
          });
        var length = this.aComboBoxes.length - 1;
        var nIndex = this.aSelectedKeys.indexOf(sSelectedKey);
        if (nIndex === -1 && this.aComboBoxes[length].getValue() !== "") {
          this.aSelectedKeys.push(sSelectedKey);
          this.createComboBox(sSelectedKey, oEvent);
          debugger;
        } else {
          this.aSelectedKeys = [];
          this.getView().byId("grid-2").getContent().filter(function (oContent) {
              if (
                oContent instanceof sap.m.ComboBox &&
                oContent.getSelectedItem()
              ) {
                var selectedKey = oContent.getSelectedItem().getKey();
                that.aSelectedKeys.push(selectedKey);
              }
            });
          this.aSelectedKeys[nIndex] = sSelectedKey;
          debugger;
          this.updateComboBoxFilter(sSelectedKey);
        }
      },

      createComboBox: function (sSelectedKey, oEvent) {
        this.aFilters = [];
        var that = this;
        this.aComboBoxes.forEach(function (SelectedKey) {
          that.aFilters.push(
            new sap.ui.model.Filter(
              "MaterialType",
              sap.ui.model.FilterOperator.NE,
              "'" + SelectedKey.getSelectedKey() + "'"
            )
          );
        });
        var oComboBox = new sap.m.ComboBox({
          items: {
            path: "ZC_QU_DG_MATERIALREQUESTS_CDS>/I_MaterialType",
            template: new sap.ui.core.ListItem({
              key: "{ZC_QU_DG_MATERIALREQUESTS_CDS>MaterialType}",
              text: {
                parts: [
                  { path: "ZC_QU_DG_MATERIALREQUESTS_CDS>MaterialType" },
                  { path: "ZC_QU_DG_MATERIALREQUESTS_CDS>MaterialType_Text" },
                ],
                formatter: function (materialType, materialTypeText) {
                  return materialType + " (" + materialTypeText + ")";
                },
              },
            }),
            filters: new sap.ui.model.Filter(that.aFilters, true),
          },
          change: this.onFirstOptionsChange.bind(this)
        });
        var oLabel = new sap.m.Label({
          text: "Material Type",
          labelFor: oComboBox,
        });
        oEvent.getSource().detachChange(this.onComboBoxChange, this);
   this.getView().byId("grid-2").addContent(oLabel);
   this.getView().byId("grid-2").addContent(oComboBox);
      },

      updateComboBoxFilter: function (sSelectedKey) {
        var aContent = this.getView().byId("grid-2").getContent();
        var that = this;
        this.aFilters=[]
        var oComboBox = this.getView().byId("grid-2").getContent()[
          aContent.length - 1
        ];
        aContent.forEach(function (oContent) {
          if (
            oContent instanceof sap.m.ComboBox &&
            oContent.getSelectedItem()
          ) {
            var selectedKey = oContent.getSelectedItem().getKey();
              that.aFilters.push(
                new sap.ui.model.Filter(
                  "MaterialType",
                  sap.ui.model.FilterOperator.NE,
                  "'" + selectedKey + "'"
                )
              );
          }
        });
        console.log(this.aFilters);
        oComboBox.bindAggregation("items", {
          path: "ZC_QU_DG_MATERIALREQUESTS_CDS>/I_MaterialType",
          template: new sap.ui.core.ListItem({
            key: "{ZC_QU_DG_MATERIALREQUESTS_CDS>MaterialType}",
            text: {
              parts: [
                { path: "ZC_QU_DG_MATERIALREQUESTS_CDS>MaterialType" },
                { path: "ZC_QU_DG_MATERIALREQUESTS_CDS>MaterialType_Text" },
              ],
              formatter: function (materialType, materialTypeText) {
                return materialType + " (" + materialTypeText + ")";
              },
            },
          }),
          filters: new sap.ui.model.Filter(that.aFilters, true),
        });
      },
    });
  }
);
