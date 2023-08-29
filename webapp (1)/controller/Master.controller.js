sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "turnosmedicos/util/Constants",
    "../model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, Constants,formatter) {
        "use strict";

        return Controller.extend("turnosmedicos.controller.Master", {
            formatter:formatter,
            onInit: function () {
                
            },
            onFilter:function(){
                var filters= [];

                var Nom = this.getView().byId("_IDGenSearchField1").getValue();
                var Espec = this.getView().byId("_IDGenSearchField2").getValue();
                var tabla = this.getView().byId("TablaMedicos");
                var binding = tabla.getBinding("items");
                if(Nom && Nom.length > 0 ){
                    filters.push(new Filter("NOMBRE_Y_APELLIDO", FilterOperator.Contains, Nom));
                }
                if(Espec && Espec.length > 0 ){
                    filters.push(new Filter("ESPECIALIDAD", FilterOperator.Contains, Espec));
                }
                binding.filter(filters);

            },
            onSacarTurno: function(oEvent){

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var selectedID = oEvent.getSource().getBindingContext().getProperty("ID_MEDICO");
                oRouter.navTo("RouteDetail", {
                    pID: selectedID
                });
            },
            onVerTurnos: function(oEvent){
                
                var OData = this.getView().getModel();
                var selectedID = oEvent.getSource().getBindingContext().getProperty("ID_MEDICO");
                var that = this;
                var sPath = `/MEDICOSSet('${selectedID}')/toTURNOSSet`
                OData.read(sPath,{
                    success: function(response){
                        that.getView().setModel(new JSONModel(response.results), "turnosSacados")
                    }
                })
                var oView = this.getView();
                if (!this.openDialog){
                    this.openDialog = sap.ui.xmlfragment("IdFragment",Constants.model.routes.FRAGMENTS.Fragturnos, this);
                    oView.addDependent(this.openDialog);
                }
                this.openDialog.open();
            },
                
            closeDialog: function (){
                this.openDialog.close();
            }
            
        });
    });
