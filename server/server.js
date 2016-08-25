var http = require('http');
var express = require('express');
var bodyParser = require("body-parser");
var Horseman = require('node-horseman');
//var mongodb = require('mongodb');
//
//var MongoClient = mongodb.MongoClient;

var app = express();

//Lets define a port we want to listen to
const PORT=7677; 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static('static'));

app.get('/test', function (req, res) {
    res.send('PriceCompare Path: ' + req.url);
});

app.post('/reportPrice', function (req, res) {
    console.log('Report Price: ' + req.url);
    console.log("coming from: " + req.body.url);
    scrape(res, req.body.url);
});

//Lets start our app
app.listen(PORT, function() {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

//var mongoURL = 'mongodb://localhost:27017/db';
//// Use connect method to connect to the Server
//MongoClient.connect(mongoURL, function (err, db) {
//    if(err) {
//        console.log('Unable to connect to the mongoDB server. Error:', err);
//    }
//    else {
//        //Hooray!! We are connected. :)
//        console.log('Connection established to', mongoURL);
//
//        // do some work here with the database.
//        
//
//        //Close connection
//        db.close();
//    }
//});

var supportedSites = [{"site": "https://www.google.com/flights/", "script":"google-flights", "name": "Google Flights"},
                      {"site": "https://www.amazon.com/s/", "script":"amazon", "name": "Amazon"},
                      {"site": "https://www.priceline.com/stay/", "script":"priceline", "name": "Priceline"}];

function scrape(result, url) {
    var scraperScript = null;
    for(var i = 0; i < supportedSites.length; i++) {
        if(url.indexOf(supportedSites[i].site) == 0) {
            scraperScript = supportedSites[i].script;
            break;
        }
    }
    if(scraperScript == null) {
        console.log("scrape failed because site unsupported");
        return;
    }
    
    console.log("scraping");
    var page = new Horseman({'timeout':30000});
    
    page
        .on("timeout", function(msg) {
            console.log("timeout");
            result.send(JSON.stringify({"status": "fail"}));   
        })
        .open(url)
        .injectJs("scripts/underscore.js")
        .injectJs("scripts/sel.js")
        .injectJs("scripts/parse.js")
        .injectJs("scripts/beach.js")
        .injectJs("scripts/process_data.js")
        .injectJs("sites/" + scraperScript + ".js")
        .evaluate(function(done) {
            try {
                vs_init();
                var checkInt = setInterval(function() {
                    if(getVSData() != null) {
                        clearInterval(checkInt);
                        done(null, getVSData());
                    }
                }, 500);
            }
            catch(err) {
                // do nothing, just wait
                // strike that, switch to a better library
            }
        })
        .then(function(msg) {
            //console.log("LENGTH: " + msg);
            console.log("parsing complete");
            result.send(JSON.stringify({"status": "success", "msg": msg}));
            page
                .screenshot("test7.png")
                .close();
        });
}