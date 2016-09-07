//var reportURL = "https://price.volunteerscience.com/reportPrice/";
//var vs_url = "https://volunteerscience.com/";
var reportURL = "http://localhost:7677/reportPrice/";
var vs_url = "http://localhost:8000/";

/*var supportedSites = [{"site": "https://www.google.com/flights/#search", "script":"google-flights", "name": "Google Flights"},
                      {"site": "https://www.amazon.com/s/", "script":"amazon", "name": "Amazon"},
                      {"site": "https://www.priceline.com/stay/", "script":"priceline", "name": "Priceline"}];*/

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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var currURL = tab.url;
    
    if(!chrome.runtime.getManifest().debug) { // start in production mode
        var matchStatus = checkSupport(currURL, "trigger_url");
        if(matchStatus.status) {
            (function() { // NOTE: Use of the let keyword here is highly preferable, but frustratingly not yet very well supported.
                // is this site enabled?
                var scriptName = matchStatus.script; // this fires after the loop has terminated (should be let)
                var siteName = matchStatus.name; // should be let
                chrome.storage.local.get(siteName, function(obj) {
                    if(typeof obj[siteName] == "undefined" || (typeof obj[siteName] != "undefined" && obj[siteName] == "enabled")) {
                        chrome.tabs.executeScript(tabId, {"file": "scripts/marker.js"}, function(res) {
                            if(res[0] == true) {
                                //console.log("injecting scripts for " + siteName);
                                executeContentScripts(scriptName, tabId);
                            }
                        });
                    }
                });
            })();
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

// PUT THIS BACK FOR COOKIES AND HISTORY
var timedelta = 24;
uploadCookies();
cookieInterval = setInterval(uploadCookies, 60 * 30 * 1000); // check if we need to update once every 30 minutes
uploadHistory();
uploadInterval = setInterval(uploadHistory, 60 * 30 * 1000); // check if we need to update once every 30 minutes

function executeContentScripts(scriptName, tabId) {
    //console.log("sites/" + scriptName.script + ".js");
    var scriptList = [
        "scripts/marker.js", /*"css/bootstrap.css",*/  "css/overlay.css", "css/merge.css", "scripts/jquery.js", "scripts/bootstrap.js", "scripts/underscore.js", "scripts/extra.js", "scripts/parse.js",
        "scripts/sel.js", "scripts/beach.js", "scripts/process_data.js", "scripts/merge.js", "scripts/interface.js", "sites/" + scriptName + ".js"
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
    //console.log(request);
    if (request.hasOwnProperty('vs_prices')) { // from the hook
        requestPriceCompare(request, sender.tab.id);
    }
    else if(request.hasOwnProperty('trigger_sandbox')) {
        var standardScripts = [
            "scripts/marker.js", "css/overlay.css", "css/merge.css", "scripts/jquery.js", "scripts/underscore.js", "scripts/extra.js", "scripts/parse.js",
            "scripts/sel.js", "scripts/beach.js", "scripts/process_data.js", "scripts/merge.js", "scripts/interface.js"
        ];
        var sandboxScripts = [
            "scripts/sandbox_marker.js", "css/smart_ui.css", "smart/smart_ui.js", "smart/smart_sel.js", "smart/lcss.js", "smart/start.js"
        ];
        
        //var activeTab = chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            //var tabId = tabs[0].id;
            var tabId = request.tab_id;
            chrome.tabs.executeScript(tabId, {"file": "scripts/marker.js"}, function(res) {
                if(res[0] == true) {
                    injectContentScript(standardScripts, 0, tabId, function() {
                        //console.log("successfully injected standard scripts");
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
                            console.log("hopefully vs_smart is defined 149");
                            chrome.tabs.executeScript(tabId, {"code": "vs_smart.initUI();"}, function() {
                                console.log("restarted sandbox"); 
                            });
                        }
                    });
                };
            });
        //});
    }
    else if(request.hasOwnProperty('kill_sandbox')) {
        //var activeTab = chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var tabId = request.tab_id;
            //console.log("hopefully vs_smart is defined 161");
            chrome.tabs.executeScript(tabId, {"code": "vs_smart.disableUI();"}, function() {
                console.log("killed sandbox"); 
            });
        //});
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
            //console.log("returning messsage");
            connections[tabId].postMessage(request.data);
        } 
        else {
            console.log("Tab not found in connection list.");
        }
    }
    else if(request.hasOwnProperty('history')) {
        uploadHistory();
    }
    else if(request.hasOwnProperty('cookies')) {
        uploadCookies();
    }
    else if(request.hasOwnProperty('query_support')) {
        var triggerSupport = checkSupport(request.currURL, "trigger_url");
        var baseSupport = checkSupport(request.currURL, "base_url");
        var supportObj = {"base_support": baseSupport.status, "trigger_support": triggerSupport.status};
        
        if(triggerSupport.status) {
            supportObj.name = triggerSupport.name;
            supportObj.script = triggerSupport.script;
        }
        else if(baseSupport.status) {
            supportObj.name = baseSupport.name;
            supportObj.script = baseSupport.script;
        }
        sendResponse(supportObj);
    }
    else if(request.hasOwnProperty('iframe_plugin')) {
        //alert("WE GOT A SCRAPE REQUEST FRIENDS:\n" + JSON.stringify(request));
        chrome.tabs.sendMessage(sender.tab.id, request, function(response) {});
    }
    else if(request.hasOwnProperty('plugin_iframe')) {
        //alert("SENDING DATA TO IFRAME");
        chrome.tabs.sendMessage(sender.tab.id, request, function(response) {});
    }
});

