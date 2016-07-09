if(typeof window.vs_scripts == "undefined") {
   
    window.vs_scripts = true;
    
    alert("INJECTING");
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
    
    var merge = document.createElement('script');
    merge.src = chrome.extension.getURL('scripts/merge.js');
    merge.id = "injected_merge";
    document.body.appendChild(merge);

    var beach = document.createElement('script');
    beach.src = chrome.extension.getURL('scripts/beach.js');
    beach.id = "injected_beach";
    document.body.appendChild(beach);

    var debug = document.createElement('script');
    debug.src = chrome.extension.getURL('scripts/parse.js');
    debug.id = "injected_parse";
    document.body.appendChild(debug);

    var debug = document.createElement('script');
    debug.src = chrome.extension.getURL('scripts/client_debug.js');
    debug.id = "injected_debug";
    document.body.appendChild(debug);
}