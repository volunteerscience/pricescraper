//var showMoreFlights = [{"contents-1000":"[+lt]show"}, {"contents-1000":"[+lt]longer"}, {"contents-1000":"[+lt]expensive"}];
//var hideMoreFlights = [{"contents-1000":"[+lt]hide"}, {"contents-1000":"[+lt]longer"}, {"contents-1000":"[+lt]expensive"}];
//alert("launching wait");

/*waitFor(showMoreFlights, 1000, function(moreFlightsButton) {
    $(moreFlightsButton).trigger("click");
    waitFor(hideMoreFlights, 1000, flightsLoaded);
});*/

function flightsLoaded(lessFlightsButton) {
    var round = findElement([{"contents-20":"+round"}]);
    var prices = findElement([{"contents-20":"+$"}, {"sibling-":round}]);
    var superStruct = findSuperStructure(prices);
    
    var superfluous1 = findElement([{"contents-1000":"[+lt]similar"}], superStruct);
    var superfluous2 = findElement([{"contents-1000":"[+lt]date tip"}], superStruct);
    var superfluous = _.union(superfluous1, superfluous2);
    var usefulSuperStruct = _.difference(superStruct, superfluous);
    
    $(usefulSuperStruct).css("color", "green");
    
    $(superfluous).css("color", "red");
    $(superfluous).css("display", "none");
    
    
    tagDescriptors(usefulSuperStruct, [ 
                                        { "name":"duration", "desc":[{"contents-50":"+ – "}] },
                                        { "name":"stops", "desc":[{"contents-50":"+stop"}] },
                                        { "name":"airline", "desc":[{"sibling-":{"ref":"duration"}}, {"below-":{"ref":"duration"}}] }
                                                                                                                                        ]);
    
    return collectPriceData(["duration", "stops", "airline"]);
}

function collectPriceData(labels) {
    var prices = $(".vs_price");
    collective = [];
    
    for(var i = 0; i < prices.length; i++) {
        var price_id = $(prices[i]).attr("price-id");
        var matches = findElement([{"prop-price-id":"=" + price_id}]);
        
        var obj = {};
        obj["price"] = $(prices[i]).text();
            
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
    
    return collective;
}