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

                this.generateOffers(accounts,db);

                db.close();
                /*res.send(docs);*/
            });
        });
    };


    this.getAllAccounts = function (db, callback) {
        var collection = db.collection('documents');
        collection.find({}).toArray(function(err, docs) {
            //console.log("Accounts Fetched");
            //console.dir(docs);
            callback(docs);
        });
    };



    this.generateOffers = function(accounts,db){
        console.log("Offer Generation Started.")
        for(var index = 0 ; index < accounts.length ; index ++){
            console.log("\n\n Account Number " + index + "  Processing Started.");
            getCustomerValue(accounts, index,function (accounts,index,customerValue,catagory) {
                    var offer = {'catagory' : catagory,
                        'Existing_Fee_rate' : (accounts[index].charges_category[0])[catagory].fees.value,
                        'Offered_Fee_rate' : (1-customerValue/2)*((accounts[index].charges_category[0])[catagory].fees.value),
                        'Existing_Interest_rate' : (accounts[index].charges_category[0])[catagory].intrest_rate.value,
                        'Offered_Interest_rate' : (1-customerValue/2)*((accounts[index].charges_category[0])[catagory].intrest_rate.value),
                        'Offer_Fees' : Math.round(customerValue * base_offer_fees),
                        'Offer_expiry_date' : '1'
                    };
                        (accounts[index])['customer_value'] = customerValue;
                    if(customerValue > customer_value_threshold){
                        (accounts[index])['offer'] = offer;
                    }
                    saveGeneratedOffers(accounts[index],db);
                    console.log(offer);
            });
        }
    };

    function getCustomerValue(accounts, index,callback) {
        var customerValue = null;
        var catagory = null;
        var max = 0;
        var catagory_count= {};
        var prod_count =  0;
        for (var trans_index = 0; trans_index < accounts[index].transactions.length; trans_index++) {
            //console.log(accounts[index].transactions[trans_index].transaction_id);

            if(catagory_count.hasOwnProperty(accounts[index].transactions[trans_index].category)){
                catagory_count[accounts[index].transactions[trans_index].category] += 1;
            }else{
                catagory_count[accounts[index].transactions[trans_index].category] = 1;
            }
        }

        for(key in catagory_count)
        {
            if(catagory_count[key] > max){
                catagory = key;
                max = catagory_count[key];
            }
        }

        for(key in accounts[index].bank_product[0]){
            if((accounts[index].bank_product[0])[key]){
                prod_count++;
            }
        }

        customerValue = ((prod_count/bank_prod_count) + (accounts[index].transactions.length / total_transact_count))/2;

        console.log(accounts[index].first_name + " " + accounts[index].last_name);
        console.log("Total Transactions - " + accounts[index].transactions.length);
        console.log(catagory_count);
        console.log("Catagory with higest num of trans - " + catagory);
        console.log(accounts[index].bank_product);
        console.log("Prod Count - " + prod_count);
        console.log("Customer Value - " + customerValue);

         callback(accounts,index,customerValue,catagory);
    }


    this.saveGeneratedOffers = function(account,db){
        var collection = db.collection('documents');
        collection.save(account);
    };
};