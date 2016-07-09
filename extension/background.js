var reportURL = "http://localhost:7677/reportPrice/";
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
                        executeContentScripts(scriptInd, tabId);
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
    chrome.tabs.executeScript(tabId, {"file": "scripts/jquery.js"}, function() {
        chrome.tabs.insertCSS(tabId, {"file": "css/bootstrap.css"}, function() {
            
            chrome.tabs.insertCSS(tabId, {"file": "css/overlay.css"});
            chrome.tabs.executeScript(tabId, {"file": "scripts/bootstrap.js"}, function() {
                chrome.tabs.executeScript(tabId, {"file": "scripts/underscore.js"});
                chrome.tabs.executeScript(tabId, {"file": "scripts/parse.js"});
                chrome.tabs.executeScript(tabId, {"file": "scripts/sel.js"});
                chrome.tabs.executeScript(tabId, {"file": "scripts/beach.js"}); // experimental
                chrome.tabs.executeScript(tabId, {"file": "scripts/process_data.js"});
                chrome.tabs.executeScript(tabId, {"file": "scripts/merge.js"});

                chrome.tabs.executeScript(tabId, {"file": "scripts/interface.js"});

                chrome.tabs.executeScript(tabId, {"file": "sites/" + supportedSites[scriptInd].script + ".js"});
            }); 
            //updatePopup();
        });
    });
}

/*function updatePopup() {
    alert("trying to change the popup");
    var views = chrome.extension.getViews({type: "popup"});
    for (var i = 0; i < views.length; i++) {
        views[i].document.getElementById('awesome').innerHTML="Sexy";
    }
}*/

// receive messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.hasOwnProperty('vs_prices')) { // from the hook
        //alert("labels: " + request.labels.mandatory_labels[0]);
        console.log("HERE IS THE REQUEST");
        console.log(request);
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
        chrome.extension.getBackgroundPage().console.log('the result is');
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