function requestPriceCompare(data, tabID) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', reportURL);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.onload = function() {
        var response = xhttp.response;
        if(response == null) {
            chrome.tabs.sendMessage(tabID, {"merge": true, "status": "fail", "msg": "server error"}, function(response) {
                console.log(response);
            });
        }
        else if(response.status == "success") {
            chrome.extension.getBackgroundPage().console.log("THEIRS");
            console.log(response.msg);
            console.log("OURS");
            console.log(data.vs_prices);
            sendBack(data.vs_prices, response.msg, data.labels, tabID);
        }
        else if(response.status == "fail") {
            var msg = "server timeout";
            if("msg" in response) {
                msg = response.msg;
            }
            chrome.tabs.sendMessage(tabID, {"merge": true, "status": "fail", "msg": msg}, function(response) {
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

function getPID(cb) {
    chrome.storage.local.get("plugin_id", function(obj) {
        if(typeof obj.plugin_id == "undefined") {
            pluginID = randomString(20);
            chrome.storage.local.set({"plugin_id": pluginID}, function() {
                cb(pluginID);
            });
        }
        else {
            pluginID = obj.plugin_id;
            cb(pluginID);
        }
    });
}

function uploadHistory() {
    console.log("uploading history......");
    chrome.storage.local.get("history_updated", function(obj) {
        var start = (typeof obj["history_updated"] == "undefined") ? 0 : obj["history_updated"];
        console.log("history last updated: " + start);
        if(Date.now() - start >= 60 * 60 * timedelta * 1000) {
            chrome.history.search({text:"", startTime:start, maxResults:(Math.pow(2, 31) - 1)}, function fetched(results) {
                var history = results;
                //console.log(history);
                getPID(function(pid) {
                    //console.log("pid is " + pid);
                    vsRequest("personalization/post_history/", {"data":history, "pid":pid, "start_date": start}, function(resp) {
                        console.log(resp);
                        if(resp != null && typeof resp != "undefined" && typeof resp.status != "undefined" && resp.status == "success") {
                            console.log("thanks for donating your history");
                            chrome.storage.local.set({"history_updated": Date.now()}, function() {});
                        }
                    });
                })
            });
        }
        else {
            console.log("your history has been updated recently");
        }
    });
}

function uploadCookies() {
    console.log("uploading cookies......");
    chrome.storage.local.get("cookies_updated", function(obj) {
        var start = (typeof obj["cookies_updated"] == "undefined") ? 0 : obj["cookies_updated"];
        console.log("cookies last updated: " + start);
        if(Date.now() - start >= 60 * 60 * timedelta * 1000) {
            chrome.cookies.getAll({}, function(results) {
                var cookies = results;
                //console.log(cookies);
                getPID(function(pid) {
                    vsRequest("personalization/post_cookies/", {"data":cookies, "pid":pid}, function(resp) {
                        console.log(resp);
                        if(resp != null && typeof resp != "undefined" && typeof resp.status != "undefined" && resp.status == "success") {
                            console.log("thanks for donating your cookies");
                            chrome.storage.local.set({"history_updated": Date.now()}, function() {});
                        }
                    });
                });
            });
        }
        else {
            console.log("your cookies have been updated recently");
        }
    });
}

function vsRequest(url, data, cb) {
    //chrome.cookies.get({"url":vs_url, "name":"csrftoken"}, function(cookie) {
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', vs_url + url);
        xhttp.responseType = 'json';
        //xhttp.setRequestHeader("X-CSRFToken", cookie.value);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.responseType = 'json';
        xhttp.onload = function() {
            if(typeof cb == "function") {
                cb(xhttp.response);
            }
        };
        xhttp.send(JSON.stringify(data));
        //console.log("sending post data");
    //});
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
            //console.log("INIT SUCCESSFUL");
            connections[message.tabId] = port;
            return;
        }
        else if(message.name == "sandbox") {
            //console.log("messaging tab");
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
            //console.log("hopefully vs_smart is defined 368");
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

function randomString(length) {
	var str = "";
	for(var i = 0; i < length; i++) {
		var charCode = 0;
		if(Math.random() < (26 / 36))
			charCode = Math.floor(Math.random() * 26) + 97;
		else
			charCode = Math.floor(Math.random() * 10) + 48;
			
		str += String.fromCharCode(charCode);
	}
	
	return str;
}