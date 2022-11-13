var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
const crypto = require('crypto');

/* Si se está ejecutando de forma local el Kubernete se debe colocar "host.docker.internal", ya que esto permite acceder a la IP
del host donde está corriendo la el Kubernete, si ya está el servicio publicado en AKS, se debe colocar la IP de ese servicio 
proporcionada por AKS */
const apiAdapter = require('./apiAdapter');
//const BASE_URL = 'http://host.docker.internal:5000';
const BASE_URL = '20.237.74.10:5000';
const api = apiAdapter(BASE_URL);
var config = require('../config');
const isValidated = require('../requestValidator');
const mailSender = require('../mailSender');
const utils = require('../utils');
const { json } = require('body-parser');

//Constantes para validaciones
const ACTIVE_USER_STATUS = 1;
const INACTIVE_USER_STATUS = 2;
const BLOCKED_USER_STATUS = 3;

const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = Buffer.from(config.sk + 'EWlKate7uGo5tHski1LmyqJHvUhs=', 'base64');
const IV_LENGTH = 16;

//Creación de Password Aleatoria para recuperación de la cuenta
function randomPassword() {
    var pass = '';
    var dataForPassword = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!*@#$%^&+=';

    for (let i = 1; i <= 10; i++) {
        var char = Math.floor(Math.random() * dataForPassword.length + 1);

        pass += dataForPassword.charAt(char)
    }

    return pass;
}

//Encriptación de contraseña
function encryptPassword(password) {

    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(password);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');

}

