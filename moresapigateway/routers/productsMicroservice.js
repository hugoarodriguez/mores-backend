var express = require('express');
var router = express.Router();

/* Si se está ejecutando de forma local el Kubernete se debe colocar "host.docker.internal", ya que esto permite acceder a la IP
del host donde está corriendo la el Kubernete, si ya está el servicio publicado en AKS, se debe colocar la IP de ese servicio 
proporcionada por AKS */
const apiAdapter = require('./apiAdapter');
//const BASE_URL = 'http://host.docker.internal:5001';
const BASE_URL = '10.0.33.129:5001';
const api = apiAdapter(BASE_URL);
const isValidated = require('../requestValidator');

//Constantes para validaciones
const ACTIVE_STATUS = true;
const INACTIVE_STATUS = false;

//Constantes para Opciones de Mantenimiento
const OPTION_INSERT = 1;
const OPTION_UPDATE = 2;
const OPTION_DELETE = 3;
const OPTION_SELECT = 4;

/********************************************* Peticiones para Tabla BreadType - Inicio *********************************************/
function verifyBreadTypeExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/breadtypes/VerifyBreadTypeExistence", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function verifyBreadTypeUsing(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/breadtypes/VerifyBreadTypeUsing", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//InsertBreadType
router.post("/api/products/InsertBreadType", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Tipo de Pan
    //result.result >0 indica que se registró el Tipo de Pan
    //result.result -1 Ya existe un Tipo de Pan con ese nombre
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Tipo de Pan registrado con este nombre
        result.result = await verifyBreadTypeExistence(req);

        if (result.result === 0) {

            api.post('/api/breadtypes/InsertBreadType', req.body).then(resp => {

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

            //ProductsMicroservice retorna: -1 = Tipo de Pan existente, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});


//UpdateBreadType
router.post("/api/products/UpdateBreadType", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó
    //result.result >0 indica que se actualizó
    //result.result -1 Ya existe un Tipo de Pan con ese nombre
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Tipo de Pan registrado con este nombre
        result.result = await verifyBreadTypeExistence(req);

        if (result.result === 0) {

            api.post('/api/breadtypes/UpdateBreadType', req.body).then(resp => {

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

            //ProductsMicroservice retorna: -1 = Tipo de Pan existente, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//DeleteBreadType
router.post("/api/products/DeleteBreadType", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó
    //result.result >0 indica que se eliminó
    //result.result -1 indica que Tipo de Pan en uso por Producto activo
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si el Tipo de Pan que se desea eliminar está siendo utilizado por un Producto activo
        result.result = await verifyBreadTypeUsing(req);

        if(result.result === 0){

            api.post('/api/breadtypes/DeleteBreadType', req.body).then(resp => {
    
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
            //-1 = Tipo de Pan en uso por Producto activo, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//GetBreadType
router.get('/api/products/GetBreadType', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/breadtypes/GetBreadType', {
            params: {
                idBreadType: req.query.idBreadType,
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

//GetBreadTypes
router.get('/api/products/GetBreadTypes', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        api.get('/api/breadtypes/GetBreadTypes', {
            params: {
                breadTypeStatus: req.query.breadTypeStatus,
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

function getBreadTypesForCatalog(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/breadtypes/GetBreadTypesForCatalog', {
                params: {
                    idProductType: req.query.idProductType,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetBreadTypesForCatalog
router.get('/api/products/GetBreadTypesForCatalog', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getBreadTypesForCatalog(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetBreadTypesForCatalogNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetBreadTypesForCatalogNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getBreadTypesForCatalog(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla BreadType - Fin *********************************************/

/********************************************* Peticiones para Tabla CoverType - Inicio *********************************************/
function verifyCoverTypeExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/covertypes/VerifyCoverTypeUsing", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function verifyCoverTypeUsing(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/covertypes/VerifyCoverTypeUsing", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//InsertCoverType
router.post("/api/products/InsertCoverType", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Tipo de Cobertura
    //result.result >0 indica que se registró el Tipo de Cobertura
    //result.result -1 Ya existe un Tipo de Cobertura con ese nombre
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Tipo de Cobertura registrado con este nombre
        result.result = await verifyCoverTypeExistence(req);

        if (result.result === 0) {

            api.post('/api/covertypes/InsertCoverType', req.body).then(resp => {

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

            //ProductsMicroservice retorna: -1 = Tipo de Cobertura existente, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});


//UpdateCoverType
router.post("/api/products/UpdateCoverType", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó
    //result.result >0 indica que se actualizó
    //result.result -1 Ya existe un Tipo de Cobertura con ese nombre
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Tipo de Cobertura registrado con este nombre
        result.result = await verifyCoverTypeExistence(req);

        if (result.result === 0) {

            api.post('/api/covertypes/UpdateCoverType', req.body).then(resp => {

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

            //ProductsMicroservice retorna: -1 = Tipo de Cobertura existente, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//DeleteCoverType
router.post("/api/products/DeleteCoverType", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó
    //result.result >0 indica que se eliminó
    //result.result -1 indica que el Tipo de Cobertura está siendo utilizado por un Producto activo
    //result.result -2 indica que el Tipo de Cobertura está siendo utilizado por un Producto de Catálogo activo
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

       //Verificamos si el Tipo de Cobertura que se desea eliminar está siendo utilizado por un Producto activo, o por un Producto de Catálogo activo
       result.result = await verifyCoverTypeUsing(req);

       if(result.result === 0){

           api.post('/api/covertypes/DeleteCoverType', req.body).then(resp => {
   
               result.result = resp.data;
   
               if (result.result > 0) {
   
                   res.json(result);
   
               } else if (result.result === 0) {
   
                   res.json(result);
   
               } else {
   
                   result.result = -3;
                   res.json(result);
   
               }
   
           });

       } else {

           //ProductsMicroservice retorna: 
           //-1 = Tipo de Cobertura en uso por Producto activo, -2 = Tipo de Cobertura en uso por Producto de Catálogo activo, -3 = Hubo un error
           res.json(result);
       }

    } catch (error) {
        console.log(error);
        result.result = -3;
        res.json(result);
    }
});

//GetCoverType
router.get('/api/products/GetCoverType', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/covertypes/GetCoverType', {
            params: {
                idCoverType: req.query.idCoverType,
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

//GetCoverTypes
router.get('/api/products/GetCoverTypes', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        api.get('/api/covertypes/GetCoverTypes', {
            params: {
                coverTypeStatus: req.query.coverTypeStatus,
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
/********************************************* Peticiones para Tabla CoverType - Fin *********************************************/

/********************************************* Peticiones para Tabla CoverTypePriceIncrease - Inicio *********************************************/
function insertCTPI(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/covertypepriceincreases/InsertCTPI", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function updateCTPI(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/covertypepriceincreases/UpdateCTPI", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function deleteCTPI(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/covertypepriceincreases/DeleteCTPI", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//Para utilizar en managePSP
function manageCTPI(dataArray) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            //result.result 0 indica que no se registró el Incremento de Precio por Tipo de Cobertura
            //result.result >0 indica que se completo la inserción/actualización/eliminación del Incremento de Precio por Tipo de Cobertura
            //result.result -1 indica que hubo un error

            var result = {
                data: {},
                result: 0
            }

            try {

                let bodyRequest = dataArray;
                console.log(dataArray);

                //Contador de errores
                var errors = 0;

                for (let index = 0; index < bodyRequest.length; index++) {
                    const ctpi = bodyRequest[index];

                    //Objeto a enviar
                    let object = {
                        idCTPI: ctpi.idCTPI,
                        idPSP: ctpi.idPSP,
                        idCoverType: ctpi.idCoverType,
                        priceIncrease: ctpi.priceIncrease,
                        ctpiStatus: ctpi.ctpiStatus,
                    }

                    if (ctpi.operation === OPTION_INSERT && ctpi.ctpiStatus === true && ctpi.idCTPI === 0) {
                        //Inserción
                        let r = insertCTPI(object);
                        if (r === -1) {
                            errors++;
                        }

                    } else if (ctpi.operation === OPTION_UPDATE && ctpi.ctpiStatus === true && ctpi.idCTPI > 0) {
                        //Actualización
                        let r = updateCTPI(object);
                        if (r === -1) {
                            errors++;
                        }

                    } else if (ctpi.operation === OPTION_UPDATE && ctpi.ctpiStatus === false && ctpi.idCTPI > 0) {
                        //Si es actualización pero viene con estado "false" quiere decir que se quitó ese incremento de precio
                        //y por lo tanto se debe actualizar
                        let r = deleteCTPI(object);
                        if (r === -1) {
                            errors++;
                        }

                    } else if (ctpi.operation > OPTION_DELETE && ctpi.ctpiStatus === false && ctpi.idCTPI > 0) {
                        //Eliminación
                        let r = deleteCTPI(object);
                        if (r === -1) {
                            errors++;
                        }
                    }
                }

                if (errors > 0) {
                    result.result = -1;
                    return resolve(result);
                } else {
                    result.result = 1;
                    return resolve(result);
                }

            } catch (error) {
                console.log(error);
                result.result = -1;
                return resolve(result);
            }

        });
    });
}

//ManageCTPI
//Esta petición gestiona si se está insertando, actualizando o eliminando un Incremento de Precio por Tipo de Cobertura
/*Para esta petición se debe enviar un arreglo de objetos con las propiedades: 
    + operation
    + ctpiStatus
    + idPSP
    + idCTPI
    + idCoverType
    + priceIncrease
*/
router.post("/api/products/ManageCTPI", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Incremento de Precio por Tipo de Cobertura
    //result.result >0 indica que se completo la inserción/actualización/eliminación del Incremento de Precio por Tipo de Cobertura
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        let bodyRequest = req.body;

        //Contador de errores
        var errors = 0;

        for (let index = 0; index < bodyRequest.length; index++) {
            const ctpi = bodyRequest[index];

            //Objeto a enviar
            let object = {
                idCTPI : ctpi.idCTPI,
                idPSP : ctpi.idPSP,
                idCoverType : ctpi.idCoverType,
                priceIncrease : ctpi.priceIncrease,
                ctpiStatus : ctpi.ctpiStatus,
            }

            if(ctpi.operation === OPTION_INSERT && ctpi.ctpiStatus === true && ctpi.idCTPI === 0){
                //Inserción
                let r = await insertCTPI(object);
                if(r === -1){
                    errors++;
                }

            } else if(ctpi.operation === OPTION_UPDATE && ctpi.ctpiStatus === true && ctpi.idCTPI > 0){
                //Actualización
                let r = await updateCTPI(object);
                if(r === -1){
                    errors++;
                }

            } else if(ctpi.operation === OPTION_UPDATE && ctpi.ctpiStatus === false && ctpi.idCTPI > 0){
                //Si es actualización pero viene con estado "false" quiere decir que se quitó ese incremento de precio
                //y por lo tanto se debe actualizar
                let r = await deleteCTPI(object);
                if(r === -1){
                    errors++;
                }

            } else if(ctpi.operation > OPTION_DELETE && ctpi.ctpiStatus === false && ctpi.idCTPI > 0){
                //Eliminación
                let r = await deleteCTPI(object);
                if(r === -1){
                    errors++;
                }
            }
        }

        if(errors > 0){
            result.result = -1;
            res.json(result);
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

//GetCTPIsByIdProduct
router.get('/api/products/GetCTPIsByIdProduct', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        api.get('/api/covertypepriceincreases/GetCTPIsByIdProduct', {
            params: {
                idProduct: req.query.idProduct,
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

function getCTPIsByIdPSP(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/covertypepriceincreases/GetCTPIsByIdPSP', {
                params: {
                    idPSP: req.query.idPSP,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetCTPIsByIdPSP
router.get('/api/products/GetCTPIsByIdPSP', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getCTPIsByIdPSP(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetCTPIsByIdPSPNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetCTPIsByIdPSPNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getCTPIsByIdPSP(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla CoverTypePriceIncrease - Fin *********************************************/

/********************************************* Peticiones para Tabla FillingType - Inicio *********************************************/
function verifyFillingTypeExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/fillingtypes/VerifyFillingTypeExistence", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function verifyFillingTypeUsing(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/fillingtypes/VerifyFillingTypeUsing", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//InsertFillingType
router.post("/api/products/InsertFillingType", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Tipo de Relleno
    //result.result >0 indica que se registró el Tipo de Relleno
    //result.result -1 Ya existe un Tipo de Relleno con ese nombre
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Tipo de Relleno registrado con este nombre
        result.result = await verifyFillingTypeExistence(req);

        if (result.result === 0) {

            api.post('/api/fillingtypes/InsertFillingType', req.body).then(resp => {

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

            //ProductsMicroservice retorna: -1 = Tipo de Relleno existente, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});


//UpdateFillingType
router.post("/api/products/UpdateFillingType", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó
    //result.result >0 indica que se actualizó
    //result.result -1 Ya existe un Tipo de Relleno con ese nombre
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Tipo de Relleno registrado con este nombre
        result.result = await verifyFillingTypeExistence(req);

        if (result.result === 0) {

            api.post('/api/fillingtypes/UpdateFillingType', req.body).then(resp => {

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

            //ProductsMicroservice retorna: -1 = Tipo de Relleno existente, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//DeleteFillingType
router.post("/api/products/DeleteFillingType", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó
    //result.result >0 indica que se eliminó
    //result.result -1 indica que Tipo de Relleno en uso por Producto de Catálogo activo
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si el Tipo de Relleno que se desea eliminar está siendo utilizado por un Producto de Catálogo activo
        result.result = await verifyFillingTypeUsing(req);

        if(result.result === 0){

            api.post('/api/fillingtypes/DeleteFillingType', req.body).then(resp => {
    
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
            //-1 = Tipo de Relleno en uso por Producto de Catálogo activo, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//GetFillingType
router.get('/api/products/GetFillingType', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/fillingtypes/GetFillingType', {
            params: {
                idFillingType: req.query.idFillingType,
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

function getFillingTypes(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/fillingtypes/GetFillingTypes', {
                params: {
                    fillingTypeStatus: req.query.fillingTypeStatus,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetFillingTypes
router.get('/api/products/GetFillingTypes', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getFillingTypes(req);
        
        result.result = 1;
        result.data = data;
        res.json(result);
        
    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetFillingTypesNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetFillingTypesNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getFillingTypes(req);
        
        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla FillingType - Fin *********************************************/

/********************************************* Peticiones para Tabla ProductSizes - Inicio *********************************************/
function verifyProductSizeExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/productsizes/VerifyProductSizeExistence", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function verifyProductSizeUsing(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/productsizes/VerifyProductSizeUsing", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//InsertProductSize
router.post("/api/products/InsertProductSize", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Tamaño de Producto
    //result.result >0 indica que se registró el Tamaño de Producto
    //result.result -1 Ya existe un Tamaño de Producto con ese nombre
    //result.result -2 Rango de tamaños existente, o rango de tamaños se encuentra dentro de uno existente
    //result.result -3 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Tamaño de Producto registrado con este nombre o con rango de tamaños igual, o rango 
        //se encuentra dentro de otro
        result.result = await verifyProductSizeExistence(req);

        if (result.result === 0) {

            api.post('/api/productsizes/InsertProductSize', req.body).then(resp => {

                result.result = resp.data;

                if (result.result > 0) {

                    res.json(result);

                } else if (result.result === 0) {

                    res.json(result);

                } else {

                    result.result = -3;
                    res.json(result);

                }

            });
        } else {

            //ProductsMicroservice retorna: 
            //-1 = Tamaño de Producto existente, -2 = Rango de tamaños ocupado, -3 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -3;
        res.json(result);
    }
});


//UpdateProductSize
router.post("/api/products/UpdateProductSize", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó
    //result.result >0 indica que se actualizó
    //result.result -1 Ya existe un Tamaño de Producto con ese nombre
    //result.result -2 Rango de tamaños existente, o rango de tamaños se encuentra dentro de uno existente
    //result.result -3 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un Tamaño de Producto registrado con este nombre o con rango de tamaños igual, o rango 
        //se encuentra dentro de otro
        result.result = await verifyProductSizeExistence(req);

        if (result.result === 0) {

            api.post('/api/productsizes/UpdateProductSize', req.body).then(resp => {

                result.result = resp.data;

                if (result.result > 0) {

                    res.json(result);

                } else if (result.result === 0) {

                    res.json(result);

                } else {

                    result.result = -3;
                    res.json(result);

                }

            });
        } else {

            //ProductsMicroservice retorna: 
            //-1 = Tamaño de Producto existente, -2 = Rango de tamaños ocupado, -3 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -3;
        res.json(result);
    }
});

//DeleteProductSize
router.post("/api/products/DeleteProductSize", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó
    //result.result >0 indica que se eliminó
    //result.result -1 Indica que este Tamaño de Producto está siendo utilizado por un producto activo
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si el Tamaño de Producto que se desea eliminar está siendo utilizado por un Producto activo
        result.result = await verifyProductSizeUsing(req);

        if(result.result === 0){

            api.post('/api/productsizes/DeleteProductSize', req.body).then(resp => {
    
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
            //-1 = Tamaño de Producto en uso por Producto activo, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//GetProductSize
router.get('/api/products/GetProductSize', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/productsizes/GetProductSize', {
            params: {
                idProductSize: req.query.idProductSize,
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

//GetProductSizes
router.get('/api/products/GetProductSizes', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        api.get('/api/productsizes/GetProductSizes', {
            params: {
                idProductType: req.query.idProductType,
                productSizeStatus: req.query.productSizeStatus,
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
/********************************************* Peticiones para Tabla ProductSizes - Fin *********************************************/

/********************************************* Peticiones para Tabla ProductSizesPrices - Inicio *********************************************/
function insertPSP(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/productssizesprices/InsertPSP", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function updatePSP(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/productssizesprices/UpdatePSP", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function deletePSP(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/productssizesprices/DeletePSP", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//ManagePSP
//Esta petición gestiona si se está insertando, actualizando o eliminando un Precio por Tamaño de Producto
/*Para esta petición se debe enviar un arreglo de objetos con las propiedades: 
    + operation
    + pspStatus
    + idProduct
    + idPSP
    + idProductSize
    + basePrice
    + ctpiDataArray
    + dtpiDataArray
*/
router.post("/api/products/ManagePSP", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Precio por Tamaño de Producto
    //result.result >0 indica que se completo la inserción/actualización/eliminación del Precio por Tamaño de Producto
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        let bodyRequest = req.body;

        console.log("bodyRequest");
        console.log(bodyRequest);

        //Contador de errores
        var errors = 0;

        for (let index = 0; index < bodyRequest.length; index++) {
            const psp = bodyRequest[index];

            //Objeto a enviar
            let object = {
                idPSP : psp.idPSP,
                idProduct : psp.idProduct,
                idProductSize : psp.idProductSize,
                basePrice : psp.basePrice,
                pspStatus : psp.pspStatus,
            }

            if(psp.operation === OPTION_INSERT && psp.pspStatus === true && psp.idPSP === 0){
                //Inserción (retorna el IdPSP si se registró correctamente)
                let idPSP = await insertPSP(object);
                
                if(idPSP === -1){
                    errors++;
                } else {
                    //Antes de insertar los CTPIs, cambiamos el idPSP a cada objeto del arreglo, 
                    //según el idPSP que retornó el "insertPSP"
                    if(psp.ctpiDataArray.length > 0){
                        for (let index = 0; index < psp.ctpiDataArray.length; index++) {
                            const element = psp.ctpiDataArray[index];
                            
                            element.idPSP = idPSP;
                            
                        }
                        //Insertar CTPIS
                        var r = await manageCTPI(psp.ctpiDataArray);
                        if(r === -1){
                            errors++;
                        }
                    }

                    //Antes de insertar los DTPIs, cambiamos el idPSP a cada objeto del arreglo, 
                    //según el idPSP que retornó el "insertPSP"
                    if(psp.dtpiDataArray.length > 0){
                        for (let index = 0; index < psp.dtpiDataArray.length; index++) {
                            const element = psp.dtpiDataArray[index];
                            
                            element.idPSP = idPSP;
                            
                        }
                        //Insertar DTPIS
                        r = await manageDTPI(psp.dtpiDataArray);
                        if(r === -1){
                            errors++;
                        }
                    }
                }

            } else if(psp.operation === OPTION_UPDATE && psp.pspStatus === true && psp.idPSP > 0){
                //Actualización
                var r = await updatePSP(object);
                if(r === -1){
                    errors++;
                } else {
                    
                    //Actualizar CTPIS
                    r = await manageCTPI(psp.ctpiDataArray);
                    if(r === -1){
                        errors++;
                    }

                    //Actualizar DTPIS
                    r = await manageDTPI(psp.dtpiDataArray);
                    if(r === -1){
                        errors++;
                    }
                }

            } else if(psp.operation === OPTION_UPDATE && psp.pspStatus === false && psp.idPSP > 0){
                //Si es actualización pero viene con estado "false" quiere decir que se quitó ese incremento de precio
                //y por lo tanto se debe actualizar
                var r = await deletePSP(object);
                if(r === -1){
                    errors++;
                }

            } else if(psp.operation > OPTION_DELETE && psp.pspStatus === false && psp.idPSP > 0){
                //Eliminación (Por el momento NO se utiliza al eliminar un producto)
                let r = await deletePSP(object);
                if(r === -1){
                    errors++;
                }
            }
        }

        if(errors > 0){
            result.result = -1;
            res.json(result);
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

function getProductSizesForCatalog(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/productssizesprices/GetProductSizesForCatalog', {
                params: {
                    idProduct: req.query.idProduct,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetProductSizesForCatalog
router.get('/api/products/GetProductSizesForCatalog', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getProductSizesForCatalog(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetProductSizesForCatalogNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetProductSizesForCatalogNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getProductSizesForCatalog(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla ProductSizesPrices - Fin *********************************************/


/********************************************* Peticiones para Tabla DecorationType - Inicio *********************************************/
//GetDecorationTypes
router.get('/api/products/GetDecorationTypes', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        api.get('/api/decorationtypes/GetDecorationTypes', {
            params: {
                decorationTypeStatus: req.query.decorationTypeStatus,
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
/********************************************* Peticiones para Tabla DecorationType - Fin *********************************************/

/********************************************* Peticiones para Tabla DecorationTypePriceIncrease - Inicio *********************************************/
function insertDTPI(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/decorationtypepriceincreases/InsertDTPI", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function updateDTPI(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/decorationtypepriceincreases/UpdateDTPI", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function deleteDTPI(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/decorationtypepriceincreases/DeleteDTPI", data).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}


//Para utilizar en managePSP
function manageDTPI(dataArray) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            //result.result 0 indica que no se registró el Incremento de Precio por Tipo de Decoración
            //result.result >0 indica que se completo la inserción/actualización/eliminación del Incremento de Precio por Tipo de Decoración
            //result.result -1 indica que hubo un error

            var result = {
                data: {},
                result: 0
            }

            try {

                let bodyRequest = dataArray;
                console.log(dataArray);

                //Contador de errores
                var errors = 0;

                for (let index = 0; index < bodyRequest.length; index++) {
                    const dtpi = bodyRequest[index];

                    //Objeto a enviar
                    let object = {
                        idDTPI: dtpi.idDTPI,
                        idPSP: dtpi.idPSP,
                        idDecorationType: dtpi.idDecorationType,
                        priceIncrease: dtpi.priceIncrease,
                        dtpiStatus: dtpi.dtpiStatus,
                    }

                    if (dtpi.operation === OPTION_INSERT && dtpi.dtpiStatus === true && dtpi.idDTPI === 0) {
                        //Inserción
                        let r = insertDTPI(object);
                        if (r === -1) {
                            errors++;
                        }

                    } else if (dtpi.operation === OPTION_UPDATE && dtpi.dtpiStatus === true && dtpi.idDTPI > 0) {
                        //Actualización
                        let r = updateDTPI(object);
                        if (r === -1) {
                            errors++;
                        }

                    } else if (dtpi.operation === OPTION_UPDATE && dtpi.dtpiStatus === false && dtpi.idDTPI > 0) {
                        //Si es actualización pero viene con estado "false" quiere decir que se quitó ese incremento de precio
                        //y por lo tanto se debe actualizar
                        let r = deleteDTPI(object);
                        if (r === -1) {
                            errors++;
                        }

                    } else if (dtpi.operation > OPTION_DELETE && dtpi.dtpiStatus === false && dtpi.idDTPI > 0) {
                        //Eliminación
                        let r = deleteDTPI(object);
                        if (r === -1) {
                            errors++;
                        }
                    }
                }

                if (errors > 0) {
                    result.result = -1;
                    return resolve(result);
                } else {
                    result.result = 1;
                    return resolve(result);
                }

            } catch (error) {
                console.log(error);
                result.result = -1;
                return resolve(result);
            }
        });
    });
}

//ManageDTPI
//Esta petición gestiona si se está insertando, actualizando o eliminando un Incremento de Precio por Tipo de Decoración
/*Para esta petición se debe enviar un arreglo de objetos con las propiedades: 
    + operation
    + dtpiStatus
    + idPSP
    + idDTPI
    + idDecorationType
    + priceIncrease
*/
router.post("/api/products/ManageDTPI", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Incremento de Precio por Tipo de Decoración
    //result.result >0 indica que se completo la inserción/actualización/eliminación del Incremento de Precio por Tipo de Decoración
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        let bodyRequest = req.body;

        //Contador de errores
        var errors = 0;

        for (let index = 0; index < bodyRequest.length; index++) {
            const dtpi = bodyRequest[index];

            //Objeto a enviar
            let object = {
                idDTPI : dtpi.idDTPI,
                idPSP : dtpi.idPSP,
                idDecorationType : dtpi.idDecorationType,
                priceIncrease : dtpi.priceIncrease,
                dtpiStatus : dtpi.dtpiStatus,
            }

            if(dtpi.operation === OPTION_INSERT && dtpi.dtpiStatus === true && dtpi.idDTPI === 0){
                //Inserción
                let r = await insertDTPI(object);
                if(r === -1){
                    errors++;
                }

            } else if(dtpi.operation === OPTION_UPDATE && dtpi.dtpiStatus === true && dtpi.idDTPI > 0){
                //Actualización
                let r = await updateDTPI(object);
                if(r === -1){
                    errors++;
                }

            } else if(dtpi.operation === OPTION_UPDATE && dtpi.dtpiStatus === false && dtpi.idDTPI > 0){
                //Si es actualización pero viene con estado "false" quiere decir que se quitó ese incremento de precio
                //y por lo tanto se debe actualizar
                let r = await deleteDTPI(object);
                if(r === -1){
                    errors++;
                }

            } else if(dtpi.operation > OPTION_DELETE && dtpi.dtpiStatus === false && dtpi.idDTPI > 0){
                //Eliminación
                let r = await deleteDTPI(object);
                if(r === -1){
                    errors++;
                }
            }
        }

        if(errors > 0){
            result.result = -1;
            res.json(result);
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

//GetDTPIsByIdProduct
router.get('/api/products/GetDTPIsByIdProduct', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        api.get('/api/decorationtypepriceincreases/GetDTPIsByIdProduct', {
            params: {
                idProduct: req.query.idProduct,
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

function getDTPIsByIdPSP(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/decorationtypepriceincreases/GetDTPIsByIdPSP', {
                params: {
                    idPSP: req.query.idPSP,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetDTPIsByIdPSP
router.get('/api/products/GetDTPIsByIdPSP', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getDTPIsByIdPSP(req);
        
        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetDTPIsByIdPSPNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetDTPIsByIdPSPNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getDTPIsByIdPSP(req);
        
        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla DecorationTypePriceIncrease - Fin *********************************************/

/********************************************* Peticiones para Tabla ProductType - Inicio *********************************************/
//GetProductType
router.get('/api/products/GetProductType', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/producttypes/GetProductType', {
            params: {
                idProductType: req.query.idProductType,
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

function getProductTypes() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/producttypes/GetProductTypes').then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetProductTypes
router.get('/api/products/GetProductTypes', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getProductTypes();

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetProductTypesNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetProductTypesNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getProductTypes();

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getProductTypesForCatalog() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/producttypes/GetProductTypesForCatalog').then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetProductTypesForCatalog
router.get('/api/products/GetProductTypesForCatalog', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getProductTypesForCatalog();

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetProductTypesForCatalogNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetProductTypesForCatalogNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getProductTypesForCatalog();

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla ProductType - Fin *********************************************/

/********************************************* Peticiones para Tabla Product - Inicio *********************************************/
function verifyProductExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/products/VerifyProductExistence", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function verifyProductUsing(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/products/VerifyProductUsing", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//InsertProduct
router.post("/api/products/InsertProduct", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Producto
    //result.result >0 indica que se registró el Producto
    //result.result -1 Producto existente con mismo Tamaño, Tipo de Producto y Tipo de Pan
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos la existencia del producto
        result.result = await verifyProductExistence(req);

        if (result.result === 0) {

            api.post('/api/products/InsertProduct', req.body).then(resp => {

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
            //-1 = Producto existente con mismo Tamaño, Tipo de Producto y Tipo de Pan, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});


//UpdateProduct
router.post("/api/products/UpdateProduct", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó
    //result.result >0 indica que se actualizó
    //result.result -1 Producto existente con mismo Tamaño, Tipo de Producto y Tipo de Pan
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos la existencia del producto
        result.result = await verifyProductExistence(req);

        if (result.result === 0) {

            api.post('/api/products/UpdateProduct', req.body).then(resp => {

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
            //-1 = Producto existente con mismo Tamaño, Tipo de Producto y Tipo de Pan, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//DeleteProduct
router.post("/api/products/DeleteProduct", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó
    //result.result >0 indica que se eliminó
    //result.result -1 Indica que este Producto está siendo utilizado por un Producto de Catálogo activo
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si el Producto que se desea eliminar está siendo utilizado por un Producto de Catálogo activo
        result.result = await verifyProductUsing(req);

        if(result.result === 0){

            api.post('/api/products/DeleteProduct', req.body).then(resp => {
    
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
            //-1 = Producto en uso por Producto de Catálogo activo, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//GetProduct
router.get('/api/products/GetProduct', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get('/api/products/GetProduct', {
            params: {
                idProduct: req.query.idProduct,
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

function getProductForCatalog(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/products/GetProductForCatalog', {
                params: {
                    idProductType: req.query.idProductType,
                    idBreadType: req.query.idBreadType,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetProductForCatalog
router.get('/api/products/GetProductForCatalog', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getProductForCatalog(req);
        
        result.result = 1;
        result.data = data;
        res.json(result);
        
    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetProductForCatalogNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetProductForCatalogNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getProductForCatalog(req);
        
        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});


//GetProducts
router.get('/api/products/GetProductsByFilter', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        api.get('/api/products/GetProductsByFilter', {
            params: {
                idProductType: req.query.idProductType,
                idBreadType: req.query.idBreadType,
                idProductStatus: req.query.idProductStatus,
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
/********************************************* Peticiones para Tabla Product - Fin *********************************************/

/********************************************* Peticiones para Tabla Catalog - Inicio *********************************************/
function verifyCatalogExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/catalogs/VerifyCatalogExistence", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//InsertCatalog
router.post("/api/products/InsertCatalog", isValidated, async (req, res) => {

    //result.result 0 indica que no se registró el Producto de Catalogo
    //result.result >0 indica que se registró el Producto de Catalogo
    //result.result -1 Catalogo existente con exactamente los mismos valores
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        console.log(req.body);

        //Verificamos la existencia del producto de catálogo
        result.result = await verifyCatalogExistence(req);

        if (result.result === 0) {

            api.post('/api/catalogs/InsertCatalog', req.body).then(resp => {

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

            //CatalogsMicroservice retorna: 
            //-1 = Catalogo existente con exactamente los mismos valores, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});


//UpdateCatalog
router.post("/api/products/UpdateCatalog", isValidated, async (req, res) => {

    //result.result 0 indica que no se actualizó
    //result.result >0 indica que se actualizó
    //result.result -1 Catalogo existente con exactamente los mismos valores
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos la existencia del producto de catálogo
        result.result = await verifyCatalogExistence(req);

        if (result.result === 0) {

            api.post('/api/catalogs/UpdateCatalog', req.body).then(resp => {

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

            //CatalogsMicroservice retorna: 
            //-1 = Catalogo existente con exactamente los mismos valores, -2 = Hubo un error
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});

//DeleteCatalog
router.post("/api/products/DeleteCatalog", isValidated, async (req, res) => {

    //result.result 0 indica que no se eliminó
    //result.result >0 indica que se eliminó
    //result.result -1 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        api.post('/api/catalogs/DeleteCatalog', req.body).then(resp => {

            result.result = resp.data;

            if (result.result > 0) {

                res.json(result);

            } else if (result.result === 0) {

                res.json(result);

            } else {

                result.result = -1;
                res.json(result);

            }

        });

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getCatalog(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/catalogs/GetCatalog', {
                params: {
                    idCatalog: req.query.idCatalog
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetCatalog
router.get('/api/products/GetCatalog', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getCatalog(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetCatalogNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetCatalogNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getCatalog(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

function getCatalogsN(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/catalogs/GetCatalogsN', {
                params: {
                    lastIdCatalog: req.query.lastIdCatalog,
                    quantityProducts: req.query.quantityProducts,
                    idProductType: req.query.idProductType,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetCatalogsN
router.get('/api/products/GetCatalogsN', isValidated, async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getCatalogsN(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});

//GetCatalogsNNT - Sin validación de TOKEN, sirve para sitio web de Clientes
router.get('/api/products/GetCatalogsNNT', async (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {

        let data = await getCatalogsN(req);

        result.result = 1;
        result.data = data;
        res.json(result);

    } catch (error) {
        console.log(error);
        result.result = -1;
        res.json(result);
    }
});
/********************************************* Peticiones para Tabla Catalog - Fin *********************************************/

module.exports = router;