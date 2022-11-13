class OrderDetailT {

    constructor(idOrderDetailT, idOrderHeaderT, idBreadType, breadTypeName, idProduct, idProductType, productTypeName, 
        idPSP, idProductSize, productSizeName, basePrice, idCTPI, coverTypeName, ctpiPriceIncrease, idDTPI, decorationTypeName, 
        dtpiPriceIncrease, idFillingType, fillingTypeName, cakeDedication, clientDetails, suggestedPictureURL, quantity, amount) {

        this.idOrderDetailT = idOrderDetailT === null || idOrderDetailT === undefined ? 0 : idOrderDetailT;
        this.idOrderHeaderT = idOrderHeaderT === null || idOrderHeaderT === undefined ? 0 : idOrderHeaderT;
        this.idBreadType = idBreadType === null || idBreadType === undefined ? 0 : idBreadType;
        this.breadTypeName = breadTypeName === null || breadTypeName === undefined ? "" : breadTypeName;
        this.idProduct = idProduct === null || idProduct === undefined ? 0 : idProduct;
        this.idProductType = idProductType === null || idProductType === undefined ? 0 : idProductType;
        this.productTypeName = productTypeName === null || productTypeName === undefined ? "" : productTypeName;
        this.idPSP = idPSP === null || idPSP === undefined ? 0 : idPSP;
        this.idProductSize = idProductSize === null || idProductSize === undefined ? 0 : idProductSize;
        this.productSizeName = productSizeName === null || productSizeName === undefined ? "" : productSizeName;
        this.basePrice = basePrice === null || basePrice === undefined ? 0.0 : basePrice;
        this.idCTPI = idCTPI === null || idCTPI === undefined ? 0 : idCTPI;
        this.coverTypeName = coverTypeName === null || coverTypeName === undefined ? "" : coverTypeName;
        this.ctpiPriceIncrease = ctpiPriceIncrease === null || ctpiPriceIncrease === undefined ? 0.0 : ctpiPriceIncrease;
        this.idDTPI = idDTPI === null || idDTPI === undefined ? 0 : idDTPI;
        this.decorationTypeName = decorationTypeName === null || decorationTypeName === undefined ? "" : decorationTypeName;
        this.dtpiPriceIncrease = dtpiPriceIncrease === null || dtpiPriceIncrease === undefined ? 0.0 : dtpiPriceIncrease;
        this.idFillingType = idFillingType === null || idFillingType === undefined ? 0 : idFillingType;
        this.fillingTypeName = fillingTypeName === null || fillingTypeName === undefined ? "" : fillingTypeName;
        this.cakeDedication = cakeDedication === null || cakeDedication === undefined ? "" : cakeDedication;
        this.clientDetails = clientDetails === null || clientDetails === undefined ? "" : clientDetails;
        this.suggestedPictureURL = suggestedPictureURL === null || suggestedPictureURL === undefined ? "" : suggestedPictureURL;
        this.quantity = quantity === null || quantity === undefined ? 0 : quantity;
        this.amount = amount === null || amount === undefined ? 0.0 : amount;

    }

    //IdOrderDetailT
    getIdOrderDetailT() {
        return this.idOrderDetailT;
    }

    setIdOrderDetailT(idOrderDetailT) {
        this.idOrderDetailT = idOrderDetailT;
    }

    //IdOrderHeaderT
    getIdOrderHeaderT() {
        return this.idOrderHeaderT;
    }

    setIdOrderHeaderT(idOrderHeaderT) {
        this.idOrderHeaderT = idOrderHeaderT;
    }

    //IdBreadType
    getIdBreadType() {
        return this.idBreadType;
    }

    setIdBreadType(idBreadType) {
        this.idBreadType = idBreadType;
    }

    //BreadTypeName
    getBreadTypeName() {
        return this.breadTypeName;
    }

    setBreadTypeName(breadTypeName) {
        this.breadTypeName = breadTypeName;
    }

    //IdProduct
    getIdProduct() {
        return this.idProduct;
    }

    setIdProduct(idProduct) {
        this.idProduct = idProduct;
    }

    //IdProductType
    getIdProductType() {
        return this.idProductType;
    }

    setIdProductType(idProductType) {
        this.idProductType = idProductType;
    }
    
    //ProductTypeName
    getProductTypeName() {
        return this.productTypeName;
    }
    
    setProductTypeName(productTypeName) {
        this.productTypeName = productTypeName;
    }
    
    //IdPSP
    getIdPSP() {
        return this.idPSP;
    }

    setIdPSP(idPSP) {
        this.idPSP = idPSP;
    }

    //IdProductSize
    getIdProductSize() {
        return this.idProductSize;
    }

    setIdProductSize(idProductSize) {
        this.idProductSize = idProductSize;
    }

    //ProductSizeName
    getProductSizeName() {
        return this.productSizeName;
    }
    
    setProductSizeName(productSizeName) {
        this.productSizeName = productSizeName;
    }

    //BasePrice
    getBasePrice() {
        return this.basePrice;
    }
    
    setBasePrice(basePrice) {
        this.basePrice = basePrice;
    }

    //IdCTPI
    getIdCTPI() {
        return this.idCTPI;
    }

    setIdCTPI(idCTPI) {
        this.idCTPI = idCTPI;
    }

    //CoverTypeName
    getCoverTypeName() {
        return this.coverTypeName;
    }
    
    setCoverTypeName(coverTypeName) {
        this.coverTypeName = coverTypeName;
    }

    //CTPIPriceIncrease
    getCTPIPriceIncrease() {
        return this.ctpiPriceIncrease;
    }
    
    setCTPIPriceIncrease(ctpiPriceIncrease) {
        this.ctpiPriceIncrease = ctpiPriceIncrease;
    }

    //IdDTPI
    getIdDTPI() {
        return this.idDTPI;
    }

    setIdDTPI(idDTPI) {
        this.idDTPI = idDTPI;
    }

    //DecorationTypeName
    getDecorationTypeName() {
        return this.decorationTypeName;
    }
    
    setDecorationTypeName(decorationTypeName) {
        this.decorationTypeName = decorationTypeName;
    }

    //DTPIPriceIncrease
    getDTPIPriceIncrease() {
        return this.dtpiPriceIncrease;
    }
    
    setDTPIPriceIncrease(dtpiPriceIncrease) {
        this.dtpiPriceIncrease = dtpiPriceIncrease;
    }

    //IdFillingType
    getIdFillingType() {
        return this.idFillingType;
    }

    setIdFillingType(idFillingType) {
        this.idFillingType = idFillingType;
    }

    //FillingTypeName
    getFillingTypeName() {
        return this.fillingTypeName;
    }

    setFillingTypeName(fillingTypeName) {
        this.fillingTypeName = fillingTypeName;
    }

    //CakeDedication
    getCakeDedication() {
        return this.cakeDedication;
    }

    setCakeDedication(cakeDedication) {
        this.cakeDedication = cakeDedication;
    }

    //ClientDetails
    getClientDetails() {
        return this.clientDetails;
    }

    setClientDetails(clientDetails) {
        this.clientDetails = clientDetails;
    }

    //SuggestedPictureURL
    getSuggestedPictureURL() {
        return this.suggestedPictureURL;
    }

    setSuggestedPictureURL(suggestedPictureURL) {
        this.suggestedPictureURL = suggestedPictureURL;
    }

    //Quantity
    getQuantity() {
        return this.quantity;
    }

    setQuantity(quantity) {
        this.quantity = quantity;
    }

    //Amount
    getAmount() {
        return this.amount;
    }

    setAmount(amount) {
        this.amount = amount;
    }
}

module.exports = OrderDetailT;