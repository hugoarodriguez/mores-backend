const jwt = require('jsonwebtoken');
var config = require('./config');

// Authorization: Bearer <token>
module.exports =  (req, res, next) => {
    
    const bearerHeader =  req.headers['authorization'].replaceAll("\"", "");

    if(typeof bearerHeader !== 'undefined'){

        jwt.verify(req.headers['authorization'].replaceAll("\"", ""), config.sk, (err, decoded) => {
            if (err) {

                var result = {
                    data: {
                        "status":"Forbidden"
                    },
                    result: 403
                }

                console.log("Error: " + err);

              res.json(result);
            } else {
                const bearerToken = bearerHeader.split(" ")[1];
                req.token  = bearerToken;
                next();
            }
          });
    }else{
        res.sendStatus(401);
    }
}