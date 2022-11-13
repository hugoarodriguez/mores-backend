const config = require("../config");

class EnlacePagoReq {
    constructor() {

        this.identificadorEnlaceComercio = "Pasteleria More's";
        this.monto = 0;
        this.nombreProducto = "";
        this.formaPago = {
            permitirTarjetaCreditoDebido: true,
            permitirPagoConPuntoAgricola: false,
            permitirPagoEnCuotasAgricola: false,
            permitirPagoEnBitcoin: false
        };
        this.infoProducto = {
            descripcionProducto: "",
            urlImagenProducto: "https://thumbsnap.com/i/gjSUQ2Aj.png"
        };
        this.configuracion = {
            esMontoEditable: false,
            esCantidadEditable: false,
            cantidadPorDefecto: 1,
            emailsNotificacion: config.EMAIL_NOTIFICATION,
            telefonosNotificacion: config.PHONE_NOTIFICATION,
            notificarTransaccionCliente: true
        };
        this.vigencia = {
            fechaInicio: "0001-01-01",
            fechaFin: ""
        }

    }

    getObjectAsString() {
        return JSON.stringify(this)
    }

}

module.exports = EnlacePagoReq;