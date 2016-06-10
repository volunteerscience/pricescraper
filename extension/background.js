var reportURL = "http://localhost:7677/reportPrice/";

var tabToSearchId = {} // tabId -> search_id
var priceStore = {} // search_id -> col_name -> [ {name, price} ] 
var globalTabId = null;

// detect compatible page by url, inject hook
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf("https://www.google.com/flights/") == 0) {
        globalTabId = tabId;
        //chrome.extension.getBackgroundPage().console.log('hey there wassup');
        chrome.tabs.executeScript(tabId, {"file": "scripts/jquery.js"});
        chrome.tabs.executeScript(tabId, {"file": "scripts/underscore.js"});
        chrome.tabs.executeScript(tabId, {"file": "scripts/sel.js"});
        chrome.tabs.executeScript(tabId, {"file": "scripts/inject.js"});
        chrome.tabs.executeScript(tabId, {"file": "sites/google-flights.js"});
    }
});

// receive messages
chrome.runtime.onMessage.addListener(function(request, sendResponse) {
    if (request.hasOwnProperty('vs_prices')) { // from the hook
        //requestPriceCompare(request['vs_prices']);
        requestPriceCompare(request);
        
        //sendResponse({success: "true"});        
        //return;
    }
});

function requestPriceCompare(data) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', reportURL);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.onload = function() {
        // Parse and process the response from Google Image Search.
        var response = xhttp.response;
        //console.log("super cool");
        //resp(response);
        chrome.extension.getBackgroundPage().console.log('the result is');
        console.log(response);
        sendBack(response);
    };
    xhttp.send(JSON.stringify(data));
}

function sendBack(msg) {
    chrome.tabs.sendMessage(globalTabId, {data: msg}, function(response) {
        console.log(response);
    });
}