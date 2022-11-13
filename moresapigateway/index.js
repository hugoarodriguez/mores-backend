var express = require("express");
var app = express();
var router = require('./routers/router');
var bodyParser = require('body-parser');
var cors = require('cors')

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', (req, res) => {
    res.send("Funcionando el API Gateway de Pastelería More's");
});

app.use(router);

console.log("API Gateway de Pastelería More's corriendo en localhost:3000");

app.listen(3000);