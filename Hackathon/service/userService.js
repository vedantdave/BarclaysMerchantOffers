/**
 * Created by vsaini on 11/17/2017.
 */

var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://127.0.0.1:27017/hackTest3';

module.exports = function () {

    this.mongodbTest = function () {

        console.log("call AYA");
        // Connection URL

        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            insertDocuments(db, function () {
                db.close();
            });
        });
    };


    this.insertDocuments = function (db, callback) {
        // Get the documents collection
        var collection = db.collection('documents');
        collection.insertMany([
            {a: 1}, {a: 2}, {a: 3}
        ], function (err, result) {
            console.log("Inserted 3 documents into the document collection");
            callback(result);
        });
    };

    this.getAccountDetails = function (accoundId,res) {
        // Connection URL

        var result = null;
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            this.getAccountDetailsOperation(db, accoundId, function (docs) {
                db.close();
                res.send(docs);
            });
        });
    };


    this.getAccountDetailsOperation = function (db,accountId, callback) {
        var collection = db.collection('documents');
        collection.findOne({_id:accountId},function (err, docs) {
            console.log("Found the following records");
            callback(docs);
        });
    };
};