//Desencriptación de contraseña
function decryptPassword(password) {
    let textParts = password.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

/************ Login ************/

router.post("/api/users/Login", async (req, res) => {
    /*
    result.result >0 = Id del usuario que se logea
    result.result -1 = No existe un usuario registrado con ese email
    result.result -2 = Contraseña incorrecta
    result.result -3 = Usuario bloqueado
    result.result -4 = Hubo un error
    */

    var result = {
        data: {},
        token: '',
        result: 0
    }

    try {

        //Obtenemos la información del usuario por su email
        user = await getUserByEmail(req.body.email, req.body.frontEndRequest);

        if (user != null && user.idUserType === req.body.frontEndRequest) {

            let decryptedPassword = decryptPassword(user.passwordU);

            if (req.body.passwordU === decryptedPassword) {
                jwt.sign({ user }, config.sk, { expiresIn: '3600s' },(err, token) => {

                    user.passwordU = '';//Vacíamos la contraseña para no enviarla al front-end
                    result.data = user;
                    result.token = token;
                    result.result = user.idUser;

                    res.json(result);
                });
            } else {
                result.result = -2;
                res.json(result);
            }

        } else {
            result.result = -1;
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        result.result = -4;
    }
});
/************ Login ************/

/************ InsertUser o CreateAccount ************/
function verifyUserExistence(req) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/users/VerifyUserExistence", req.body).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

//Crear cuentas en sitio Web de Cliente
router.post("/api/users/CreateAccount", async (req, res) => {

    //result.result 0 indica que no se registró el usuario
    //result.result >0 indica que se registró el usuario
    //result.result -1 Email ocupado por otro usuario 
    //result.result -2 No ha confirmado su registro
    /*result.result -3 indica que hubo un error (si la petición a InsertUser retorna -1 de igual forma retornamos -3, ya que es el 
        nivel más alto de error)*/

    var result = {
        data: {},
        result: 0
    }

    try {

        //Verificamos si hay un usuario registrado con este email
        let user = await getUserByEmail(req.body.email, req.body.idUserType);

        result.result = user.idUser;

        let encryptedPassword = encryptPassword(req.body.passwordU);
        req.body.passwordU = encryptedPassword;

        if (result.result === 0) {

            api.post('/api/users/InsertUser', req.body).then(resp => {

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

            //Verificamos si este usuario ya confirmó su registro

            if(user.idUserStatus === 4){
                //No ha confirmado su registro
                result.result = -2;
                res.json(result);

            } else if(user.idUserStatus === 1){
                //Ya confirmó su registro, por lo tanto ya existe una cuenta registrada con este email
                result.result = -1;
                res.json(result);
            }
        }

    } catch (error) {
        console.log(error);
        result.result = -3;
        res.json(result);
    }
});

function getConfirmationCode(idUser) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/users/GetConfirmationCode', {
                params: {
                    idUser: idUser,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

function insertConfirmationCode(confirmationCodeData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/users/InsertConfirmationCode", confirmationCodeData).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function deleteConfirmationCode(confirmationCodeData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/users/DeleteConfirmationCode", confirmationCodeData).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

function updateUserStatus(idUser, idUserStatus) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post("/api/users/UpdateUserStatus", {
                "idUser": idUser,
                "idUserStatus": idUserStatus
            }).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}

router.post("/api/users/SendConfirmationMail", async (req, res) => {

    //result.result >0 indica que se envió el email
    //result.result -1 indica que no se envió el email
    //result.result -2 indica que solo se puede solicitar un codigo de confirmación por día
    //result.result -3 indica que no existe un usuario registrado con ese email
    //result.result -4 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        let user = await getUserByEmail(req.body.email, req.body.idUserType);

        if (user !== null) {
            let confirmationCodeData = await getConfirmationCode(user.idUser);

            var stringActualDate = '';
            var stringConfirmationCodeDate = '';
            var formattedActualDate = null;
            var formattedConfirmationCodeDate = null;

            //Validamos si userConfirmationCode tiene un valor asignado
            if(confirmationCodeData.userConfirmationCode !== ''){
                //Si tiene un valor asignado, formateamos la fecha actual y la fecha obtenida del último código enviado
                stringActualDate = utils.getDateString(new Date());
                stringConfirmationCodeDate = utils.getDateString(confirmationCodeData.requestedDate);

                formattedActualDate = utils.formatDate(stringActualDate);
                formattedConfirmationCodeDate = utils.formatDate(stringConfirmationCodeDate);
            } else {
                //Si no tiene un valor asignado colocamos el mismo valor para las fechas a comparar
                stringActualDate = utils.getDateString(new Date());

                formattedActualDate = utils.formatDate(stringActualDate);
                formattedConfirmationCodeDate = utils.formatDate(stringActualDate);
            }

            if ((formattedActualDate > formattedConfirmationCodeDate) || 
                (formattedActualDate === formattedConfirmationCodeDate && confirmationCodeData.userConfirmationCode === '' 
                && confirmationCodeData.idUser === 0 && user.idUserStatus === 4)) {

                /*Si la fecha actual es superior a la fecha de la última petición de código
                  O, si la fecha actual es igual a la fecha de la última petición de código, y el "userConfirmationCode" está vacío
                  y el "idUser" > 0 (esto último indica que se hizo un intento de envío de código de confirmación, pero este se 
                  almacenó vacío)*/

                if(formattedActualDate > formattedConfirmationCodeDate){
                    //Eliminamos el existente
                    result.result = await deleteConfirmationCode(confirmationCodeData);
                } else if (formattedActualDate === formattedConfirmationCodeDate && confirmationCodeData.userConfirmationCode === '' 
                && confirmationCodeData.idUser === 0 && user.idUserStatus === 4){
                    result.result = 1;
                }

                if(result.result > 0){
                    
                    //Si se eliminó, creamos y enviamos uno nuevo

                    var confirmationCode = randomPassword();

                    //Asignamos los datos al objeto confirmationCodeData para insertarlo
                    confirmationCodeData.idUser = user.idUser;
                    confirmationCodeData.userConfirmationCode = confirmationCode;
                    confirmationCodeData.requestedDate = formattedActualDate;

                    result.result = await insertConfirmationCode(confirmationCodeData);

                    if(result.result > 0){

                        //Enviamos un nuevo código de confirmación al email proporcionado
                        var htmlText = '<h1>¡Bienvenido a Pastelería More\'s!</h1><p>Este es tu código de confirmación <b>' + confirmationCode + '</b></p>';

                        result.result = await mailSender.sendMail(req.body.email, 'Código de Confirmación', htmlText);

                        if (result.result > 0) {

                            //Código de confirmación enviado
                            res.json(result);

                        } else {

                            //No se pudo enviar el código de confirmación
                            result.result = -1;
                            res.json(result);
                        }
                    } else {
                        //No se pudo enviar el código de confirmación
                        result.result = -1;
                        res.json(result);
                    }
                } else {
                    
                    //No se pudo enviar el código de confirmación
                    result.result = -1;
                    res.json(result);
                }

            } else {
                //Solo se puede enviar un código de confirmación por día
                result.result = -2;
                return res.json(result);
            }
        } else {
            //No existe un usuario registrado con ese email
            result.result = -3;
            return res.json(result);
        }

    } catch (error) {
        console.log(error);
        //Hubo un error
        result.result = -4;
        return res.json(result);
    }
});

router.post("/api/users/ValidateConfirmationCode", async (req, res) => {

    //result.result >0 código de confirmación es correcto
    //result.result -1 código de confirmación incorrecto
    //result.result -2 solicita un nuevo código
    //result.result -3 hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {


        //Obtenemos la información del usuario para extraer el ID
        let user = await getUserByEmail(req.body.email, req.body.idUserType);

        //Obtenemos la información del código de confirmación
        let confirmationCodeData = await getConfirmationCode(user.idUser);

        //Validamos si userConfirmationCode tiene un valor asignado
        if(confirmationCodeData.userConfirmationCode !== ''){

            //Validamos si el userConfirmationCode ingresado por el usuario es igual al registrado en la BD
            if(req.body.userConfirmationCode === confirmationCodeData.userConfirmationCode){
                    
                //Eliminamos el código de confirmación, esto indicará que el usuario ya se ha registrado satisfactoriamente
                result.result = await deleteConfirmationCode(confirmationCodeData);

                if(result.result > 0){

                    //Actualizamos el estado del Cliente, cambiamos de 4 - Por Confirmar a 1 - Activo
                    result.result = await updateUserStatus(user.idUser, ACTIVE_USER_STATUS);

                    if(result.result > 0){
                        
                        return res.json(result);
                    } else {
                        //Hubo un error
                        result.result = -3;
                        res.json(result);
                    }

                } else {
                    //Hubo un error
                    result.result = -3;
                    res.json(result);
                }
                

            } else {
                //Código de confirmación incorrecto
                result.result = -1;
                res.json(result);
            }
        } else {
            //Solicita un código nuevo
            result.result = -2;
            res.json(result);
        }

    } catch (error) {
        console.log(error);
        //Hubo un error
        result.result = -3;
        return res.json(result);
    }
});
/************ InsertUser o CreateAccount ************/

/************ UpdateUser ************/
function updateUser(path, user) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.post(path, user).then(resp => {

                return resolve(resp.data);
            });

        });
    });
}


