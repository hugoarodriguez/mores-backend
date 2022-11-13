var express = require('express');
var router = express.Router();
var usersMicroservice = require('./usersMicroservice');
var productsMicroservice = require('./productsMicroservice');
var ordersMicroservice = require('./ordersMicroservice');

router.use((req, res, next) => {
    console.log("Llamando: ", req.path);
    next();
});

router.use(usersMicroservice);
router.use(productsMicroservice);
router.use(ordersMicroservice);

module.exports = router;