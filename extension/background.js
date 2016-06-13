var reportURL = "http://localhost:7677/reportPrice/";

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf("https://www.google.com/flights/") == 0) {
        chrome.tabs.executeScript(tabId, {"file": "scripts/jquery.js"});
        chrome.tabs.executeScript(tabId, {"file": "scripts/underscore.js"});
        chrome.tabs.executeScript(tabId, {"file": "scripts/sel.js"});
        chrome.tabs.executeScript(tabId, {"file": "scripts/process_data.js"});
        chrome.tabs.executeScript(tabId, {"file": "scripts/merge.js"});
        chrome.tabs.executeScript(tabId, {"file": "sites/google-flights.js"});
    }
});

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
        chrome.extension.getBackgroundPage().console.log('the result is');
        console.log(response);
        sendBack(data.vs_prices, response, tabID);
    };
    xhttp.send(JSON.stringify(data));
}

function sendBack(ours, theirs, tabID) {
    chrome.tabs.sendMessage(tabID, {ours: ours, theirs: theirs}, function(response) {
        console.log(response);
    });
}