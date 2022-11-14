var express = require('express');
var router = express.Router();

/* Si se está ejecutando de forma local el Kubernete se debe colocar "host.docker.internal", ya que esto permite acceder a la IP
del host donde está corriendo la el Kubernete, si ya está el servicio publicado en AKS, se debe colocar la IP de ese servicio 
proporcionada por AKS */
const apiAdapter = require('./apiAdapter');
//const BASE_URL = 'http://host.docker.internal:5002';
const BASE_URL = 'http://10.0.146.92:5002';
const api = apiAdapter(BASE_URL);
const isValidated = require('../requestValidator');
const utils = require('../utils');
const mailSender = require('../mailSender');
const OrderDetail = require('../models/OrderDetail.js');
const OrderHeader = require('../models/OrderHeader.js');
const OrderHeaderT = require('../models/OrderHeaderT');
const config = require('../config');
const { generateEnlacePago, generateToken, checkEnlacePago } = require('../wompiRequests');
const EnlacePagoReq = require('../models/EnlacePagoReq');
const EnlacePagoRes = require('../models/EnlacePagoRes');
const EnlacePagoByIdRes = require('../models/EnlacePagoByIdRes');

//Constantes para valores de OrderStatuses
const OS_RECIBIDO = 1;
const OS_DENEGADO = 2;
const OS_ACEPTADO = 3;
const OS_CANCELADO = 4;
const OS_ELABORANDO = 5;
const OS_COMPLETADO = 6;
const OS_ENTREGADO = 7;

//Constantes para Id de Tipos de Productos (Campo idProductType)
const ID_PT_PASTEL = 1;
const ID_PT_TRESLECHES = 2;
const ID_PT_GALLETA = 3;
const ID_PT_CUPCAKE = 4;
const ID_PT_ALFAJOR = 5;

//Constantes para valores de PayModes
const ID_PAY_MODE_EFECTIVO = 1;
const ID_PAY_MODE_DIGITAL = 2;

//Constantes para niveles de usuario
const UL_ADMINISTRATOR = 1;
const UL_CLIENT = 2;

//Máximo de días de diferencia entre la fecha actual y la fecha de entrega (Deadline) del pedido
const MIN_DAYS_DIFFERENCE = 3;

