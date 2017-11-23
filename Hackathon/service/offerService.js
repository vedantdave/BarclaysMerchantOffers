/**
 * Created by vsaini on 11/17/2017.
 */

var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://127.0.0.1:27017/hackTest3';


/* engine parameters*/

var bank_prod_count = 5;
var total_transact_count = 150;
var base_offer_fees = 400;
var customer_value_threshold = 0.3;


module.exports = function () {

    this.startOfferEngine = function () {
        // Connection URL

        var result = null;
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            this.getAllAccounts(db, function (accounts) {

                this.generateOffers(accounts, db);

                db.close();
                /*res.send(docs);*/
            });
        });
    };


    this.getAllAccounts = function (db, callback) {
        var collection = db.collection('documents');
        collection.find({}).toArray(function (err, docs) {
            //console.log("Accounts Fetched");
            //console.dir(docs);
            callback(docs);
        });
    };


    this.generateOffers = function (accounts, db) {
        console.log("Offer Generation Started.")
        for (var index = 0; index < accounts.length; index++) {
            console.log("\n\n Account Number " + index + "  Processing Started.");
            getCustomerValue(accounts, index, function (accounts, index, customerValue, category) {
                var offer = {
                    'category': category,
                    'existing_fee_rate': (accounts[index].charges_category[0])[category].fees.value,
                    'offered_Fee_rate': (1 - customerValue / 2) * ((accounts[index].charges_category[0])[category].fees.value),
                    'existing_interest_rate': (accounts[index].charges_category[0])[category].intrest_rate.value,
                    'offered_interest_rate': (1 - customerValue / 2) * ((accounts[index].charges_category[0])[category].intrest_rate.value),
                    'offer_Fees': Math.round(customerValue * base_offer_fees),
                    'offer_expiry_date': '1',
                    'offer_id': Math.floor((Math.random() * 100000000) + 10000000)

                };
                (accounts[index])['customer_value'] = customerValue;
                if (customerValue > customer_value_threshold) {
                    (accounts[index])['offer'] = offer;
                }
                saveGeneratedOffers(accounts[index], db);
                console.log(offer);
            });
        }
    };

    function getCustomerValue(accounts, index, callback) {
        var customerValue = null;
        var category = null;
        var max = 0;
        var category_count = {};
        var prod_count = 0;
        for (var trans_index = 0; trans_index < accounts[index].transactions.length; trans_index++) {
            //console.log(accounts[index].transactions[trans_index].transaction_id);

            if (category_count.hasOwnProperty(accounts[index].transactions[trans_index].category)) {
                category_count[accounts[index].transactions[trans_index].category] += 1;
            } else {
                category_count[accounts[index].transactions[trans_index].category] = 1;
            }
        }

        for (key in category_count) {
            if (category_count[key] > max) {
                category = key;
                max = category_count[key];
            }
        }

        for (key in accounts[index].bank_product[0]) {
            if ((accounts[index].bank_product[0])[key]) {
                prod_count++;
            }
        }

        customerValue = ((prod_count / bank_prod_count) + (accounts[index].transactions.length / total_transact_count)) / 2;

        console.log(accounts[index].first_name + " " + accounts[index].last_name);
        console.log("Total Transactions - " + accounts[index].transactions.length);
        console.log(category_count);
        console.log("category with higest num of trans - " + category);
        console.log(accounts[index].bank_product);
        console.log("Prod Count - " + prod_count);
        console.log("Customer Value - " + customerValue);

        callback(accounts, index, customerValue, category);
    }


    this.saveGeneratedOffers = function (account, db) {
        var collection = db.collection('documents');
        collection.save(account);
    };
};