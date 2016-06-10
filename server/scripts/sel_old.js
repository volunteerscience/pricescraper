function findElement(/*elem*/desc, matchArr) {
    var matches = [];
    if(typeof matchArr != "undefined")
        matches = matchArr;
    
    var searchForBase = false;
    
    for(var i = 0; i < desc.length; i++) {
        var elem = desc[i];
        var e = Object.keys(elem)[0];
        var dashInd = e.indexOf("-")
        var prefix = e.substr(0, dashInd);
        
        if(prefix == "len") {            
            len = elem[e];
            if(matches.length == 0) {
                // searchForBase = true; // still only search for base words
                matches = $("*").filter(function() {
                    return $(this).text().length < len;
                });
            }
            else {
                matches = $(matches).filter(function() {
                    return $(this).text().length < len; 
                });
            }
        }
        if(prefix == "id") {
            // searchForBase = false;
            var s_id = elem[e].substr(1);
            var op = elem[e][0];
            
            var match = null;
            if(op == "=") {
                match = $("#" + s_id);
            }
            else if (op == "+") {
                match = $("*[id*='" + s_id + "']");
            }
            if(matches.length == 0) {
                matches = match;
            }
            else {
                matches = _.intersection(matches, match);
            }
        }
        else if(prefix == "class") {
            var s_class = elem[e].substr(1);
            var op = elem[e][0];
            
            var match = null;
            if(op == "=") {
                match = $("." + s_class);
            }
            else if (op == "+") {
                match = $("*[class*='" + s_class + "']");
            }
            //console.log(match);
            
            if(matches.length == 0) {
                matches = match;
            }
            else {
                var combined = _.intersection(matches, match);
                matches = _.intersection(matches, match);
            }
        }
        else if(prefix == "prop") {
            // searchForBase = false;
            var prop = e.substr(dashInd + 1);
            var propVal = elem[e].substr(1);
            var op = elem[e][0];

            var match = $("[" + prop + "]");
            var filteredMatch = [];
            for(var i = 0; i < match.length; i++) {
                var curr = $(match[i]);
                if(curr.attr(prop) == propVal) {
                    filteredMatch.push(curr[0]);
                }
                else if(curr.attr(prop).indexOf(propVal) >= 0 && op == "+") {
                    filteredMatch.push(curr[0]);
                }
            }
            if(matches.length == 0) {
                matches = filteredMatch;
            }
            else {
                matches = _.intersection(matches, filteredMatch);
            }
        }
        else if(prefix == "contents") {
            var txt = elem[e].substr(1);
            var len = parseInt(e.substr(dashInd + 1));
            if(isNaN(len) || len < 0) {
                len = null;
            }
            
            var op = elem[e][0];
            var opGroup = "";
            if(elem[e][0] == "[") {
                op = elem[e][1];
                var opGroup = elem[e].substring(2, elem[e].indexOf("]"));
                txt = applyOpGroup(elem[e].substr(elem[e].indexOf("]") + 1), opGroup);
            }
            
            if(matches.length == 0 /*|| searchForBase*/) {
                matches = findText(txt, op, opGroup, len);
            }
            else {
                var match = [];
                for(var i = 0; i < matches.length; i++) {
                    var currLen = $(matches[i]).text().length;
                    if(len == null || (len != null && currLen < len)) {
                        var text = applyOpGroup($(matches[i]).text(), opGroup);
                        if(text == txt) {
                            match.push(matches[i]);
                        }
                        if(text.indexOf(txt) >= 0 && op == "+") { 
                            match.push(matches[i]);
                        }
                        else if(op == "^") {
                            var reg = new RegExp(txt);
                            if(reg.test(text)) {
                                match.push(matches[i]);
                            }
                        }
                    }
                }
                matches = _.intersection(matches, match);
            }
        }
        else if(prefix == "tag") {
            // searchForBase = false;
            tagType = elem[e].substr(1);
            match = $(tagType);
            if(matches.length == 0) {
                matches = match;
            }
            else {
                matches = _.intersection(matches, match);
            }
        }
        else if(prefix == "parent") { // I want things whose parent is x
            // searchForBase = false;
            parentElem = $(elem[e]);
            childrenOfParent = parentElem.children();
            if(matches.length == 0) {
                matches = childrenOfParent;
            }
            else {
                matches = _.intersection(matches, childrenOfParent);
            }
        }
        else if(prefix == "child") { // I want things whose child is blah
            // searchForBase = false;
            childElem = $(elem[e]);
            parentsOfChild = childElem.parents().not("html, head, script, style");
            if(matches.length == 0) {
                matches = parentsOfChild;
            }
            else {
                matches = _.intersection(matches, parentsOfChild);
            }
        }
        else if(prefix == "sibling") { // I want things who are directly next to x
            // searchForBase = false;
            sibElem = $(elem[e]);
            siblings = sibElem.siblings();
            if(matches.length == 0) {
                matches = siblings;
            }
            else {
                matches = _.intersection(matches, siblings);
            }
            
        }
        else if(prefix == "left" || prefix == "right" || prefix == "above" || prefix == "below") {
            // searchForBase = false;
            var ref = elem[e];
            var tempMatches = $(matches).not("html, head, script, style");
            if(matches.length == 0) {
                tempMatches = $("*");
            }
            
            tempMatches = tempMatches.filter(function () { 
                res = isDirection(prefix, this, ref);
                return res;
            });
            
            if(matches.length == 0) {
                matches = tempMatches;
            }
            else {
                matches = _.intersection(matches, tempMatches);
            }
        }
        else if(prefix == "distance") {
            // searchForBase = false;
            var refs = elem[e];
            if(matches.length == 0) {
                matches = $("*");
            }
            var bounds = jQuery.parseJSON(e.substr(dashInd + 1));
            var minDist = bounds[0];
            var maxDist = bounds[1];
            var minAngle = bounds[2];
            var maxAngle = bounds[3];
            
            var subMatches = [];
            for(var i = 0; i < refs.length; i++) {
                var ref = refs[i];
                //console.log($(ref).text());
                var matchRef = $(matches).filter(function() {
                    var res = distance(ref, this);
                    var dist = res[0];
                    var angle = res[1];
                    
                    if(this.ref != ref) {
                        if(dist >= minDist && dist <= maxDist &&
                           angle >= minAngle && angle <= maxAngle) {
                            return true;
                        }
                    }
                    return false;
                });
                subMatches = _.union(subMatches, _.flatten(matchRef));        
            }
            
            return _.intersection(subMatches, matches);
        }
    }
    gMatch = matches;
    return matches;
}

