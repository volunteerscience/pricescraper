var jquery = document.createElement('script');
jquery.src = chrome.extension.getURL('scripts/jquery.js');
jquery.id = "injected_jquery";
document.body.appendChild(jquery);

var underscore = document.createElement('script');
underscore.src = chrome.extension.getURL('scripts/underscore.js');
underscore.id = "injected_underscore";
document.body.appendChild(underscore);

/*var sel = document.createElement('script');
sel.src = chrome.extension.getURL('scripts/sel.js');
sel.id = "injected_sel";
document.body.appendChild(sel);*/

/*if(document.getElementById("injected_googleFlights") === null) {
    var googleFlights = document.createElement('script');
    googleFlights.src = chrome.extension.getURL('sites/google-flights.js');
    googleFlights.id = "injected_googleFlights";
    document.body.appendChild(googleFlights);
}*/