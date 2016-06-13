var http = require('http');
var express = require('express');
var bodyParser = require("body-parser");
var Horseman = require('node-horseman');

var app = express();

//Lets define a port we want to listen to
const PORT=7677; 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static('static'));

app.get('/test', function (req, res) {
    console.log("OH YEAH");
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

function scrape(result, url) {
    console.log("scraping");
    var page = new Horseman({'timeout':15000});

    page
        .open(/*'https://www.google.com/flights/#search;f=BOS;t=JFK,EWR,LGA;d=2016-06-26;r=2016-06-30'*/url)
        .injectJs("scripts/underscore.js")
        .injectJs("scripts/sel.js")
        .injectJs("scripts/process_data.js")
        .injectJs("sites/google-flights.js")
        .evaluate(function(done) {
            vs_init();
            var checkInt = setInterval(function() {
                if(getVSData() != null) {
                    clearInterval(checkInt);
                    done(null, getVSData());
                }
            }, 500);
        })
        .then(function(msg) {
            //console.log("HELLO WORLD");
            //console.log(msg);
            console.log("parsing complete");
            result.send(JSON.stringify(msg));
            //res.send(JSON.stringify({'success':'nifty'}));
            //console.log(msg);
            page
                .screenshot("test6.png")
                .close();
        });
}