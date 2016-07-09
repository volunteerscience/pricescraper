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

/*var supportedSites = [{"site": "https://www.google.com/flights/", "script":"google-flights"},
                      {"site": "https://www.amazon.com/s/", "script":"amazon"}];*/

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
        .open(url)
        .injectJs("scripts/underscore.js")
        .injectJs("scripts/sel.js")
        .injectJs("scripts/parse.js")
        .injectJs("scripts/beach.js")
        .injectJs("scripts/process_data.js")
        .injectJs("sites/" + scraperScript + ".js")
        .evaluate(function(done) {
            vs_init();
            var checkInt = setInterval(function() {
                if(getVSData() != null) {
                    clearInterval(checkInt);
                    done(null, getVSData());
                }
            }, 500);
        
            //var nifty = findElement([{"contents-1000":"[+lt]show"}, {"contents-1000":"[+lt]longer"}, {"contents-1000":"[+lt]expensive"}]);
            //done(null, nifty.length);
        })
        .then(function(msg) {
            //console.log("LENGTH: " + msg);
            console.log("parsing complete");
            result.send(JSON.stringify(msg));
            page
                .screenshot("test6.png")
                .close();
        });
}

//scrape(null, "https://www.google.com/flights/#search;f=BOS;t=JFK,EWR,LGA;d=2016-07-24;r=2016-07-28;")