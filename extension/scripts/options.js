var chromeHistory = null;
var chromeCookies = null;

document.addEventListener('DOMContentLoaded', function () {
    init();
});

function init() {
    collectHistory();
    collectCookies();
    
    $("#donateButton").click(function() {
        if($("#historyCheckbox").prop("checked")) {
            chrome.runtime.sendMessage({"history": chromeHistory}, function(response) {});
        }
        if($("#cookieCheckbox").prop("checked")) {
            alert("Donating cookies!");
            chrome.runtime.sendMessage({"cookies": chromeCookies}, function(response) {});
        }
    });
}

function collectHistory() {
    chrome.history.search({text:"", startTime:0, maxResults:2147483647}, function fetched(results) {
        chromeHistory = results;
        $("#historyNum").text(chromeHistory.length);
    });
}

function collectCookies() {
    chrome.cookies.getAll({}, function(results) {
        chromeCookies = results;
        $("#cookieNum").text(chromeCookies.length);
    });
}