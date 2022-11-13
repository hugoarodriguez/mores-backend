var nodemailer = require('nodemailer');

function sendMail (toMail, subject, htmlText) {

    return new Promise((resolve, reject) => {
        var result = -1;

        try {

            //Creamos el objeto de transporte
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'pasteleriamoresprueba@gmail.com',
                    pass: 'nwxm fckk dgfn vvgh'
                }
            });

            //Elementos del correo
            var mailOptions = {
                from: 'pasteleriamoresprueba@gmail.com',
                to: toMail,
                subject: subject,
                html: htmlText
            };

            //Enviar correo
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    result = -1;//No se pudo enviar el email
                    return resolve(result);
                } else {
                    console.log('Email enviado: ' + info.response);
                    result = 1;//Email enviado
                    return resolve(result);
                }
            });

        } catch (error) {
            console.log(error);
            result - 1;//No se pudo enviar el email
            return resolve(result);
        }

    })

}

module.exports = {sendMail};