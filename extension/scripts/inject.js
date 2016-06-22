//alert("INJECTING");

var jquery = document.createElement('script');
jquery.src = chrome.extension.getURL('scripts/jquery.js');
jquery.id = "injected_jquery";
document.body.appendChild(jquery);

var underscore = document.createElement('script');
underscore.src = chrome.extension.getURL('scripts/underscore.js');
underscore.id = "injected_underscore";
document.body.appendChild(underscore);

var sel = document.createElement('script');
sel.src = chrome.extension.getURL('scripts/sel.js');
sel.id = "injected_sel";
document.body.appendChild(sel);

var debug = document.createElement('script');
debug.src = chrome.extension.getURL('scripts/client_debug.js');
debug.id = "injected_debug";
document.body.appendChild(debug);

/*var scraper = document.createElement('script');
scraper.src = chrome.extension.getURL('sites/google-flights.js');
scraper.id = "injected_scraper";
document.body.appendChild(scraper);*/