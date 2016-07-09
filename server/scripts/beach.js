var uniqueID = (function() {
   var id = 0; // This is the private persistent value
   return function() { return id++; };  // Return and increment
})(); // Invoke the outer function after defining it.

function findSuperStructure(elems, tag) {
    var superStructure = [];
    if(typeof tag == "undefined")
        tag = false;
    
    for(var i = 0; i < elems.length; i++) {
        var currElem = $(elems[i]);
        var prevElem = null;
        while(currElem.length > 0) {
            var subElems = [];
            for(var j = 0; j < elems.length; j++) {
                if(j != i) {
                    subElems.push(elems[j]);
                }
            }
            
            if(eachContains(currElem, subElems)) {
                superStructure.push(prevElem[0]);
                
                if(tag) {
                    var uid = uniqueID();
                    $(elems[i]).attr("price-id", uid);
                    $(elems[i]).addClass("vs_price");
                    $(prevElem[0]).attr("price-id", uid);
                    $(prevElem[0]).addClass("vs_container");
                }
                
                break;
            }
            prevElem = currElem;
            currElem = $(currElem).parent();
        }
    }
    
    return superStructure;
}

function eachContains(elem, arr) {
    for(var i = 0; i < arr.length; arr++) {
        if($.contains($(elem)[0], $(arr[i])[0])) {
            return true;
        }
    }
    return false;
}

function waitFor(desc, int, cb) {
    var interval = setInterval(function() {
        var matches = findElement(desc);
        if(matches.length > 0) {
            clearInterval(interval);
            cb(matches);
        }
    }, int);
}