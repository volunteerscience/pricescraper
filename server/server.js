var http = require('http');
var express = require('express');
var bodyParser = require("body-parser");
var Horseman = require('node-horseman');
var fs = require('fs');

var app = express();

//Lets define a port we want to listen to
const PORT=80; 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static('static'));

app.get('/health', function (req, res) {
  console.log("/health");
  res.send('success');
});


app.get('/test', function (req, res) {
    res.send('PriceCompare Path: ' + req.url);
});

app.post('/reportPrice', function (req, res) {
    console.log('Report Price: ' + req.url);
    console.log("Version: " + req.body.version);
    console.log("coming from: " + req.body.url);
    scrape(res, req.body.url, req.body.version);
});

//Lets start our app
app.listen(PORT, function() {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

var supportedSites = [
    {"base_url": ["^https://www.google.com/flights/"], "trigger_url": ["^https://www.google.com/flights/#search"], "name": "Google Flights", "script": "google-flights"},
    {"base_url": ["^https://www.amazon.com/"], "trigger_url": ["^https://www.amazon.com/s/"], "name": "Amazon", "script": "amazon"},
    {"base_url": ["^https://www.priceline.com/"], "trigger_url": ["^https://www.priceline.com/stay/#/search/"], "name": "Priceline", "script": "priceline"}
];

// url
// type is one of 'base_url' or 'trigger_url'
function checkSupport(url, type) {
    for(var i = 0; i < supportedSites.length; i++) {
        for(var j = 0; j < supportedSites[i][type].length; j++) {
            var patt = new RegExp(supportedSites[i][type][j]);
            if(patt.test(url)) {
                return {"status": true, "name": supportedSites[i].name, "script": supportedSites[i].script};
            }
        }
    }
    
    return {"status": false};
}

function scrape(result, url, version) {
    var scraperScript = null;
    var support = checkSupport(url, "trigger_url");
    if(support.status) {
        scraperScript = support.script;
        fs.stat("sites/" + scraperScript + "_" + version + ".js", function(err, stats) {
           if(err == null) {
               loadPage(result, url, scraperScript + "_" + version);
           } 
           else {
               console.log("unsupported site");
               console.log(err);
               result.send(JSON.stringify({"status": "fail", "msg": "Plugin out of date."}));
               return;
           }
        });
    }
}

function loadPage(result, url, scraperScript) {
    if(scraperScript == null) {
        console.log("scrape failed because site unsupported");
        result.send(JSON.stringify({"status": "fail", "msg": "Unsupported site."}));
        return;
    }
    
    console.log("scraping");
    var page = new Horseman({'timeout':30000});
    
    page
        .on("timeout", function(msg) {
            console.log("timeout");
            result.send(JSON.stringify({"status": "fail", "msg": "Server timed out :("}));   
        })
        .on('consoleMessage', function( msg ){
            //console.log(msg);
        })
        .on('error', console.error)
        .open(url)
        .status()
        .then(function (statusCode) {
            if (Number(statusCode) >= 400) {
                result.send(JSON.stringify({"status": "fail", "msg": "Couldn't load page..."}));
                page.close();
                return;
            } 
            else {
                console.log("Page loaded....");
            }
        })
        .catch(function (err) {
            console.log('Error: ', err);
            result.send(JSON.stringify({"status": "fail", "msg": "Network error, aborting"}));
            page.close();
            return;
        })
        .injectJs("scripts/underscore.js")
        .injectJs("scripts/sel.js")
        .injectJs("scripts/extra.js")
        .injectJs("scripts/parse.js")
        .injectJs("scripts/beach.js")
        .injectJs("scripts/process_data.js")
        .injectJs("sites/" + scraperScript + ".js")
        .evaluate(function(done) {
            console.log("starting");
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
                .screenshot("test8.png")
                .close();
        });
}
