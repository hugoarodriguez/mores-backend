function getDateString(date) {

    return date.toLocaleString('sv', {
        timeZone: 'America/El_Salvador',
    });
}

function getDateObject(date) {

    if (typeof date === 'string') {
        return new Date(
            new Date(date).toLocaleString('sv', {
                timeZone: 'America/El_Salvador',
            }),
        );
    }

    return new Date(
        date.toLocaleString('sv', {
            timeZone: 'America/El_Salvador',
        }),
    );
}

function formatDate(date) {
    let d = new Date(date);
    let month = (d.getMonth() + 1).toString().padStart(2, '0');
    let day = d.getDate().toString().padStart(2, '0');
    let year = d.getFullYear();
    return [year, month, day].join('-');
}

//Función para determinar la diferencia de días entre fechas
//NOTA: Las fechas deben ser enviadas en formato de string y con la hora incluida
function daysBetweenDates(initialDate, finalDate) {

    const date1 = Date.parse(initialDate);
    const date2 = Date.parse(finalDate);
    console.log("date1: " + date1.toString());
    console.log("date2: " + date2.toString());

    // Un día en milisegundos
    const oneDay = 1000 * 60 * 60 * 24;

    // Calculando la diferencia entre las dos fechas
    const diffInTime = date2 - date1;

    // Calculando el número de días de diferencia entre las dos fechas
    const diffInDays = diffInTime / oneDay;

    return diffInDays;
}

//Permite darle formato "YYYY-MM-DD" a la fecha retornada del Microservicio, ya que esta viene en formato "YYYY-MM-DDT00:00:00"
function formatDatabaseDate(date) {
    const indexT = date.indexOf("T");

    return date.slice(0, indexT);
}

//Función para determinar la diferencia de días entre fechas
//NOTA: Las fechas deben ser enviadas en formato de string y con la hora incluida
function validateTime(time = "") {

    var result = -1;

    try {

        //La longitud de la hora debe ser =5, ya que la hora debe ser en formato "00:00"
        if (time.length === 5) {

            //Buscamos el ":" de separación
            const indexSeparator = time.indexOf(":");

            //Ya que el ":" siempre se debe encontrar en la posición 2 de la hora
            if (indexSeparator === 2) {

                //Obtenemos las partes de la hora
                const hour = time.slice(0, indexSeparator);
                const minutes = time.slice(indexSeparator + 1, time.length);

                //Convertimos las partes a int
                const hourInt = parseInt(hour);
                const minutesInt = parseInt(minutes);

                //Validamos que la primera parte se encuentre entre 8 y 16, que indican las horas
                //Validamos que la segunda parte se encuentre entre 0 y 59, que indican los minutos
                //Para efectuar una validación de horas entre 08:00 hasta 16:59 (04:59pm)
                //Para el horario de 17:00 (05:00pm) se añade una validación adicional
                if((hourInt >= 8 && hourInt <= 16) && (minutesInt >= 0 && minutesInt <= 59)){
                    result = 1;
                } else if((hourInt === 17) && (minutesInt === 0)){
                    //La hora máxima de entrega son las 17:00 o 05:00pm
                    result = 1;
                } else {
                    result = -4;
                }


            } else {
                result = -3;
            }

        } else {
            result = -2;
        }

    } catch (error) {
        console.log(error);
        result = -1;
    }

    return result;
}

module.exports = { getDateString, getDateObject, formatDate, daysBetweenDates, formatDatabaseDate, validateTime };
