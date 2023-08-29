sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "../model/formatter",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "turnosmedicos/util/Constants"

],

    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, JSONModel, MessageToast, formatter, Filter, FilterOperator, Constants) {
        "use strict";

        return Controller.extend("turnosmedicos.controller.Detail", {
            formatter:formatter,
            
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteDetail").attachPatternMatched(this._onRouteMatched, this);
                
                var oDataturno={
                    turno_nuevo:{
                        ID_MEDICO: "",
                        TURNO : "",
                        PACIENTE : "",
                        Hora : "",
                        Dia : ""
                    }
                
                    
                };
                var oModelturno = new JSONModel(oDataturno);
                this.getView().setModel(oModelturno,"mTurno");
                
            },
            _onRouteMatched: function (oEvent) {
                var oArgs, oView;
                oArgs = oEvent.getParameter("arguments");
                this.getView().getModel("mTurno").setProperty("/turno_nuevo/ID_MEDICO", oArgs.pID)
                oView = this.getView();
                oView.bindElement({
                    // path: "/MEDICOSSet('" + toString(oArgs.pID) + "')",
                    path: `/MEDICOSSet('${oArgs.pID}')`,
                    events: {
                        dataRequested: function () {
                            oView.setBusy(true);
                        },
                        dataReceived: function () {
                            oView.setBusy(false);
                        }
                    }
                });

                var oDatos = this.getView().getModel();
                var that = this;
                var sPath = `/MEDICOSSet('${oArgs.pID}')/toTURNOSSet`;
                oDatos.read(sPath, {
                    success: function (response){
                        that.getView().setModel(new JSONModel(response.results), "mTurnosSacados") ;

                    }
                });
            },
            onNavPress: function () {
                this.getView().getModel("mTurno").setProperty("/turno_nuevo/ID_MEDICO","");
                this.getView().getModel("mTurno").setProperty("/turno_nuevo/TURNO","");
                this.getView().getModel("mTurno").setProperty("/turno_nuevo/PACIENTE","");
                this.getView().getModel("mTurno").setProperty("/turno_nuevo/Hora","");
                this.getView().getModel("mTurno").setProperty("/turno_nuevo/Dia","");
                var oWizard = this.byId("myWizard");
                var oFirstStep = oWizard.getSteps()[0];
                oWizard.discardProgress(oFirstStep);
                // scroll to top
                oWizard.goToStep(oFirstStep);

                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteMaster", {}, true);
                }
                
            },
            onCreateTurno: function(oEvent){
                var that = this;
                var OData = this.getView().getModel(); 
                var sPath ="/TURNOSSet"
                var Nuevo_paciente = this.getView().getModel("mTurno").getProperty("/turno_nuevo/PACIENTE");
                var Dia = this.getView().getModel("mTurno").getProperty("/turno_nuevo/Dia");
                var Hora = this.getView().getModel("mTurno").getProperty("/turno_nuevo/Hora");
                var Nuevo_turno = Dia + " " + Hora;
                Nuevo_turno = Nuevo_turno.substring(0, 20)
                this.getView().getModel("mTurno").setProperty("/turno_nuevo/TURNO", Nuevo_turno)
                Nuevo_turno = new Date(Nuevo_turno)
                var Medico = oEvent.getSource().getBindingContext().getProperty("ID_MEDICO");

                var data ={
                    "ID_MEDICO" : Medico,
                    "TURNO" : Nuevo_turno,
                    "PACIENTE" : Nuevo_paciente   
                }
                OData.create(sPath,data, {
                    success: function (response) {
                        var oView = that.getView();
                        if (!that._myDialog){
                            that._myDialog = sap.ui.xmlfragment("IdFragment2",Constants.model.routes.FRAGMENTS.FragFin, that);
                        oView.addDependent(that._myDialog);
                        debugger
                }
                that._myDialog.open();
                    },
                    error: function (error) {
                        MessageToast.show("{i18n>error}")
                        debugger
                    },
                })
            },
            handleCalendarSelect: function(oEvent){
                var oCalendar = oEvent.getSource(),
                aSelectedDates = oCalendar.getSelectedDates(),
				oDate = aSelectedDates[0].getStartDate().toString(),
                Dia = oDate.substring(4, 15);

                this.getView().getModel("mTurno").setProperty("/turno_nuevo/Dia",Dia);

                var filtros= [];
                
                var hora0= "00:00:00 GMT-0300";
                var diayhora0 = Dia + " " + hora0;
                var hora1 = "18:00:00 GMT-0300";
                var diayhora1 = Dia + " " + hora1;
                diayhora0 = new Date(diayhora0);
                diayhora1 = new Date(diayhora1);
                var id_medico = this.getView().getModel("mTurno").getProperty("/turno_nuevo/ID_MEDICO");
                var list = this.getView().byId("ListaHorarios");
                var binding = list.getBinding("items");
                if(id_medico && id_medico.length > 0 ){
                    filtros.push(new Filter("ID_MEDICO", FilterOperator.EQ, id_medico));
                }
                if(Dia && Dia.length > 0 ){
                    filtros.push(new Filter("DIAOBTENIDO", FilterOperator.BT, diayhora0, diayhora1));
                }
                binding.filter(filtros);


            },
            onHandleList: function(oEvent){
                var oItem = oEvent.getSource();
                var Hora = oItem.getBindingContext().getProperty("HORA");
                debugger
                this.getView().getModel("mTurno").setProperty("/turno_nuevo/Hora",Hora);
            },
            onCloseDialog: function(){
                this._myDialog.close();
                onNavPress();
            }
        });
    });