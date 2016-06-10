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
    //console.log(req.body);
    //console.log('  Foo: ' + req.body.foo);
    console.log("coming from: " + req.body.url);
    scrape(res, req.body.url);
    //res.send(JSON.stringify({'success':'nifty'}));
});

//Lets start our app
app.listen(PORT, function() {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

function scrape(result, url) {
    console.log("scraping");
    var page = new Horseman();

    page
        .open(/*'https://www.google.com/flights/#search;f=BOS;t=JFK,EWR,LGA;d=2016-06-26;r=2016-06-30'*/url)
        .injectJs("scripts/underscore.js")
        .injectJs("scripts/sel.js")
        .injectJs("sites/google-flights.js")
        .evaluate(function(done) {
            var showMoreFlights = [{"contents-1000":"[+lt]show"}, {"contents-1000":"[+lt]longer"}, {"contents-1000":"[+lt]expensive"}];
            var hideMoreFlights = [{"contents-1000":"[+lt]hide"}, {"contents-1000":"[+lt]longer"}, {"contents-1000":"[+lt]expensive"}];
            //done();
            waitFor(showMoreFlights, 1000, function(moreFlightsButton) {
                //console.log("waiting");
                $(moreFlightsButton).trigger("click");
                waitFor(hideMoreFlights, 1000, function(lessFlightsButton) {
                    var res = flightsLoaded(lessFlightsButton);
                    done(null, JSON.stringify(res)); 
                });
            });
        })
        .then(function(msg) {
            console.log("parsing complete");
            result.send(JSON.stringify(msg));
            //res.send(JSON.stringify({'success':'nifty'}));
            //console.log(msg);
            page
                .screenshot("test6.png")
                .close();
        });
}