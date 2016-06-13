function vs_scraper_done(labels) {
    var ours = collectPriceData(labels);
    chrome.runtime.sendMessage({"vs_prices": ours, "url":window.location.href.substr(0, window.location.href.length-5) }, function(response) {
        alert("got a response");
    });
}