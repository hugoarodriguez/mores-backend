class OrderHeaderT {

    constructor(idOrderHeaderT, idAdministrator, idClient, emailClient, idOrderStatus, orderStatusName, idDeliveryLocation, deliveryLocationName, 
        idPayMode, payModeName, dateTaken, deadline, deliveryTime, totalAmount) {

        this.idOrderHeaderT = idOrderHeaderT === null || idOrderHeaderT === undefined ? 0 : idOrderHeaderT;
        this.idAdministrator = idAdministrator === null || idAdministrator === undefined ? 0 : idAdministrator;
        this.idClient = idClient === null || idClient === undefined ? 0 : idClient;
        this.emailClient = emailClient === null || emailClient === undefined ? "" : emailClient;
        this.idOrderStatus = idOrderStatus === null || idOrderStatus === undefined ? 0 : idOrderStatus;
        this.orderStatusName = orderStatusName === null || orderStatusName === undefined ? "" : orderStatusName;
        this.idDeliveryLocation = idDeliveryLocation === null || idDeliveryLocation === undefined ? 0 : idDeliveryLocation;
        this.deliveryLocationName = deliveryLocationName === null || deliveryLocationName === undefined ? "" : deliveryLocationName;
        this.idPayMode = idPayMode === null || idPayMode === undefined ? 0 : idPayMode;
        this.payModeName = payModeName === null || payModeName === undefined ? "" : payModeName;
        this.dateTaken = dateTaken === null || dateTaken === undefined ? "" : dateTaken;
        this.deadline = deadline === null || deadline === undefined ? "" : deadline;
        this.deliveryTime = deliveryTime === null || deliveryTime === undefined ? "" : deliveryTime;
        this.totalAmount = totalAmount === null || totalAmount === undefined ? 0.0 : totalAmount;

    }

    //IdOrderHeaderT
    getIdOrderHeaderT() {
        return this.idOrderHeaderT;
    }

    setIdOrderHeaderT(idOrderHeaderT) {
        this.idOrderHeaderT = idOrderHeaderT;
    }

    //IdAdministrator
    getIdAdministrator() {
        return this.idAdministrator;
    }

    setIdAdministrator(idAdministrator) {
        this.idAdministrator = idAdministrator;
    }

    //IdClient
    getIdClient() {
        return this.idClient;
    }

    setIdClient(idClient) {
        this.idClient = idClient;
    }

    //EmailClient
    getEmailClient() {
        return this.emailClient;
    }

    setEmailClient(emailClient) {
        this.emailClient = emailClient;
    }
    
    //IdOrderStatus
    getIdOrderStatus() {
        return this.idOrderStatus;
    }
    
    setIdOrderStatus(idOrderStatus) {
        this.idOrderStatus = idOrderStatus;
    }
    
    //OrderStatusName
    getOrderStatusName() {
        return this.orderStatusName;
    }

    setOrderStatusName(orderStatusName) {
        this.orderStatusName = orderStatusName;
    }

    //IdDeliveryLocation
    getIdDeliveryLocation() {
        return this.idDeliveryLocation;
    }

    setIdDeliveryLocation(idDeliveryLocation) {
        this.idDeliveryLocation = idDeliveryLocation;
    }

    //DeliveryLocationName
    getDeliveryLocationName() {
        return this.deliveryLocationName;
    }

    setDeliveryLocationName(deliveryLocationName) {
        this.deliveryLocationName = deliveryLocationName;
    }
    
    //IdPayMode
    getIdPayMode() {
        return this.idPayMode;
    }
    
    setIdPayMode(idPayMode) {
        this.idPayMode = idPayMode;
    }

    //PayModeName
    getPayModeName() {
        return this.payModeName;
    }

    setPayModeName(payModeName) {
        this.payModeName = payModeName;
    }

    //DateTaken
    getDateTaken() {
        return this.dateTaken;
    }
    
    setDateTaken(dateTaken) {
        this.dateTaken = dateTaken;
    }

    //Deadline
    getDeadline() {
        return this.deadline;
    }

    setDeadline(deadline) {
        this.deadline = deadline;
    }

    //DeliveryTime
    getDeliveryTime() {
        return this.deliveryTime;
    }

    setDeliveryTime(deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    //TotalAmount
    getTotalAmount() {
        return this.totalAmount;
    }
    
    setTotalAmount(totalAmount) {
        this.totalAmount = totalAmount;
    }
}
module.exports = OrderHeaderT;