require('dotenv').load();

var express = require('express');
var router = express.Router();

var mongojs = require('mongojs');
var db = mongojs('mongodb://admin:LNPTTVGJWYNUKCZH@bluemix-sandbox-dal-9-portal.0.dblayer.com:22689,bluemix-sandbox-dal-9-portal.4.dblayer.com:22689/admin?ssl=true');
//const util = require('util')


var Cloudant = require('cloudant');

var ConversationV1 = require('watson-developer-cloud/conversation/v1');

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
    username: process.env.CONVERSATION_USERNAME,//'5bb9874b-6bbd-4cdf-8dce-3af65fc7c3ef', // replace with username from service key
    password: process.env.CONVERSATION_PASSWORD,//'CTl81gp6BrVw', // replace with password from service key
    path: { workspace_id: process.env.WORKSPACE_ID }, // replace with workspace ID
    version_date: '2016-07-11'
});

//Initiate the cloudant variable
// Initialize Cloudant with settings from .env 
var username = process.env.cloudant_username || "nodejs";
var password = process.env.cloudant_password;

var cloudant = Cloudant({
    account:username, 
    password:password
    // plugin:'promises'
});

var cloudant_db = null;


//This would handle calls to the conversation api
router.get('/conversation', function(req, res, next) {
    conversation.message({}, function processResponse(err, response) {
        if (err) {
            res.send(err);
        } else {
            res.json(response);
        } 
    });
})

router.post('/postConversation', function(req, res, next) {
    var message = req.body.message;
    var context = req.body.context;

    conversation.message({ input: { text: message }, context : context},  function processResponse(err, response) {
        if (err) {
            res.send(err);
        } else {
            res.json(response);
        } 
    });
})

router.post('/saveParams', function(req, res, next) {
    var db_name = req.body.table_name;
    var params = req.body.data;

    cloudant.db.list(function(err, allDbs) {
        var db_exist =  allDbs.includes(db_name);

        if(db_exist) {
            //Database currently exists insert document into database
            insert_db = cloudant.db.use(db_name);
            insert_db.insert(params, function(err, body, header) {
                if (err) {
                    console.log('[alice.insert] ', err.message);
                }
                else {
                    res.json(body);
                }
            });
        } else {
            //create new database and insert into database
            cloudant.db.create(db_name, function(err, data) {
                if(err) console.log("error creating "+db_name);

                insert_db = cloudant.db.use(db_name);
                insert_db.insert(params, function(err, body, header) {
                    if (err) {
                        console.log('[alice.insert] ', err.message);
                    }
                    else {
                        res.json(body);
                    }
                });
            });
        }
    });
})

router.get('/bvn_validation/:id', function(req, res, next) {
    //check the cloudant database for any bvn like that
    bvn = req.params.id;
    accounts_table = cloudant.db.use('accounts');
    accounts_table.find({selector:{bvn:bvn}}, function(er, result) {
        if (er) {
            throw er;
        }

        if(result.docs.length > 0) {
            //BVN document was found and returned
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({bvn_found: true, data: result.docs[0]}));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({bvn_found: false}));
        }
    });
})


var doc_exists = function( id ) {
    this.head( id, function( err, body, header ) {
        if ( header[ 'status-code' ] == 200 )
            return true;
        else if ( err[ 'status-code' ] == 404 )
            return false;
        return false;
    });
}
module.exports = router;