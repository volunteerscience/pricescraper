/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
var myTab = null;

function getCurrentTab() {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
//    var url = tab.url;
    myTab = tab.id;
  });
}

function renderStatus(statusText) {
//  document.getElementById('status').textContent = statusText;
}


$(function(){
  $('body').on('click', 'a', function(){
    // set the current tab
    chrome.tabs.update(myTab, {url: $(this).attr('href')});
    
    // create a new tab
//    chrome.tabs.create({url: $(this).attr('href')});
    
    window.close();
    return false;
  });
});

document.addEventListener('DOMContentLoaded', function() {
  console.log("VS popup loaded");
  getCurrentTab();
});