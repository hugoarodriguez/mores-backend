class EnlacePagoRes {
    constructor() {

        this.idEnlace = 0;
        this.idOrderHeader = 0;
        this.urlQrCodeEnlace = "";
        this.urlEnlace = "";
        this.estaProductivo = false;
    }

    getObjectAsString() {
        return JSON.stringify(this)
    }

}

module.exports = EnlacePagoRes;