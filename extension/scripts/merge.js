function getContainer(price_id) {
    return $(".vs_container").filter(function() { return (typeof $(this).attr("price-id") != "undefined" && $(this).attr("price-id") == price_id) })
}

function simAddPrice(prices, num) {
    var i = 0;
    var tags = ["airline", "duration", "stops"];
    
    while(i < num) {
//        alert("i: " + i + ", added a price");
        var selInd = Math.floor(Math.random() * prices.length);
        var newEntry = { "price": "$" + Math.floor(Math.random() * 500) };
        
        for(var x = 0; x < tags.length; x++) {
            var tag = tags[x];
            newEntry[tag] = randomString(prices[0][tag].length);
        }
        
        prices.splice(selInd, 0, newEntry);
        i++;
    }
}

function simRemovePrice(prices, num, client) {
    var i = 0;
    while(i < num && prices.length > 0) {
        var selInd = Math.floor(Math.random() * prices.length);
        
        if(client) {
            var price_id = prices[selInd].price_id;
            var cont = getContainer(price_id);
            //alert("conducting a removal " + cont.length);
            //cont.css("background-color", "green");
            cont.remove();
        }
        
        prices.splice(selInd, 1);
        i++;
    }
}

function simChangePrice(prices, num) {
    for(var i = 0; i < prices.length; i++) {
        var numPrice = resolvePrice(prices[i].price);
        var mult = Math.random() >= 0.5 ? 1 : -1;
        numPrice += 0.15 * numPrice * mult;
        var newPrice = "$" + numPrice;
        prices[i].price = newPrice;
    }
}

function resolvePrice(price) {
    price = price.replace("$", "");
    price = price.replace(",", "");
    price = price.replace(" ", "");
    price = price.trim();
    price = parseFloat(price);
    return price;
}
    
/* Generate a random string of LENGTH characters
* useful for matching participants across linked experiments
*/
function randomString(length)
{
	var str = "";
	for(var i = 0; i < length; i++)
	{
		var charCode = 0;
		if(Math.random() < (26 / 36))
			charCode = Math.floor(Math.random() * 26) + 97;
		else
			charCode = Math.floor(Math.random() * 10) + 48;
			
		str += String.fromCharCode(charCode);
	}
	
	return str;
}

function merge(ours, theirs, labels) {
    //alert("adding prices");
    simRemovePrice(ours, Math.floor(ours.length / 3), true);
//    alert(ours.length + ", " + theirs.length);
    //var allLabels = labels.mandatory_labels.concat(labels.data_labels);
    
    //theirs = theirs.splice(7);
    //theirs.push(theirs[0]);
    //theirs[theirs.length - 1].price = "$77.28";
    var bottomMostShown = -1;
    
    for(var i = 0; i < ours.length; i++) {
        var price_id = ours[i].price_id;
        var currPrice = $(".vs_price", "[price-id=" + price_id + "]");
        if(typeof ours[i].matches == "undefined")
            ours[i].matches = [];
        
        // does this one have all mandatory features?
        var hasAllLabels = true;
        for(var j = 0; j < labels.mandatory_labels.length; j++) {
            if(!(labels.mandatory_labels[j] in ours[i])) {
                hasAllLabels = false;
            }
        }
        if(hasAllLabels) {
            bottomMostShown = price_id;
        }
        
        for(var j = 0; j < theirs.length; j++) {
            if(typeof theirs[j].matches == "undefined")
                theirs[j].matches = [];
            
            var allMatch = true;
            for(var x = 0; x < labels.mandatory_labels.length; x++) {
                var currLabel = labels.mandatory_labels[x];
                //alert("currLabel: " + currLabel);
                if(theirs[j][currLabel] != ours[i][currLabel]) {
                    allMatch = false;
                    break;
                }
            }
            if(allMatch) {
                ours[i].matches.push(theirs[j]);
                theirs[j].matches.push(ours[i]);
            }
            /*if(theirs[j].airline == ours[i].airline && theirs[j].duration == ours[i].duration && theirs[j].stops == ours[i].stops) {
                ours[i].matches.push(theirs[j]);
                theirs[j].matches.push(ours[i]);
            }*/
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
            //look through the matches for the closest price
            alert("EXCELLENT - multplie copies of the same entry");
            var closestMatch = ours[i].matches[0];
            var oldDiff = Math.abs(resolvePrice(closestMatch.price) - resolvePrice(ours[i].price));
            for(var x = 1; x < ours[i].matches.length; x++) {
                var diff = Math.abs(resolvePrice(ours[i].matches[x].price) - resolvePrice(ours[i].price));
                if(diff < oldDiff) {
                    oldDiff = diff;
                    closestMatch = ours[i].matches[x];
                }
            }
            currPrice.append("<br/><span style='color:orange'>" + closestMatch.price + "</span>");
        }
    }
    
//    alert("INSERTING CLONED ELEMENTS");
    var lastContainer = $(getContainer(bottomMostShown));
    
    var clonePriceId = -1;
    for(var i = 0; i < theirs.length; i++) {
        if(theirs[i].matches.length == 0) {
            //alert("THIS ONE OCCURED ON THE SERVER BUT NOT ON THE CLIENT: " + bottomMostShown);
            var donor = cloneElement(theirs[i], ours);
            
            var clone = $(getContainer(donor.price_id)).clone();
            clone.attr("price-id", clonePriceId);
            //alert(clone.length + ", " + lastContainer.length);
            
            /*for(var x = 0; x < keys.length; x++) {
                alert(keys[x] + ": " + clone.attr(keys[x]));
            }*/
            
            clone.css("opacity", "0.5");
            lastContainer.append(clone);
            
            var vs_elems = findElement([{"class-":"+vs_"}], clone, true);
            $(vs_elems).attr("price-id", clonePriceId);
            
            var keys = Object.keys(theirs[i]);
            for(var x = 0; x < keys.length; x++) {
                var vs_elem = findElement([{"class-":"=vs_" + keys[x]}], vs_elems); 
                if(vs_elem.length == 1) {
                    //alert($(vs_elem).text());
                    //$(vs_elem).text(theirs[i][keys[x]]);
                    
                    if($(vs_elem).prop("tagName") == "IMG") {
                        $(vs_elem).attr("src", theirs[i][keys[x]]);
                    }
                    else {
                        $(vs_elem).text(theirs[i][keys[x]]);
                    }
                    
                }
            }
            //alert(vs_elems.length);
            
            clonePriceId--;
            //lastContainer = clone; // if we want to insert them sequentially
            //break;
        }
    }
}

function cloneElement(elem, donors) {
    var bestDonor = donors[0];
    var elemKeys = Object.keys(elem);
    
    for(var i = 0; i < donors.length; i++) {
        // loop through all the keys
        var donorKeys = Object.keys(donors[i]);
        var hasAllKeys = true;
        for(var k = 0; k < elemKeys.length; k++) {
            if(donorKeys.indexOf(elemKeys[k]) < 0) {
                hasAllKeys = false;
                break;
            }
        }
        if(hasAllKeys) {
            bestDonor = donors[i];
            break;
        }
    }
    return bestDonor;
}

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    if(typeof window.merge_called == "undefined") {
        window.merge_called = true;
        //alert(request.labels.mandatory_labels[0] + ", " + request.labels.data_labels[0]);
        merge(request.ours, request.theirs, request.labels);
    }
});