router.post("/api/users/UpdateUser", isValidated, async (req, res) => {

    //result.result >0 indica que se actualizaron los datos del usuario
    //result.result -1 indica que no se acutalizaron los datos del usuario
    //result.result -2 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        var user = {
            "idUser" : req.body.idUser,
            "firstName" : req.body.firstName,
            "lastName" : req.body.lastName,
            "phone" : req.body.phone,
        }

        result.result = await updateUser(req.path, user);

        if (result.result > 0) {
            //Usuario actualizado

            //Consultamos la nueva información del usuario actualizado
            result.data = await getUserById(req.body.idUser);
            result.data.passwordU = '';

            res.json(result);

        } else if (result.result === 0) {
            //No se pudo actualizar la información del usuario
            result.result = -1;
            res.json(result);

        } else {
            //Hubo un error
            result.result = -2;
            res.json(result);
        }


    } catch (error) {
        //Hubo un error
        console.log(error);
        result.result = -2;
        res.json(result);
    }
});
/************ UpdatePassword - Normal ************/

/************ UpdateUserPassword - Normal (el usuario cambió su contraseña) ************/
router.post("/api/users/UpdateUserPassword", isValidated, async (req, res) => {

    //result.result >0 indica que se actualizó la contraseña
    //result.result -1 indica que no existe este usuario
    //result.result -2 indica que no se pudo actualizar la contraseña
    //result.result -3 indica que la contraseña actual no coincide con la ingresada
    //result.result -4 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Obtenemos la información del usuario según su ID
        var user = await getUserById(req.body.idUser);

        if (user.idUser > 0 && user.idUserType === req.body.frontEndRequest && user.idUserStatus === ACTIVE_USER_STATUS) {

            let decryptedPassword = decryptPassword(user.passwordU);

            if (req.body.passwordU === decryptedPassword) {

                //Se encripta la contraseña
                let encryptedPassword = encryptPassword(req.body.passwordUN);

                //Se asigna la contraseña temporal al objeto "user"
                user.passwordU = encryptedPassword;
                user.tempPassword = 0;//Indica que el usuario está asignando la contraseña

                api.post("/api/users/UpdateUserPassword", user).then(resp => {

                    if (resp.data > 0) {
                        //Contraseña actualizada
                        result.result = resp.data;
                        res.json(result);

                    } else if (resp.data === 0) {
                        //No se pudo actualizar la contraseña
                        result.result = -2;
                        res.json(result);

                    } else {
                        //Error
                        result.result = -4;
                        res.json(result);
                    }
                });

            } else {
                //Contraseña actual no coincide con la ingresada
                result.result = -3;
                res.json(result);
            }

        } else {
            //No existe este usuario
            result.result = -1;
            res.json(result);
        }


    } catch (error) {
        //Error
        console.log(error);
        result.result = -4;
        res.json(result);
    }
});
/************ UpdatePassword - Normal ************/