function applyOpGroup(txt, opGroup) {
    opGroup = opGroup.toLowerCase();
    if(opGroup.indexOf("l") >= 0) {
        txt = txt.toLowerCase();
    }
    if(opGroup.indexOf("t") >= 0) {
        txt = txt.trim();
    }
    
    return txt;
}

function distance(elemA, elemB) {
    //console.log("OKAY AND WE'RE IN HERE");
    var posElemA = $(elemA).offset();
    var posElemB = $(elemB).offset();
    //console.log(posElemA.top + ", " + posElemA.top);
    
    posElemA["bottom"] = posElemA.top + $(elemA).height();
    posElemA["right"] = posElemA.left + $(elemA).width();
    posElemA["x"] = (posElemA.left + posElemA.right) / 2;
    posElemA["y"] = (posElemA.top + posElemA.bottom) / 2;
    
    posElemB["bottom"] = posElemB.top + $(elemB).height();
    posElemB["right"] = posElemB.left + $(elemB).width();
    posElemB["x"] = (posElemB.left + posElemB.right) / 2;
    posElemB["y"] = (posElemB.top + posElemB.bottom) / 2;
    
    var distX = posElemA.x - posElemB.x;
    var distY = posElemA.y - posElemB.y;
    
    var dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
    var angle = Math.atan(distY, distX) * (180 / Math.PI)
    
    return [dist, angle];
}

// is elemA DIR elemB
function isDirection(dir, elemA, elemB) {
    var posElemA = $(elemA).offset();
    var posElemB = $(elemB).offset();
    posElemA["bottom"] = posElemA.top + $(elemA).height();
    posElemA["right"] = posElemA.left + $(elemA).width();
    posElemB["bottom"] = posElemB.top + $(elemB).height();
    posElemB["right"] = posElemB.left + $(elemB).width();
     
    var left = false;
    var right = false;
    var above = false;
    var below = false;
    
    var directions = {"left": false, "right": false, "above": false, "below": false};
    
    if(posElemA.right <= posElemB.left) {
        directions["left"] = true;
    }
    if(posElemA.left >= posElemB.right) {
        directions["right"] = true;
    }
    if(posElemA.bottom <= posElemB.top) {
        directions["above"] = true;
    }
    if(posElemA.top >= posElemB.bottom) {
        directions["below"] = true;
    }
    
    return directions[dir];
}

$.fn.ignore = function(sel) {
    return this.clone().find(sel||">*").remove().end();
};

function findText(txt, op, opGroup, len) {
    //parents = $("*:contains('" + txt + "')").not("script");
    txt = applyOpGroup(txt, opGroup);
    
    var matches = $("*").not("script");
    var parents = [];
    for(var i = 0; i < matches.length; i++) {
        if(len == null || (len != null && $(matches[i]).text().length < len)) {
            var text = applyOpGroup($(matches[i]).text(), opGroup);
            if(text.indexOf(txt) >= 0) {
                parents.push(matches[i]);
            }
        }
    }
    parents = $(parents);
    
    var match = []
    parents.each(function() { 
        if(isBaseParent(txt, this, opGroup)) {
            if(op == "+")
                match.push(this);
            else if(applyOpGroup($(this).text(), opGroup) == txt && op == "=") {
                match.push(this);
            }
        }
    });

    return match;
}

function isBaseParent(txt, ctx, opGroup) {
    var node = $(ctx).clone();
    var contents = applyOpGroup(node.ignore("*").text(), opGroup);
    if(contents.indexOf(txt) >= 0) {
        return true;
    }
    return false;
}

function findSuperstructure(elems) {
    var superStructure = [];
    
    for(var i = 0; i < elems.length; i++) {
        var currElem = $(elems[i]);
        var prevElem = null;
        while(currElem.length > 0) {
            /*console.log(i);
            console.log(superStructure);*/
            
            var subElems = [];
            for(var j = 0; j < elems.length; j++) {
                if(j != i) {
                    subElems.push(elems[j]);
                }
            }
            
            if(eachContains(currElem, subElems)) {
                superStructure.push(prevElem[0]);
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