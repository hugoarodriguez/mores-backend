//Objeto que retorna la petición realizada al endpoint /EnlacePago/{id} de wompi

class EnlacePagoByIdRes {
    constructor() {

        this.idAplicativo = "";
        this.nombreEnlace = "";
        this.monto = 0;
        this.nombreProducto = "";
        this.usable = true;
        this.transaccionCompra = {
            datosAdicionales: {
                additionalProp1: "",
                additionalProp2: "",
                additionalProp3: ""
            },
            resultadoTransaccion: "",
            fechaTransaccion: "",
            montoOriginal: 0,
            idTransaccion: "",
            esReal: true,
            esAprobada: true,
            codigoAutorizacion: "",
            mensaje: "",
            formaPago: "",
            monto: 0
        };
        this.cantidadIntentoPagoFallidos = 0;
        this.formaPago = {
            permitirTarjetaCreditoDebido: true,
            permitirPagoConPuntoAgricola: true,
            permitirPagoEnCuotasAgricola: true,
            permitirPagoEnBitcoin: true
        };
        this.infoProducto = {
            descripcionProducto: "",
            urlImagenProducto: ""
        };
        this.configuracion = {
            urlRedirect: "",
            esMontoEditable: true,
            esCantidadEditable: true,
            cantidadPorDefecto: 0,
            duracionInterfazIntentoMinutos: 0,
            urlRetorno: "",
            emailsNotificacion: "",
            urlWebhook: "",
            telefonosNotificacion: "",
            notificarTransaccionCliente: true
        };
        this.cantidadMaximaCuotas = 0;
        this.transacciones = [
            {
                datosAdicionales: {
                    additionalProp1: "",
                    additionalProp2: "",
                    additionalProp3: ""
                },
                resultadoTransaccion: "",
                fechaTransaccion: "",
                montoOriginal: 0,
                idTransaccion: "",
                esReal: true,
                esAprobada: true,
                codigoAutorizacion: "",
                mensaje: "",
                formaPago: "",
                monto: 0
            }
        ];
        this.nombreAplicativo = "";
        this.cantidadPagosExitosos = 0;
        this.imagenes = [
            {
                url: "",
                esPrincipal: true
            }
        ];
        this.vigencia = {
            fechaInicio: "",
            fechaFin: ""
        };
        this.limitesDeUso = {
            cantidadMaximaPagosExitosos: 0,
            cantidadMaximaPagosFallidos: 0
        };
        this.idEnlace = 0;
        this.urlQrCodeEnlace = "";
        this.urlEnlace = "";
        this.estaProductivo = true

    }

    getObjectAsString() {
        return JSON.ify(this)
    }

}

module.exports = EnlacePagoByIdRes;