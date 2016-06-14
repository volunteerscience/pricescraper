// mandatory labels []
// data labels []
function vs_scraper_done(labels, params_blacklist) {
    var ours = collectPriceData(labels);
    var url = window.location.href;
    if(typeof params_blacklist != "undefined") {
        for(var i = 0; i < params_blacklist.length; i++) {
            //alert("blacklist: " + params_blacklist[i]);
            var reg = new RegExp(params_blacklist[i] + "=[^&;]*");
            url = url.replace(reg, "");
        }
    }
    //window.location.href.substr(0, window.location.href.length-5)
    chrome.runtime.sendMessage({"vs_prices": ours, "labels": labels, "url":url }, function(response) {
        alert("got a response");
    });
}