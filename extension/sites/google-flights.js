if(typeof window.google_flights == "undefined") {
    window.google_flights = true;
    
    var showMoreFlights = [{"contents-1000":"[+lt]show"}, {"contents-1000":"[+lt]longer"}, {"contents-1000":"[+lt]expensive"}];
    var hideMoreFlights = [{"contents-1000":"[+lt]hide"}, {"contents-1000":"[+lt]longer"}, {"contents-1000":"[+lt]expensive"}];
    alert("launching wait");

    waitFor(showMoreFlights, 1000, function(moreFlightsButton) {
        $(moreFlightsButton).trigger("click");
        waitFor(hideMoreFlights, 1000, flightsLoaded);
    });
}

function flightsLoaded(lessFlightsButton, done) {
    var round = findElement([{"contents-20":"+round"}]);
    var prices = findElement([{"contents-20":"+$"}, {"sibling-":round}]);
    var superStruct = findSuperStructure(prices);
    
    var superfluous1 = findElement([{"contents-1000":"[+lt]similar"}], superStruct);
    var superfluous2 = findElement([{"contents-1000":"[+lt]date tip"}], superStruct);
    var superfluous = _.union(superfluous1, superfluous2);
    var usefulSuperStruct = _.difference(superStruct, superfluous);
    
    $(usefulSuperStruct).css("color", "green");
    
    /* STYLE THE SUPERFLUOUS ELEMENTS */
    $(superfluous).css("color", "red");
    $(superfluous).css("display", "none");
    
    
    tagDescriptors(usefulSuperStruct, [ 
                                        { "name":"duration", "desc":[{"contents-50":"+ – "}] },
                                        { "name":"stops", "desc":[{"contents-50":"+stop"}] },
                                        { "name":"airline", "desc":[{"sibling-":{"ref":"duration"}}, {"below-":{"ref":"duration"}}] }
                                                                                                                                        ]);
    
    collectPriceData(["duration", "stops", "airline"]);
}

function collectPriceData(labels) {
    alert("collectiong price data");
    var prices = $(".vs_price");
    collective = [];
    
    for(var i = 0; i < prices.length; i++) {
        var price_id = $(prices[i]).attr("price-id");
        var matches = findElement([{"prop-price-id":"=" + price_id}]);
        
        var obj = {};
        obj["price"] = $(prices[i]).text();
        obj["price_id"] = price_id;
            
        var foundAll = true;
        for(var l = 0; l < labels.length; l++) {
            var label = "vs_" + labels[l]; 
            var info = $("." + label, matches);
            if(info.length == 1) {
                obj[labels[l]] = info.text();
            }
            else {
                foundAll = false;
                break;
            }
        }
        if(foundAll) {
            collective.push(obj);
        }
    }
    
    var vs_prices = [ {"name":"Apple","price":"1.55"} ];
    chrome.runtime.sendMessage({"vs_prices": collective, "url":window.location.href.substr(0, window.location.href.length-5) }, function(response) {
        alert(response);
    });
    
    return collective;
}

function merge(data) {
    var theirs = jQuery.parseJSON(data);
    var ours = collective;
    //alert("length is: " + ours.length);
    for(var i = 0; i < ours.length; i++) {
        var price_id = ours[i].price_id;
        //alert(price_id);
        var currPrice = $(".vs_price", "[price-id=" + price_id + "]");
        //currPrice.append("<br/>$95");
        
        for(var j = 0; j < theirs.length; j++) {
            if(theirs[j].airline == ours[i].airline &&
              theirs[j].duration == ours[i].duration &&
               theirs[j].stops == ours[i].stops) {
                currPrice.append("<br/><span style='color:blue'>" + theirs[j].price + "</span>");
                break;
                //alert(theirs[j].price);
            }
        }
        /*if(i < theirs.length) {
            var newPrice = theirs[i].price;
        }*/
    }
}

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    /*if (request.greeting == "hello")
        sendResponse({farewell: "goodbye"});*/
    var data = request.data;
    sendResponse("I got the data");
    if(typeof window.merge_called == "undefined") {
        merge(data);
        window.merge_called = true;
    }
});