var reportURL = "https://price.volunteerscience.com/reportPrice/";
var supportedSites = [{"site": "https://www.google.com/flights/", "script":"google-flights", "name": "Google Flights"},
                      {"site": "https://www.amazon.com/s/", "script":"amazon", "name": "Amazon"},
                      {"site": "https://www.priceline.com/stay/", "script":"priceline", "name": "Priceline"}];

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var currURL = tab.url;
    
    if(!chrome.runtime.getManifest().debug) { // start in production mode
        for(var i = 0; i < supportedSites.length; i++) {
            if(currURL.indexOf(supportedSites[i].site) == 0) {
                // is this site enabled?
                let scriptInd = i; // this fires after the loop has terminated
                let siteName = supportedSites[scriptInd].name;
                chrome.storage.local.get(siteName, function(obj) {
                    if(typeof obj[siteName] == "undefined" || (typeof obj[siteName] != "undefined" && obj[siteName] == "enabled")) {
                        //executeContentScripts(scriptInd, tabId);
                        chrome.tabs.executeScript(tabId, {"file": "scripts/marker.js"}, function(res) {
                            if(res[0] == true) {
                                executeContentScripts(scriptInd, tabId);
                            }
                        });
                    }
                });
            }
        }                                        
    }
    else { // start in debug mode
        for(var i = 0; i < supportedSites.length; i++) {
            if(currURL.indexOf(supportedSites[i].site) == 0) {
                chrome.tabs.executeScript(tabId, {"file": "scripts/inject.js"});
                chrome.tabs.executeScript(tabId, {"file": "sites/" + supportedSites[i].script + "-inject.js"});
                break;
            }
        }
    }
});

function executeContentScripts(scriptInd, tabId) {
    var scriptList = [
        "scripts/marker.js", "css/bootstrap.css",  "css/overlay.css", "scripts/jquery.js", "scripts/bootstrap.js", "scripts/underscore.js", "scripts/parse.js",
        "scripts/sel.js", "scripts/beach.js", "scripts/process_data.js", "scripts/merge.js", "scripts/interface.js", "sites/" + supportedSites[scriptInd].script + ".js"
    ];
    injectContentScript(scriptList, 0, tabId, function() {
        console.log("script injection successful");
    });
}

function injectContentScript(list, ind, tabId, callback) { 
    if(ind < list.length) {
        if(list[ind].substr(-3) == "css") {
            chrome.tabs.insertCSS(tabId, {"file": list[ind]}, function() {
                injectContentScript(list, ind + 1, tabId);   
            });
        }
        else if(list[ind].substr(-2) == "js") {
            chrome.tabs.executeScript(tabId, {"file": list[ind]}, function() {
                injectContentScript(list, ind + 1, tabId); 
            });
        }

        if(ind == 0) {
            callback();
        }
    }
}

// receive messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.hasOwnProperty('vs_prices')) { // from the hook
        requestPriceCompare(request, sender.tab.id);
    }
});

function requestPriceCompare(data, tabID) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', reportURL);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.onload = function() {
        var response = xhttp.response;
        chrome.extension.getBackgroundPage().console.log("THEIRS");
        console.log(response);
        console.log("OURS");
        console.log(data.vs_prices);
        sendBack(data.vs_prices, response, data.labels, tabID);
    };
    xhttp.send(JSON.stringify(data));
}

function sendBack(ours, theirs, labels, tabID) {
    chrome.tabs.sendMessage(tabID, {ours: ours, theirs: theirs, labels: labels}, function(response) {
        console.log(response);
    });
}
