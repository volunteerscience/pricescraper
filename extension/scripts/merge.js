function merge(ours, theirs) {
    alert(ours.length + ", " + theirs.length);
    
    //theirs = theirs.splice(7);
    theirs.push(theirs[0]);
    theirs[theirs.length - 1].price = "$77.28";
    
    for(var i = 0; i < ours.length; i++) {
        var price_id = ours[i].price_id;
        var currPrice = $(".vs_price", "[price-id=" + price_id + "]");
        if(typeof ours[i].matches == "undefined")
            ours[i].matches = [];
        
        for(var j = 0; j < theirs.length; j++) {
            if(typeof theirs[j].matches == "undefined")
                theirs[j].matches = [];
            
            if(theirs[j].airline == ours[i].airline && theirs[j].duration == ours[i].duration && theirs[j].stops == ours[i].stops) {
                ours[i].matches.push(theirs[j]);
                theirs[j].matches.push(ours[i]);
            }
        }
    }
    
    for(var i = 0; i < ours.length; i++) {
        var price_id = ours[i].price_id;
        var currPrice = $(".vs_price", "[price-id=" + price_id + "]");
        //alert("# matches: " + ours[i].matches.length);
        
        if(ours[i].matches.length == 0) {
            currPrice.css("color", "red");
        }
        else if(ours[i].matches.length == 1) {
            currPrice.append("<br/><span style='color:blue'>" + ours[i].matches[0].price + "</span>");
        }
        else {
            // look through the matches for the closest price
        }
    }
}

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    if(typeof window.merge_called == "undefined") {
        window.merge_called = true;
        merge(request.ours, request.theirs);
    }
});