/************ UpdateUserPasswordRA - RecoverAccount (el sistema asigna una contraseña temporal) ************/
router.post("/api/users/UpdateUserPasswordRA", async (req, res) => {

    //result.result >0 indica que se actualizó la contraseña y se envió el email
    //result.result -1 indica que no existe un usuario con ese email
    //result.result -2 indica que no se pudo actualizar la contraseña
    //result.result -3 indica que hubo un error

    var result = {
        data: {},
        result: 0
    }

    try {

        //Obtenemos la información del usuario según su email
        var user = await getUserByEmail(req.body.email, req.body.frontEndRequest);

        if (user.idUser > 0 && user.idUserType === req.body.frontEndRequest) {
            //Si se obtuvo información se procede con la creación de la contraseña aleatoria
            let randomPasswordN = randomPassword();

            //Se encripta la contraseña
            let encryptedPassword = encryptPassword(randomPasswordN);

            //Se asigna la contraseña temporal al objeto "user"
            user.passwordU = encryptedPassword;
            user.tempPassword = 1;//Indica que es para contraseña temporal

            api.post("/api/users/UpdateUserPassword", user).then(resp => {

                if (resp.data > 0) {

                    user.passwordU = encryptedPassword;

                    result.data = user;
                    result.result = resp.data;
                    res.json(result);

                } else if (resp.data === 0) {

                    result.result = -2;
                    res.json(result);

                } else {
                    result.result = -3;
                    res.json(result);
                }
            });

        } else {
            result.result = -1;
            res.json(result);
        }


    } catch (error) {
        console.log(error);
        result.result = -3;
        res.json(result);
    }
});

router.post("/api/users/SendRecoverAccountMail", async (req, res) => {

    //Respuesta >0 indica que se envió el email
    //Respuesta -3 indica que no se envió el email

    var result = {
        data: {},
        result: 0
    }

    try {

        let decryptedPassword = decryptPassword(req.body.passwordU);

        var htmlText = '<h1>¡Recupera tu Cuenta!</h1><p>Esta es tu contraseña temporal <b>' + decryptedPassword + '</b> ' +
            '<br/>Con ella debes iniciar sesión, y luego se te solicitará ingresar una nueva.</p>';

        result.result = await mailSender.sendMail(req.body.email, 'Recuperación de cuenta', htmlText);

        result.result = 1;

        if (result.result > 0) {

            res.json(result);

        } else {

            result.result = -3;
            res.json(result);

        }

    } catch (error) {
        console.log(error);
        result.result = -3;
        res.json(result);
    }
});
/************ RecoverAccount ************/

//GetUserByEmail
router.get('/api/users/GetUserByEmail', isValidated, (req, res) => {

    try {
        api.get(req.path, {
            params: {
                email: req.query.email,
            }
        }).then(resp => {
            res.send(resp.data);
        });

    } catch (error) {
        console.log(error);
    }
});

function getUserByEmail(email, idUserType) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/users/GetUserByEmail', {
                params: {
                    email: email,
                    idUserType: idUserType
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

//GetUserById
router.get('/api/users/GetUserById', isValidated, (req, res) => {

    var result = {
        data: {},
        result: 0
    }

    try {
        api.get(req.path, {
            params: {
                idUser: req.query.idUser,
            }
        }).then(resp => {
            result.result = 1;
            result.data = resp.data
            res.json(result);
        });

    } catch (error) {
        console.log(error);
    }
});

function getUserById(idUser) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            api.get('/api/users/GetUserById', {
                params: {
                    idUser: idUser,
                }
            }).then(resp => {
                return resolve(resp.data)
            });

        });
    });
}

router.get("/api/users/GetDate", (req, res) => {

    try {

        const stringDate = utils.getDateString(new Date());
        console.log(stringDate);

        const formattedDate = utils.formatDate(stringDate);
        console.log(formattedDate);

        console.log(randomPassword());

        res.json(stringDate);

    } catch (error) {
        console.log(error);
        res.json("Error");
    }
});

module.exports = router;