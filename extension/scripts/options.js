document.addEventListener('DOMContentLoaded', function () {
    init();
});

function init() {
    setLabels();
    checkPermissions();
    
    $("#donateButton").click(function() {
        chrome.storage.local.set({"history_allowed": $("#historyCheckbox").prop("checked")});
        chrome.storage.local.set({"cookies_allowed": $("#cookieCheckbox").prop("checked")});
        
        if($("#historyCheckbox").prop("checked")) {
            chrome.runtime.sendMessage({"history": true}, function(response) {});
        }
        if($("#cookieCheckbox").prop("checked")) {
            chrome.runtime.sendMessage({"cookies": true}, function(response) {});
        }
    });
    
    $("#learnTab").click(function() {
        showDocs();
    });
    $("#manageTab").click(function() {
        showDonate();
    });
    $("#surveyTab").click(function() {
        showSurvey();
    });
}

function checkPermissions() {
    chrome.storage.local.get("history_allowed", function(obj) {
        if(typeof obj["history_allowed"] != "undefined" && obj["history_allowed"] == true) {
            $("#historyCheckbox").prop("checked", true);
            $("#donateButton").text("Update");
        }
    });
    
    chrome.storage.local.get("cookies_allowed", function(obj) {
        if(typeof obj["cookies_allowed"] && obj["cookies_allowed"] == true) {
            $("#cookieCheckbox").prop("checked", true);
            $("#donateButton").text("Update");
        }
    });
}

function setLabels() {
    chrome.history.search({text:"", startTime:0, maxResults:(Math.pow(2, 31) - 1)}, function fetched(results) {
        $("#historyNum").text(results.length);
    });
    
    chrome.cookies.getAll({}, function(results) {
        $("#cookieNum").text(results.length);
    });
}

function showDonate() {
    $(".activeTab").hide();
    $(".active").removeClass("active");
    $(".activeTab").removeClass("activeTab");
    $("#manageTab").addClass("active");

    $(".donate").show();
    $(".donate").addClass("activeTab");
}

function showDocs() {
    $(".activeTab").hide();
    $(".active").removeClass("active");
    $(".activeTab").removeClass("activeTab");
    $("#learnTab").addClass("active");

    $(".docs").show();
    $(".docs").addClass("activeTab");
}

function showSurvey() {
    $(".activeTab").hide();
    $(".active").removeClass("active");
    $(".activeTab").removeClass("activeTab");
    $("#surveyTab").addClass("active");

    $(".survey").show();
    $(".survey").addClass("activeTab");
}

window.onload = function() {
    var hash = window.location.hash;
    if(hash == "#manage") {
        showDonate();
    }
    else if(hash == "#learn") {
        showDocs();
    }
    else if(hash == "#survey") {
        showSurvey();    
    }
}