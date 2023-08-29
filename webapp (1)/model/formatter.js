sap.ui.define([], function () {
    "use strict";
    return {

    estadoTurno: function (sDispo)
    {
        if (sDispo === "T") {
            return "Success"
        }
        else{
            return "Error";
        }
        
        
    },
    textoTurno: function (sDispo)
    {
        if (sDispo === "T") {
            return "TURNO DISPONIBLE"
        }
        else{
            return "TURNO NO DISPONIBLE";
        }
        
        
    },
    iconoMedico:function(sSexo){
        if (sSexo === "m") {
            return "sap-icon://doctor"
        }
        else{
            return "sap-icon://nurse";
        }
    },
    ColoriconoMedico:function(sSexo){
        if (sSexo === "f") {
            return "#FF5151"
        }
        else{
            return "#30BCDE";
        }
    }
    
};
});