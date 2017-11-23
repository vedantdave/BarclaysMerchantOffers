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
            this.insertDocuments(db, function () {
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

    this.getAccountDetails = function (accoundId, res) {
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

    this.getAccountOfferDetails = function (accoundId, res) {
        // Connection URL

        var result = null;
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            this.getAccountDetailsOperation(db, accoundId, function (docs) {
                db.close();
                res.send(docs.offer);
            });
        });
    };


    this.getAccountDetailsOperation = function (db, accountId, callback) {
        var collection = db.collection('documents');
        collection.findOne({_id: accountId}, function (err, docs) {
            console.log("Found the following records");
            callback(docs);
        });
    };

    this.performTransaction = function (accoundId, req, res) {
        // Connection URL

        var result = null;
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            this.transactionOperation(db, req, accoundId, function (docs) {
                db.close();
                res.send(docs);
            });
        });
    };

    this.transactionOperation = function (db, req, accountId, callback) {
        var collection = db.collection('documents');
        var account = null;
        console.log(accountId);
        collection.findOne({_id: accountId}, function (err, docs) {
            console.log("Found the following records");
            console.log(req);
            account = docs;
            console.log(((account.charges_category[0])[req.category]).fees);
            account.account_balance = account.account_balance - req.amount - (req.amount * ((account.charges_category[0])[req.category]).fees.value / 100);
            var transaction = {
                "transaction_id": "b4cbe1d7-52c9-4b35-8ef2-3f76d7" + Math.floor((Math.random() * 1000000) + 100000),
                "category": req.category,
                "transaction_date": new Date(),
                "transaction_amount": req.amount,
                "fee_perct": ((account.charges_category[0])[req.category]).fees.value,
                "fee_amount": req.amount * ((account.charges_category[0])[req.category]).fees.value / 100,
                "offer_applied": (((account.charges_category[0])[req.category]).fees.value == ((account.charges_category[0])[req.category]).fees.fall_back_value ) ? 'no' : 'yes',
                "original_fee_amount_without_offer": req.amount * ((account.charges_category[0])[req.category]).fees.fall_back_value / 100,
                "offer_benefit": req.amount * ((account.charges_category[0])[req.category]).fees.fall_back_value / 100 - req.amount * ((account.charges_category[0])[req.category]).fees.value / 100
            };

            (account.transactions).push(transaction);
            collection.save(account);
            callback(transaction);
        });


    };

    this.acceptOffer = function (accoundId,  res) {
        // Connection URL
        var result = null;
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            this.acceptOfferOperation(db, accoundId, function (docs) {
                db.close();
                res.send(docs);
            });
        });
    };

    this.acceptOfferOperation = function (db, accountId, callback) {
        var collection = db.collection('documents');
        var account = null;
        console.log(accountId);
        collection.findOne({_id: accountId}, function (err, docs) {
            console.log("Found the following records");
            /*console.log(docs);*/
            account = docs;
            console.log(account.offer);
            console.log((account.charges_category[0])[account.offer.category]);
            ((account.charges_category[0])[account.offer.category]).fees.fall_back_value = ((account.charges_category[0])[account.offer.category]).fees.value;
            ((account.charges_category[0])[account.offer.category]).fees.value = account.offer.offered_Fee_rate;
            account.account_balance = account.account_balance - account.offer.offer_Fees;
            ((account.charges_category[0])[account.offer.category]).fees.offer = account.offer;
            account['applied_offer'] = account.offer;
            account.offer = {};
            collection.save(account);
            callback(account['applied_offer']);
        });
    };
};