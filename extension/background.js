var reportURL = "http://localhost:7677/reportPrice/";
var supportedSites = [{"site": "https://www.google.com/flights/", "script":"google-flights"},
                      {"site": "https://www.amazon.com/s/", "script":"amazon"}];

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var currURL = tab.url;
    
    if(!chrome.runtime.getManifest().debug) { // start in production mode
        for(var i = 0; i < supportedSites.length; i++) {
            if(currURL.indexOf(supportedSites[i].site) == 0) {
                chrome.tabs.executeScript(tabId, {"file": "scripts/jquery.js"});
                chrome.tabs.executeScript(tabId, {"file": "scripts/underscore.js"});
                chrome.tabs.executeScript(tabId, {"file": "scripts/sel.js"});
                chrome.tabs.executeScript(tabId, {"file": "scripts/process_data.js"});
                chrome.tabs.executeScript(tabId, {"file": "scripts/merge.js"});
                chrome.tabs.executeScript(tabId, {"file": "sites/" + supportedSites[i].script + ".js"});
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

// receive messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.hasOwnProperty('vs_prices')) { // from the hook
        //alert("labels: " + request.labels.mandatory_labels[0]);
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
        sendBack(data.vs_prices, response, data.labels, tabID);
    };
    xhttp.send(JSON.stringify(data));
}

function sendBack(ours, theirs, labels, tabID) {
    chrome.tabs.sendMessage(tabID, {ours: ours, theirs: theirs, labels: labels}, function(response) {
        console.log(response);
    });
}