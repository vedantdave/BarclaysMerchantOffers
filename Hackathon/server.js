/**
 * Created by vsaini on 11/17/2017.
 */

var express = require('express');
var app = express();
var path = require('path');

/*
* mongodb command to start the database mongod --dbpath=/data --port 27017
*
* */


/*services*/
require('./service/userService.js')();
require('./service/offerService.js')();

//console.log(userService);

app.get('/', function (req, res) {
  res.send("Server Ready");
});

app.listen(3030, '192.168.42.74' || 'localhost', function () {
  console.log('React app listening on port 3030');
  //mongodbTest();
    startOfferEngine();
});

app.get('/account/:accountId', function (req, res) {
    console.log('request received');
    console.log(req.params.accountId);
    getAccountDetails(req.params.accountId,res);
});

app.post('/account/transact/:accountId', function (req, res) {
    console.log('request received');
    console.log(req.params.accountId);
    getAccountDetails(req.params.accountId,res);
});