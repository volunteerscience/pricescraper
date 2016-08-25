var reportURL = "https://price.volunteerscience.com/reportPrice/";
var vs_url = "https://volunteerscience.com/";
/*var reportURL = "http://localhost:7677/reportPrice/";
var vs_url = "http://localhost:8000/";*/

var supportedSites = [{"site": "https://www.google.com/flights/", "script":"google-flights", "name": "Google Flights"},
                      {"site": "https://www.amazon.com/s/", "script":"amazon", "name": "Amazon"},
                      {"site": "https://www.priceline.com/stay/", "script":"priceline", "name": "Priceline"}];

/*function updateSiteList() {
    vsRequest("personalization/scraper_list/", {}, function(sites) {
        for(var i = 0; i < sites.length; i++) {
            sites[i].script = vs_url + 
                "personalization/get_scraper/?site=" + 
                encodeURIComponent(sites[i].name) +
                ".js";
        }
        supportedSites = sites;
        console.log(sites);
    });
}

function initSiteLoop() {
    updateSiteList();
    setInterval(updateSiteList, 5000);
}
initSiteLoop();*/

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var currURL = tab.url;
    
    if(!chrome.runtime.getManifest().debug) { // start in production mode
        for(var i = 0; i < supportedSites.length; i++) {
            if(currURL.indexOf(supportedSites[i].site) == 0) {
                (function() { // NOTE: Use of the let keyword here is highly preferable, but frustratingly not yet very well supported.
                    // is this site enabled?
                    var scriptInd = i; // this fires after the loop has terminated (should be let)
                    var siteName = supportedSites[scriptInd].name; // should be let
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
                })();
            }
        }                                        
    }
    else { // start in debug mode
        /*for(var i = 0; i < supportedSites.length; i++) {
            if(currURL.indexOf(supportedSites[i].site) == 0) {
                checkLogin();
                var scriptList = ["scripts/inject.js", "sites/" + supportedSites[i].script + "-inject.js"];
                injectContentScript(scriptList, 0, tabId, function () {});
                break;
            }
        }*/
        var scriptList = ["scripts/inject.js"];
        injectContentScript(scriptList, 0, tabId, function () {});
    }
});

function executeContentScripts(scriptInd, tabId) {
    var scriptList = [
        "scripts/marker.js", "css/bootstrap.css",  "css/overlay.css", "css/merge.css", "scripts/jquery.js", "scripts/bootstrap.js", "scripts/underscore.js", "scripts/parse.js",
        "scripts/sel.js", "scripts/beach.js", "scripts/process_data.js", "scripts/merge.js", "scripts/interface.js", /*supportedSites[scriptInd].script*/"sites/" + supportedSites[scriptInd].script + ".js"
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
    console.log(request);
    if (request.hasOwnProperty('vs_prices')) { // from the hook
        requestPriceCompare(request, sender.tab.id);
    }
    else if(request.hasOwnProperty('trigger_sandbox')) {
        var standardScripts = [
            "scripts/marker.js", "css/overlay.css", "css/merge.css", "scripts/jquery.js", "scripts/underscore.js", "scripts/parse.js",
            "scripts/sel.js", "scripts/beach.js", "scripts/process_data.js", "scripts/merge.js", "scripts/interface.js"
        ];
        var sandboxScripts = [
            "scripts/sandbox_marker.js", "css/smart_ui.css", "smart/smart_ui.js", "smart/smart_sel.js", "smart/lcss.js", "smart/start.js"
        ];
        
        var activeTab = chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var tabId = tabs[0].id;
            chrome.tabs.executeScript(tabId, {"file": "scripts/marker.js"}, function(res) {
                if(res[0] == true) {
                    injectContentScript(standardScripts, 0, tabId, function() {
                        console.log("successfully injected standard scripts");
                        injectSandboxScripts();
                    }); 
                }
                else {
                    injectSandboxScripts();
                }
                
                function injectSandboxScripts() {
                    chrome.tabs.executeScript(tabId, {"file": "scripts/sandbox_marker.js"}, function(res) {
                        if(res[0] == true) {
                            injectContentScript(sandboxScripts, 0, tabId, function() {
                                console.log("successfully injected sandbox scripts");
                            });
                        }
                        else {
                            chrome.tabs.executeScript(tabId, {"code": "vs_smart.initUI();"}, function() {
                                console.log("restarted sandbox"); 
                            });
                        }
                    });
                };
            });
        });
    }
    else if(request.hasOwnProperty('kill_sandbox')) {
        var activeTab = chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.executeScript(tabs[0].id, {"code": "vs_smart.disableUI();"}, function() {
                console.log("killed sandbox"); 
            });
        });
    }
    /*else if(request.hasOwnProperty('sandboxAction')) {
        var activeTab = chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
             chrome.tabs.sendMessage(tabs[0].id, request.data, function() {
                 alert("SENDING A MESSAGE BACK");
                 chrome.runtime.sendMessage({"hello":"world"}, function() {});
             });
        });
    }*/
    else if(request.hasOwnProperty('devtools')) {
        var tabId = sender.tab.id;
        if(tabId in connections) {
            console.log("returning messsage");
            connections[tabId].postMessage(request.data);
        } 
        else {
            console.log("Tab not found in connection list.");
        }
    }
    else if(request.hasOwnProperty('history')) {
        uploadHistory(request.history);
    }
    else if(request.hasOwnProperty('cookies')) {
        uploadCookies(request.cookies);
    }
});