/********************************************* Peticiones para Tabla DeliveryLocation - Inicio *********************************************/
function verifyDeliveryLocationExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/deliverylocations/VerifyDeliveryLocationExistence", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function verifyDeliveryLocationUsing(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/deliverylocations/VerifyDeliveryLocationUsing", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//InsertDeliveryLocation
router.post("/api/orders/InsertDeliveryLocation", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Lugar de Entrega
    //result.result >0 indica que se registró el Lugar de Entrega
    //result.result -1 Ya existe un Lugar de Entrega con ese nombre
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Lugar de Entrega registrado con este nombre
        result.result = await verifyDeliveryLocationExistence(req);

        if (result.result === 0) {

            api.post('/api/deliverylocations/InsertDeliveryLocation', req.body).then(resp => {

                result.result = resp.data;

                if (result.result > 0) {

                    res.json(result);

                } else if (result.result === 0) {

                    res.json(result);

                } else {

                    result.result = -2;
                    res.json(result);

                }

            });
        } else {

            //ProductsMicroservice retorna: -1 = Lugar de Entrega existente, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//UpdateDeliveryLocation
router.post("/api/orders/UpdateDeliveryLocation", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó
    //result.result >0 indica que se actualizó
    //result.result -1 Ya existe un Lugar de Entrega con ese nombre
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Lugar de Entrega registrado con este nombre
        result.result = await verifyDeliveryLocationExistence(req);

        if (result.result === 0) {

            api.post('/api/deliverylocations/UpdateDeliveryLocation', req.body).then(resp => {

                result.result = resp.data;

                if (result.result > 0) {

                    res.json(result);

                } else if (result.result === 0) {

                    res.json(result);

                } else {

                    result.result = -2;
                    res.json(result);

                }

            });
        } else {

            //ProductsMicroservice retorna: -1 = Lugar de Entrega existente, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//DeleteDeliveryLocation
router.post("/api/orders/DeleteDeliveryLocation", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó
    //result.result >0 indica que se eliminó
    //result.result -1 indica que Lugar de Entrega en uso por una Orden/Pedido con estado "ACEPTADO"
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si el Lugar de Entrega que se desea eliminar está siendo utilizado por una Orden/Pedido con estado "ACEPTADO"
        result.result = await verifyDeliveryLocationUsing(req);

        if (result.result === 0) {

            api.post('/api/deliverylocations/DeleteDeliveryLocation', req.body).then(resp => {

                result.result = resp.data;

                if (result.result > 0) {

                    res.json(result);

                } else if (result.result === 0) {

                    res.json(result);

                } else {

                    result.result = -2;
                    res.json(result);

                }

            });

        } else {

            //ProductsMicroservice retorna: 
            //-1 = Lugar de Entrega en uso por una Orden/Pedido con estado "ACEPTADO", -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//GetDeliveryLocation
router.get('/api/orders/GetDeliveryLocation', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/deliverylocations/GetDeliveryLocation', {
            params: {
                idDeliveryLocation: req.query.idDeliveryLocation,
            }
        }).then(resp => {

            result.result = 1;
            result.data = resp.data;
            res.json(result);

        });

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getDeliveryLocations(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/deliverylocations/GetDeliveryLocations', {
                params: {
                    deliveryLocationStatus: req.query.deliveryLocationStatus,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetDeliveryLocations
router.get('/api/orders/GetDeliveryLocations', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getDeliveryLocations(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetDeliveryLocationsNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/orders/GetDeliveryLocationsNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getDeliveryLocations(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla DeliveryLocation - Fin *********************************************/

/********************************************* Peticiones para Tabla PayModes - Inicio *********************************************/
//GetPayMode
router.get('/api/orders/GetPayMode', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/paymodes/GetPayMode', {
            params: {
                idPayMode: req.query.idPayMode,
            }
        }).then(resp => {

            result.result = 1;
            result.data = resp.data;
            res.json(result);

        });

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getPayModes(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/paymodes/GetPayModes').then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetPayModes
router.get('/api/orders/GetPayModes', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getPayModes(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetPayModesNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/orders/GetPayModesNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getPayModes(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla PayModes - Fin *********************************************/

/********************************************* Peticiones para Tabla OrdersStatuses - Inicio *********************************************/

function getOrderStatuses(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/orderstatuses/GetOrderStatuses').then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetOrderStatuses
router.get('/api/orders/GetOrderStatuses', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getOrderStatuses(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetOrderStatusesNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/orders/GetOrderStatusesNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getOrderStatuses(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getOrderStatusesForKanban(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/orderstatuses/GetOrderStatusesForKanban').then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetOrderStatusesForKanban
router.get('/api/orders/GetOrderStatusesForKanban', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getOrderStatusesForKanban(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetOrderStatusesForKanbanNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/orders/GetOrderStatusesForKanbanNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getOrderStatusesForKanban(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla OrdersStatuses - Fin *********************************************/

/********************************************* Peticiones para Tabla EnlacePagoRes - Inicio *********************************************/
//InsertEnlacePagoRes
function insertEnlacePagoRes(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/enlacespagores/InsertEnlacePagoRes', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//Función para generar el enlace de pago
const getEnlacePago = async (orderHeader = new OrderHeader()) => {

    var orderDetailArray = [new OrderDetail()];
    let dataOrderDetails = await getOrderDetails(orderHeader.idOrderHeader);
    orderDetailArray = dataOrderDetails;
    
    //Constante con el título de la descripción que se mostrará la interfaz del enlace de pago
    const headerDescripcionProducto = "Estos son los productos de tu pedido: <br>";

    //Variable para almacenar los productos como un listado, que se mostrarán en la descripción de le interfaz del enlace de pago
    var productListDescripcionProducto = ""

    orderDetailArray.map(orderDetail => {
        if(orderDetail.idProductType === ID_PT_PASTEL){
            productListDescripcionProducto += `<li>${orderDetail.productTypeName + " PAN DE " + orderDetail.breadTypeName + ", " + orderDetail.productSizeName} ($${orderDetail.amount.toFixed(2)} x ${orderDetail.quantity})</li>`
        } else {
            productListDescripcionProducto += `<li>${orderDetail.productTypeName + ", " + orderDetail.productSizeName} ($${orderDetail.amount.toFixed(2)} x ${orderDetail.quantity})</li>`
        }
    });
    
    const enlacePagoReqObj = new EnlacePagoReq();
    enlacePagoReqObj.identificadorEnlaceComercio = "Pasteleria More's";
    enlacePagoReqObj.monto = orderHeader.totalAmount;
    enlacePagoReqObj.nombreProducto = `Pedido #${orderHeader.idOrderHeader}`;
    enlacePagoReqObj.infoProducto.descripcionProducto = headerDescripcionProducto + "<ol>" + productListDescripcionProducto +"</ol>";
    enlacePagoReqObj.infoProducto.urlImagenProducto = "https://thumbsnap.com/i/gjSUQ2Aj.png";
    enlacePagoReqObj.configuracion.emailsNotificacion = config.EMAIL_NOTIFICATION;
    enlacePagoReqObj.configuracion.telefonosNotificacion = config.PHONE_NOTIFICATION;
    enlacePagoReqObj.vigencia.fechaInicio = orderHeader.dateTaken;
    enlacePagoReqObj.vigencia.fechaFin = orderHeader.deadline;
    
    const token = await generateToken(config.APIID, config.SECRET);
    var enlacePagoResObj = new EnlacePagoRes();
    enlacePagoResObj = await generateEnlacePago(enlacePagoReqObj.getObjectAsString(), token);
    enlacePagoResObj.idOrderHeader = orderHeader.idOrderHeader;
    console.log(enlacePagoResObj)

    //Guardamos los datos únicamente si se generó el ID
    if(enlacePagoResObj.idEnlace > 0){
        //Aquí guardar datos de enlace de pago (variable "enlacePagoResObj") en la BD
        await insertEnlacePagoRes(enlacePagoResObj);
    }

    return enlacePagoResObj;
}

//GetEnlacePagoRes
function getEnlacePagoRes(idOrderHeader) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/enlacespagores/GetEnlacePagoRes', {
                params: {
                    idOrderHeader: idOrderHeader,
                }
            }).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//GetEnlacePagoById
router.get('/api/orders/GetEnlacePagoById', async (req, res) => {
    //result.result >0 indica que se obtuvo la información del enlace de pago
    //result.result -1 indica que no se obtuvo la información del enlace de pago
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        var enlacePagoRes = new EnlacePagoRes();
        enlacePagoRes = await getEnlacePagoRes(req.query.idOrderHeader);

        if(enlacePagoRes.idEnlace > 0){
            
            const token = await generateToken(config.APIID, config.SECRET);
    
            var data = new EnlacePagoByIdRes();
            data = await checkEnlacePago(enlacePagoRes.idEnlace, token);
    
            result.result = 1;
            result.data = data;
            res.json(result);
        } else {
            result.result = -1;
            result.data = new EnlacePagoByIdRes();
            res.json(result);
        }


    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla EnlacePagoRes - Fin *********************************************/


/********************************************* Peticiones para Tabla OrdersHeader - Inicio *********************************************/

//InsertOrderHeader
function insertOrderHeader(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderheaders/InsertOrderHeader', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//AddOrder
/* 
Esta petición debe recibir un objeto con las siguientes propiedades:
+ Todas las propiedades correspondientes a OrderHeader
+ Un arreglo de los detalles de la orden, denominado: "orderDetailArray"
 */
router.post("/api/orders/AddOrder", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró la Orden/Pedido
    //result.result >0 indica que se registró la Orden/Pedido el Detalle de Orden respectivo (todos los productos agregados al carrito)
    //result.result -1 indica que la fecha de entrega (deadline) no cumple con el requisito de diferencia entre fechas
    //result.result -2 indica que la hora de entrega (deliveryTime) no se encuentra en el rango de horas de 8:00 a 17:00(05:00pm)
    //result.result -3 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        const body = req.body;

        //Contador de errores
        var errors = 0;

        //Establecemos la fecha actual (fecha y hora en que se está tomando la orden)
        const stringDateTaken = utils.getDateString(new Date());
        const indexSpace = stringDateTaken.indexOf(" ");
        const stringDateTakenOnlyDate = stringDateTaken.slice(0, indexSpace);
        

        //A la fecha de entrega seleccionada en el sitio web del cliente (deadline), le establecemos la hora en "00:00:00", para que
        //valide si la diferencia entre las fechas cumple los días de diferencia establecidos en la constante MIN_DAYS_DIFFERENCE
        const stringDeadline = body.deadline + " 00:00:00";

        //Calculamos la diferencia de días entre fechas
        const diferenceDays = utils.daysBetweenDates(stringDateTaken, stringDeadline);

        if(diferenceDays < MIN_DAYS_DIFFERENCE){
            //Fecha inferior al rango requerido
            result.result = -1;
            res.json(result);
            return;
        }
        
        //Validamos el que la hora de entrega se encuentr establecido en el rango 08:00 - 17:00
        const rValidTime = utils.validateTime(body.deliveryTime);

        if(rValidTime <= 0){
            //Hora no se encuentra en el rango de horas permitido
            result.result = -2;
            res.json(result);
            return;
        }

        //Creamos el objeto para OrderHeader con los parámetros obtenidos en el body
        const objOrderHeader = new OrderHeader();
        objOrderHeader.idOrderHeader = body.idOrderHeader,
        objOrderHeader.idAdministrator = body.idAdministrator,
        objOrderHeader.idClient = body.idClient,
        objOrderHeader.emailClient = body.emailClient,
        objOrderHeader.idOrderStatus = body.idOrderStatus,
        objOrderHeader.idDeliveryLocation = body.idDeliveryLocation,
        objOrderHeader.idPayMode = body.idPayMode,
        objOrderHeader.dateTaken = stringDateTakenOnlyDate,
        objOrderHeader.deadline = body.deadline,
        objOrderHeader.deliveryTime = body.deliveryTime,
        objOrderHeader.totalAmount = body.totalAmount,

        result.result = await insertOrderHeader(objOrderHeader);

        if(result.result > 0){
            if(body.orderDetailArray.length > 0){
                
                //Cambiamos la propiedad "idOrderHeader" de cada orderDetail
                for (let index = 0; index < body.orderDetailArray.length; index++) {
                    const objOrderDetail = body.orderDetailArray[index];
                    
                    objOrderDetail.idOrderHeader = result.result;
                    
                }

                //Inserta OrderDetail
                for (let index = 0; index < body.orderDetailArray.length; index++) {
                    const objOrderDetail = body.orderDetailArray[index];
                    
                    objOrderDetail.idOrderHeader = result.result;
                    
                    if(objOrderDetail.idOrderHeader > 0){
                        var r = await insertOrderDetail(objOrderDetail);
                        if(r === -1){
                            errors++;
                        }
                    }
                }

            }
        } else {
            errors++;
        }

        if(errors > 0){
            result.result = -3;
            res.json(result);
        } else {
            result.result = 1;
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -3;
        res.json(result);
    }
});

//UpdateOrderHeaderStatus
function updateOrderHeaderStatus(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderheaders/UpdateOrderHeaderStatus', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//UpdateOrderHeaderStatus
router.post("/api/orders/UpdateOrderHeaderStatus", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó el estado
    //result.result >0 indica que se actualizó el estado
    //result.result -1 indica que no se puede CANCELAR el pedido porque este ya ha sido ACEPTADO por el administrador
    //result.result -2 indica que no se puede ACEPTAR el pedido porque este ya ha sido CANCELADO por el cliente
    //result.result -3 indica que no se pudo enviar el email de cambio de estado
    //result.result -4 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        let body = req.body;

        //Información del pedido a evaluar
        var orderHeaderToValidate = new OrderHeader();
        orderHeaderToValidate = await getOrderHeader(body.idOrderHeader);

        if(parseInt(body.idOrderStatus) === OS_CANCELADO && orderHeaderToValidate.idOrderStatus >= OS_ACEPTADO 
            && body.frontEndRequest === UL_CLIENT){

            //Cliente solicitando cancelar el pedido cuando este ya ha sido aceptado
            result.result = -1;
            res.json(result);

        } else if(parseInt(body.idOrderStatus) === OS_ACEPTADO && orderHeaderToValidate.idOrderStatus === OS_CANCELADO 
            && body.frontEndRequest === UL_ADMINISTRATOR){

            //Administrador solicitando aceptar pedido cuando este fue cancelado
            result.result = -2;
            res.json(result);

        } else {

            /*Enviamos un correo de notificación de cambio de estado del pedido, dependiendo del TIPO DE PAGO y del ESTADO ACTUAL 
            del pedido, esta validación se efectua siempre que sea una petición realizada desde el ADMINISTRADOR*/
            if(orderHeaderToValidate.idOrderStatus ===  OS_RECIBIDO && orderHeaderToValidate.idPayMode ===  ID_PAY_MODE_DIGITAL
                && body.frontEndRequest === UL_ADMINISTRATOR){
                //Si es pago digital, enviamos correo de confirmación de pedido ACEPTADO, y el enlace de pago correspondiente

                //Crear enlace de pago
                var payLinkData = new EnlacePagoRes();
                payLinkData = await getEnlacePago(orderHeaderToValidate);

                const subject = `Pedido #${orderHeaderToValidate.idOrderHeader} Aceptado`;
                
                var htmlText = "";
                if(payLinkData.idEnlace > 0){
                    //En este correo se adjunta el enlace de pago
                     htmlText = `<h2>¡Tu pedido #${orderHeaderToValidate.idOrderHeader} de Pastelería More\'s ha sido aceptado!</h2>
                    <p style="font-size: 14px">Este es el enlace de pago de tu pedido: <b>${payLinkData.urlEnlace}</b></p>`;
                } else {
                    //Sino se pudo generar el enlace de pago envíamos un correo indicando que deberá realizar el pago en efectivo
                    htmlText = `<h2>¡Tu pedido #${orderHeaderToValidate.idOrderHeader} de Pastelería More\'s ha sido aceptado!</h2>
                    <p style="font-size: 14px">Estamos teniendo inconvenientes con los enlaces de pago, así que te solicitamos de favor realizar el <b>pago en efectivo</b> cuando te entreguemos tu pedido. Gracias</p>`;

                    //Establecemos el método de pago en efectivo para la orden
                    body.idPayMode = ID_PAY_MODE_EFECTIVO;
                }

                result.result = await mailSender.sendMail(orderHeaderToValidate.emailClient, subject, htmlText);

                if(result.result <= 0){

                    //Hubo error de envío de email de notificación
                    result.result = -3;
                    res.json(result);

                }

            } else if(orderHeaderToValidate.idOrderStatus ===  OS_RECIBIDO && orderHeaderToValidate.idPayMode ===  ID_PAY_MODE_EFECTIVO 
                && body.frontEndRequest === UL_ADMINISTRATOR){
                //Si es pago efectivo, únicamente enviamos notificación de pedido ACEPTADO, sin enlace de pago

                const subject = `Pedido #${orderHeaderToValidate.idOrderHeader} Aceptado`;

                //En este correo se adjunta el enlace de pago
                var htmlText = `<h2>¡Tu pedido #${orderHeaderToValidate.idOrderHeader} de Pastelería More\'s ha sido aceptado!</h2>
                <p style="font-size: 14px">El pago de tu pedido lo realizarás cuando este te sea entregado.</p>`;

                result.result = await mailSender.sendMail(orderHeaderToValidate.emailClient, subject, htmlText);

                if(result.result <= 0){

                    //Hubo error de envío de email de notificación
                    result.result = -3;
                    res.json(result);

                }

            } else if(orderHeaderToValidate.idOrderStatus ===  OS_ELABORANDO && body.idOrderStatus === OS_COMPLETADO
                && body.frontEndRequest === UL_ADMINISTRATOR){

                //Enviamos email cuando el pedido haya sido COMPLETADO

                const deadline = utils.formatDatabaseDate(orderHeaderToValidate.deadline);

                const subject = `Pedido #${orderHeaderToValidate.idOrderHeader} Completado`;

                var htmlText = `<h1>¡Tu pedido #${orderHeaderToValidate.idOrderHeader} de Pastelería More\'s ha sido completado!</h1>
                <p style="font-size: 14px">Solicitamos que te hagas presente en <b>${orderHeaderToValidate.deliveryLocationName}</b> el día <b>${deadline} </b>
                a las <b>${orderHeaderToValidate.deliveryTime}</b><br><br>
                <b>IMPORTANTE: </b> Mantente pendiente de tu correo y télefono, nos comunicaremos contigo si tenemos inconvenientes en hacerte
                llegar tu pedido a la hora que nos solicitaste.</p>`;

                result.result = await mailSender.sendMail(orderHeaderToValidate.emailClient, subject, htmlText);

                if(result.result <= 0){

                    //Hubo error de envío de email de notificación
                    result.result = -3;
                    res.json(result);

                }

            } else if(body.idOrderStatus === OS_DENEGADO && body.frontEndRequest === UL_ADMINISTRATOR){

                //Enviamos email cuando el pedido haya sido DENEGADO
                //Agregar envío de expliación del por qué se denegó su pedido.

                const subject = `Pedido #${orderHeaderToValidate.idOrderHeader} Denegado`;

                var htmlText = `<h1>¡Tu pedido #${orderHeaderToValidate.idOrderHeader} de Pastelería More\'s ha sido denegado!</h1>`;

                result.result = await mailSender.sendMail(orderHeaderToValidate.emailClient, subject, htmlText);

                if(result.result <= 0){

                    //Hubo error de envío de email de notificación
                    result.result = -3;
                    res.json(result);

                }

            }

            //Solicitamos la actualización del estado, siempre y cuando se haya enviado el email de confirmación de cambio de estado (para los estados que se requiera)
            result.result = await updateOrderHeaderStatus(body);
    
            if (result.result > 0) {

                res.json(result);

            } else if (result.result === 0) {

                res.json(result);

            } else {
                //Hubo un error
                result.result = -4;
                res.json(result);

            }

        }


    } catch (error) {
        //Hubo un error
        console.log(error);
        result.result = -4;
        res.json(result);
    }
});

//UpdateOrderHeadersExpired
function updateOrderHeadersExpired(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderheaders/UpdateOrderHeadersExpired', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function getOrderHeadersExpired(actualDate) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/orderheaders/GetOrderHeadersExpired', {
                params: {
                    actualDate: actualDate,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//UpdateOrderHeadersExpired
router.post("/api/orders/UpdateOrderHeadersExpired", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó el estado
    //result.result >0 indica que se denegaron los pedidos expirados, o que no se encontró ninguno expirado
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        const actualDate = utils.getDateString(new Date());
        const indexSpace = actualDate.indexOf(" ");
        const actualDateOnlyDate = actualDate.slice(0, indexSpace);

        var ordersExpired = [new OrderHeader()];
        ordersExpired = await getOrderHeadersExpired(actualDateOnlyDate);

        if(ordersExpired.length <= 0){
            //Si no se encontró ningún pedido expirado
            result.result = 1;
            res.json(result);
            return;

        }

        //Sino, continuamos con el proceso
        const subject = `Pedidos Expirados ${actualDateOnlyDate}`;

        //Constante con el título de la descripción que se mostrará la interfaz del enlace de pago
        const headerDescripcionProducto = "Estos son los pedidos expirados: <br>";

        //Variable para almacenar los productos como un listado, que se mostrarán en la descripción de le interfaz del enlace de pago
        var ordersExpiredList = ""

        ordersExpired.map(orderExpired => {
            ordersExpiredList += 
            `<li><b>Cliente:</b> ${orderExpired.emailClient}, <b>Monto:</b> $${orderExpired.totalAmount.toFixed(2)}, <b>F. Entrega:</b> ${utils.formatDatabaseDate(orderExpired.deadline)}</li>`
        });

        //Enviamos correo electrónico al Administrador, indicando que se expiraron algúnos pedidos
        htmlText = `<h2>¡Han expirado algunos pedidos de tus clientes!</h2>
        <p style="font-size: 14px">${headerDescripcionProducto} <ul>${ordersExpiredList}</ul></p>`;

        result.result = await mailSender.sendMail(config.EMAIL_NOTIFICATION, subject, htmlText);
        
        if(result.result <= 0){

            //Hubo error
            result.result = -1;
            res.json(result);
            return;
        }

        let data = new OrderHeader();
        data.dateTaken = actualDateOnlyDate;//Asignamos este valor porque sino causa error
        data.deadline = actualDateOnlyDate;

        //Si todo bien actualizamos los pedidos
        result.result = await updateOrderHeadersExpired(data);

        if(result.result > 0){

            //Se denegaron los pedidos expirados
            result.result = 1;
            res.json(result);

        } else {
            //Retorna -1 si hubo error, retorna 0 si no se actualizó ningún pedido
            res.json(result);
        }

    } catch (error) {
        //Hubo un error
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getOrderHeader(idOrderHeader) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/orderheaders/GetOrderHeader', {
                params: {
                    idOrderHeader: idOrderHeader,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetOrderHeader
router.get('/api/orders/GetOrderHeader', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getOrderHeader(req.query.idOrderHeader);

        result.result = 1;
        result.data = data;
        res.json(result);
        
    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetOrderHeadersHistory
router.get('/api/orders/GetOrderHeadersHistory', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/orderheaders/GetOrderHeadersHistory', {
            params: {
                lastIdOrderHeader: req.query.lastIdOrderHeader,
                lastDeadline: req.query.lastDeadline,
                quantityOrders: req.query.quantityOrders,
                idOrderStatus: req.query.idOrderStatus,
                initialDeadline: req.query.initialDeadline,
                finalDeadline: req.query.finalDeadline,
                idAdministrator: req.query.idAdministrator,
                idClient: req.query.idClient,
            }
        }).then(resp => {

            result.result = 1;
            result.data = resp.data;
            if(result.data.length > 0){
                for (let index = 0; index < result.data.length; index++) {
                    const element = result.data[index];
                    
                    const formattedDateTaken = utils.formatDatabaseDate(element.dateTaken);
                    element.dateTaken = formattedDateTaken;
                    const formattedDeadline = utils.formatDatabaseDate(element.deadline);
                    element.deadline = formattedDeadline;
                }
            }
            res.json(result);

        });

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetOrderHeadersN
router.get('/api/orders/GetOrderHeadersN', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/orderheaders/GetOrderHeadersN', {
            params: {
                lastIdOrderHeader: req.query.lastIdOrderHeader,
                lastDeadline: req.query.lastDeadline,
                quantityOrders: req.query.quantityOrders,
                idOrderStatus: req.query.idOrderStatus,
                idAdministrator: req.query.idAdministrator,
                idClient: req.query.idClient,
            }
        }).then(resp => {

            result.result = 1;
            result.data = resp.data;
            if(result.data.length > 0){
                for (let index = 0; index < result.data.length; index++) {
                    const element = result.data[index];
                    
                    const formattedDateTaken = utils.formatDatabaseDate(element.dateTaken);
                    element.dateTaken = formattedDateTaken;
                    const formattedDeadline = utils.formatDatabaseDate(element.deadline);
                    element.deadline = formattedDeadline;
                }
            }
            res.json(result);

        });

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

/********************************************* Peticiones para Tabla OrdersHeader - Fin *********************************************/

/********************************************* Peticiones para Tabla OrdersDetail - Inicio *********************************************/
//InsertOrderDetail
function insertOrderDetail(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderdetails/InsertOrderDetail', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//GetOrderDetail
router.get('/api/orders/GetOrderDetail', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/orderdetails/GetOrderDetail', {
            params: {
                idOrderDetail: req.query.idOrderDetail,
            }
        }).then(resp => {

            result.result = 1;
            result.data = resp.data;
            res.json(result);

        });

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getOrderDetails(idOrderHeader) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/orderdetails/GetOrderDetails', {
                params: {
                    idOrderHeader: idOrderHeader,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetOrderDetails
router.get('/api/orders/GetOrderDetails', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getOrderDetails(req.query.idOrderHeader);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla OrdersDetail - Fin *********************************************/

/********************************************* Peticiones para Tabla OrdersHeaderT - Inicio *********************************************/

//InsertOrderHeaderT
function insertOrderHeaderT(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderheaderst/InsertOrderHeaderT', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//AddOrder
/* 
Esta petición debe recibir un objeto con las siguientes propiedades:
+ Todas las propiedades correspondientes a OrderHeaderT

Esta petición retorna un objeto OrderHeaderT
    + Si no existe un registro para el cliente, se inserta uno nuevo y retorna el objeto insertadi
    + Si existe un registro, retorna este registro encontrado 
 */
router.post("/api/orders/AddOrderTemp", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró la Orden/Pedido
    //result.result >0 indica que se registró el OrderHeaderT, o se encontró un registro
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        const body = req.body;

        //Consultamos si existe un OrderHeaderT para el cliente que inició sesión
        result.data = await getOrderHeaderTByIdClient(body.idClient);

        if(result.data.idOrderHeaderT <= 0){
            //Creamos el objeto para OrderHeaderT con los parámetros obtenidos en el body
            const objOrderHeaderT = new OrderHeaderT();
            objOrderHeaderT.idOrderHeaderT = body.idOrderHeaderT;
            objOrderHeaderT.idAdministrator = body.idAdministrator;
            objOrderHeaderT.idClient = body.idClient;
            objOrderHeaderT.emailClient = body.emailClient;
            objOrderHeaderT.idOrderStatus = body.idOrderStatus;
            objOrderHeaderT.idDeliveryLocation = body.idDeliveryLocation;
            objOrderHeaderT.idPayMode = body.idPayMode;
            objOrderHeaderT.dateTaken = body.dateTaken;
            objOrderHeaderT.deadline = body.deadline;
            objOrderHeaderT.deliveryTime = body.deliveryTime;
            objOrderHeaderT.totalAmount = body.totalAmount;

            //Insertamos el OrderHeaderT
            result.result = await insertOrderHeaderT(objOrderHeaderT);

            if(result.result > 0) {

                //Luego de haber insertado el registro, consultamos nuevamente para retornar el objeto OrderHeaderT
                result.data = await getOrderHeaderTByIdClient(body.idClient);

                if(result.data.length > 0) {

                    result.result = 1;
                    res.json(result);

                } else {
                    //Indica que hubo un error
                    result.result = -1;
                    res.json(result);
                }
                

            } else {
                //Microservicio retorna -1 si hubo un error, 0 si no se insertó el registro
                res.json(result);
            }
        } else {

            result.result = 1;
            res.json(result);
            
        }

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getOrderHeaderTByIdClient(idClient) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/orderheaderst/GetOrderHeaderTByIdClient', {
                params: {
                    idClient: idClient,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetOrderHeaderTByIdClient
router.get('/api/orders/GetOrderHeaderTByIdClient', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getOrderHeaderTByIdClient(req.query.idClient);

        result.result = 1;
        result.data = data;
        res.json(result);
        
    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});


/********************************************* Peticiones para Tabla OrdersHeaderT - Fin *********************************************/

/********************************************* Peticiones para Tabla OrdersDetailT - Inicio *********************************************/

//VerifyOrderDetailTExistence
function verifyOrderDetailTExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/orderdetailst/VerifyOrderDetailTExistence", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//VerifyOrderDetailTExistence
router.post("/api/orders/VerifyOrderDetailTExistence", isValidated, async (req, res) => {

    //result.result 0 si NO existe el producto en el Detalle de la Orden Temporal
    //result.result -1 si existe el producto en el Detalle de la Orden Temporal
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos la existencia del producto en el Detalle de la Orden Temporal
        result.result = await verifyOrderDetailTExistence(req);
        res.json(result);


    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//VerifyOrderDetailTExistenceByIdODT
function verifyOrderDetailTExistenceByIdODT(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/orderdetailst/VerifyOrderDetailTExistenceByIdODT", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//VerifyOrderDetailTExistenceByIdODT
router.post("/api/orders/VerifyOrderDetailTExistenceByIdODT", /*isValidated,*/ async (req, res) => {

    //result.result 0 si NO existe el producto en el Detalle de la Orden Temporal
    //result.result -1 si existe el producto en el Detalle de la Orden Temporal
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos la existencia del producto en el Detalle de la Orden Temporal
        result.result = await verifyOrderDetailTExistenceByIdODT(req);
        res.json(result);


    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});


//InsertOrderDetailT
function insertOrderDetailT(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderdetailst/InsertOrderDetailT', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//InsertOrderDetailT
router.post("/api/orders/InsertOrderDetailT", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Detalle de la Orden Temporal
    //result.result >0 indica que se registró el Detalle de la Orden Temporal
    //result.result -1 existencia del producto en el Detalle de la Orden Temporal
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos la existencia del producto en el Detalle de la Orden Temporal
        result.result = await verifyOrderDetailTExistence(req);

        if(result.result === 0){
            //Insertamos el Detalle de la Orden Temporal
            result.result = await insertOrderDetailT(req.body);
    
            if (result.result > 0) {
    
                res.json(result);
    
            } else if (result.result === 0) {
                //No se insertó
                res.json(result);
    
            } else if (result.result === -1) {
                //Hubo un error
                result.result = -2;
                res.json(result);
    
            }
        } else {
            //Validación retorna -1 si existe el producto, -2 si hubo un error
            res.json(result);
        }


    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//UpdateOrderDetailT
function updateOrderDetailT(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderdetailst/UpdateOrderDetailT', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//UpdateOrderDetailT
router.post("/api/orders/UpdateOrderDetailT", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó el Detalle de la Orden Temporal
    //result.result >0 indica que se actualizó el Detalle de la Orden Temporal
    //result.result -1 no existencia del producto en el Detalle de la Orden Temporal, pero se insertó
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos la existencia del producto en el Detalle de la Orden Temporal
        result.result = await verifyOrderDetailTExistenceByIdODT(req);

        if(result.result === -1){

            //Si existe, actualizamos el producto del Detalle de la Orden Temporal
            result.result = await updateOrderDetailT(req.body);
    
            if (result.result > 0) {
    
                res.json(result);
    
            } else if (result.result === 0) {
                //No se actualizó
                res.json(result);
    
            } else if (result.result === -1) {
                //Hubo un error
                result.result = -2;
                res.json(result);
    
            }
        } else if (result.result === 0) {

            //Si no existe, insertamos el producto del detalle Temporal de la Orden
            result.result = await insertOrderDetailT(req.body);
    
            if (result.result > 0) {
    
                //No existe y se insertó
                result.result = -1;
                res.json(result);
    
            } else if (result.result === 0) {
                //No se insertó
                res.json(result);
    
            } else if (result.result === -1) {
                //Hubo un error
                result.result = -2;
                res.json(result);
    
            }

        } else if (result.result === -2) {
            //Hubo un error
            res.json(result);

        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//UpdateAllOrderDetailT
router.post("/api/orders/UpdateAllOrderDetailT", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó el Detalle de la Orden Temporal
    //result.result >0 indica que se actualizó el Detalle de la Orden Temporal
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    var errors = 0;

    try {

        var data = req.body.orderDetailTArray;

        data.map(async (orderDetailT) => {

            //Insertamos el Detalle de la Orden Temporal
            result.result = await updateOrderDetailT(orderDetailT);
    
            if (result.result <= 0) {
    
                //Microservicio retorna 0 si no se realizó el proceso, retorna -1 si completó el proceso
                errors++;
    
            }

            return true;
        });

        if(errors > 0){
            result.result = -1;
        } else {
            result.result = 1;
        }

        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//DeleteOrderDetailT
function deleteOrderDetailT(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderdetailst/DeleteOrderDetailT', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//DeleteOrderDetailT
router.post("/api/orders/DeleteOrderDetailT", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó el Detalle de la Orden Temporal
    //result.result >0 indica que se eliminó el Detalle de la Orden Temporal
    //result.result -1 existencia del producto en el Detalle de la Orden Temporal 
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos la existencia del producto en el Detalle de la Orden Temporal
        result.result = await verifyOrderDetailTExistenceByIdODT(req);

        if(result.result === -1){
            //Eliminamos el Detalle de la Orden Temporal
            result.result = await deleteOrderDetailT(req.body);
    
            if (result.result > 0) {
    
                res.json(result);
    
            } else if (result.result === 0) {
                //No se actualizó
                res.json(result);
    
            } else if (result.result === -1) {
                //Hubo un error
                result.result = -2;
                res.json(result);
    
            }
        } else if (result.result === 0) {
            //No existe
            result.result = -1;
            res.json(result);

        } else if (result.result === -2) {
            //Hubo un error
            res.json(result);

        }

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//DeleteAllOrderDetailT
function deleteAllOrderDetailT(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post('/api/orderdetailst/DeleteAllOrderDetailT', data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//DeleteAllOrderDetailT
router.post("/api/orders/DeleteAllOrderDetailT", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó TODO el Detalle de la Orden Temporal
    //result.result >0 indica que se eliminó TODO el Detalle de la Orden Temporal
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }
    try {

        //Eliminamos TODO el Detalle de la Orden Temporal
        result.result = await deleteAllOrderDetailT(req.body);

        if (result.result > 0) {

            res.json(result);

        } else {
            //Microservicio retorna 0 si no se realizó el proceso, retorna -1 si completó el proceso
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetOrderDetailT
router.get('/api/orders/GetOrderDetailT', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/orderdetailst/GetOrderDetailT', {
            params: {
                idOrderDetailT: req.query.idOrderDetailT,
            }
        }).then(resp => {

            result.result = 1;
            result.data = resp.data;
            res.json(result);

        });

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetOrderDetailsT
//Se realiza sin validación de token porque se valida cuando se inserta, actualiza o elimina un producto a la orden temporal
router.get('/api/orders/GetOrderDetailsT', /*isValidated,*/ (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/orderdetailst/GetOrderDetailsT', {
            params: {
                idOrderHeaderT: req.query.idOrderHeaderT,
            }
        }).then(resp => {

            result.result = 1;
            result.data = resp.data;
            res.json(result);

        });

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla OrdersDetailT - Fin *********************************************/

/********************************************* Peticiones para Componentes de Utils - Inicio *********************************************/
router.get("/api/orders/DaysBetweenDates", (req, res) => {

    try {

        const days = utils.daysBetweenDates(new Date(), new Date(req.query.deadline));

        res.json(days);

    } catch (error) {
        console.log(error);
        res.json("Error");
    }
});

router.get("/api/orders/ValidateTime", (req, res) => {

    try {
        console.log(req.query.deliveryTime);
        const result = utils.validateTime(req.query.deliveryTime);

        res.json(result);

    } catch (error) {
        console.log(error);
        res.json("Error");
    }
});
/********************************************* Peticiones para Componentes de Utils - Fin *********************************************/

module.exports = router;