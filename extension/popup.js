/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
var currTab = null;
var supportedSites = [{"site": "https://www.google.com/flights", "script":"google-flights", "name": "Google Flights"},
                      {"site": "https://www.amazon.com", "script":"amazon", "name": "Amazon"},
                      {"site": "https://www.priceline.com", "script":"priceline", "name": "Priceline"}];

function getCurrentTab() {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true
        , currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        currTab = tabs[0];
        setTitle();
    });
}

var disableButton = $('<button type="button" class="btn btn-danger">Disable this site.</button>');
var enableButton = $('<button type="button" class="btn btn-success">Enable this site.</button>');

function setTitle() {
    var siteFound = false;
    for(var i = 0; i < supportedSites.length; i++) {
        if(currTab.url.indexOf(supportedSites[i].site) == 0) {
            siteFound = true;
            (function() {
                document.getElementById("title").innerHTML = supportedSites[i].name + ": supported site!";
            
                var siteName = supportedSites[i].name;
                chrome.storage.local.get(supportedSites[i].name, function(obj) {
                    if(typeof obj[siteName] == "undefined" || (typeof obj[siteName] != "undefined" && obj[siteName] == "enabled")) {
                        createDisableButton(siteName);
                    } 
                    else if(obj[siteName] == "disabled") {
                        createEnableButton(siteName);
                    }
                }); 
            })();
            break;
        }
    }
    
    // unsupported site
    if(!siteFound) {
        var sandboxButton = $('<button type="button" class="btn btn-success">Start Sandbox</button>');
        $("#toggleDisable").html(sandboxButton);
        sandboxButton.click(function() {
            startSandbox(); 
        });
    }
}

function startSandbox() {
    chrome.runtime.sendMessage({"trigger_sandbox": true}, function(response) {});
}

function createEnableButton(name) {
    var enableButton = $('<button type="button" class="btn btn-success">Enable this site.</button>');
    enableButton.click(function() {
        var obj = {};
        obj[name] = "enabled";
        chrome.storage.local.set(obj, function() {
            createDisableButton(name);
        });
    });
    $("#toggleDisable").html(enableButton);
}
                       
function createDisableButton(name) {
    var disableButton = $('<button type="button" class="btn btn-danger">Disable this site.</button>');
    disableButton.click(function() {
        var obj = {};
        obj[name] = "disabled";
        chrome.storage.local.set(obj, function() {
            createEnableButton(name);
        });
    });
    $("#toggleDisable").html(disableButton);
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("VS popup loaded");
    getCurrentTab();
});