function requestPriceCompare(data, tabID) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', reportURL);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.onload = function() {
        var response = xhttp.response;
        if(response.status == "success") {
            chrome.extension.getBackgroundPage().console.log("THEIRS");
            console.log(response.msg);
            console.log("OURS");
            console.log(data.vs_prices);
            sendBack(data.vs_prices, response.msg, data.labels, tabID);
        }
        else if(response.status == "fail") {
            chrome.tabs.sendMessage(tabID, {"merge": true, "status": "fail", "msg": "server timeout"}, function(response) {
                console.log(response);
            });
        }
    };
    xhttp.onerror = function() {
        chrome.tabs.sendMessage(tabID, {"merge": true, "status": "fail", "msg": "server error"}, function(response) {
            console.log(response);
        });
    }
    xhttp.send(JSON.stringify(data));
}

function checkLogin() {
    chrome.cookies.get({"url":vs_url, "name":"csrftoken"}, function(cookie) {
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', vs_url + '/personalization/manual_login/');
        xhttp.responseType = 'text';
        xhttp.setRequestHeader("X-CSRFToken", cookie.value);
        xhttp.onload = function() {
            var response = xhttp.response;
            console.log(response);
        };
        xhttp.send({"hello":"there"});
    });
}

function uploadHistory(data) {
    vsRequest("personalization/post_plugin_data/", {"data":data, "type":"History", "pid":213}, function() {
        console.log("thanks for donating your history");
    });
}

function uploadCookies(data) {
    vsRequest("personalization/post_plugin_data/", {"data":data, "type":"Cookies", "pid":213}, function() {
        console.log("thanks for donating your cookies");
    });
}

function vsRequest(url, data, cb) {
    chrome.cookies.get({"url":vs_url, "name":"csrftoken"}, function(cookie) {
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', vs_url + url);
        xhttp.responseType = 'json';
        xhttp.setRequestHeader("X-CSRFToken", cookie.value);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.responseType = 'json';
        xhttp.onload = function() {
            if(typeof cb == "function") {
                cb(xhttp.response);
            }
        };
        xhttp.send(JSON.stringify(data));
    });
}

function sendBack(ours, theirs, labels, tabID) {
    chrome.tabs.sendMessage(tabID, {"merge": true, "status": "success", "ours": ours, "theirs": theirs, "labels": labels}, function(response) {
        console.log(response);
    });
}

////////////////////////////////////////////
//// UGHHHHHH CHROME WHY ///////////////////
var connections = {};

chrome.runtime.onConnect.addListener(function (port) {
    var extensionListener = function (message, sender, sendResponse) {
        // The original connection event doesn't include the tab ID of the
        // DevTools page, so we need to send it explicitly.
        if(message.name == "init") {
            console.log("INIT SUCCESSFUL");
            connections[message.tabId] = port;
            return;
        }
        else if(message.name == "sandbox") {
            console.log("messaging tab");
            chrome.tabs.sendMessage(message.tabId, {"sandbox": message.data}, function() {});
        }
        // other message handling
    }

    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function (port) {
        port.onMessage.removeListener(extensionListener);
        var tabs = Object.keys(connections);
        for(var i = 0, len = tabs.length; i < len; i++) {
            chrome.tabs.executeScript(tabs[i].id, {"code": "vs_smart.disableUI();"}, function() {
                console.log("killed sandbox"); 
            });
            //chrome.tabs.sendMessage(message.tabId, {"sandbox": message.data}, function() {});
            if(connections[tabs[i]] == port) {
                delete connections[tabs[i]]
                break;
            }
        }
    });
});

// Receive message from content script and relay to the devTools page for the
// current tab
/*chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Messages from content scripts should have sender.tab set
    if(sender.tab) {
        var tabId = sender.tab.id;
        if(tabId in connections) {
            connections[tabId].postMessage(request);
        } 
        else {
            console.log("Tab not found in connection list.");
        }
    } 
    else {
        console.log("sender.tab not defined.");
    }
    return true;
});*/
