/*
 * Copyright (C) 2012 Eike Send 
 *
 * http://eike.se/nd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

Leaf = function (value, parent) {
    this.value = value;
    this.index = value[value.length - 1];
    this.parent = parent;

    var currNode = this.parent;
    while (currNode != null) {
        currNode.cover[this.index] = true;
        currNode = currNode.parent;
    }
}

Node = function (parent) {
    this.value = "";
    this.leaves = [];
    this.nodes = [];
    this.parent = null;
    if (typeof parent != "undefined") {
        this.parent = parent;
    }
    this.cover = {};
};

Node.prototype.checkNodes = function (suf) {
    var node;
    for (var i = 0; i < this.nodes.length; i++) {
        node = this.nodes[i];
        if (node.value == suf[0]) {
            node.addSuffix(suf.slice(1));
            return true;
        }
    }
    return false;
};

Node.prototype.checkLeaves = function (suf) {
    var node, leaf;
    //console.log(this.leaves);
    for (var i = 0; i < this.leaves.length; i++) {
        leaf = this.leaves[i];
        if (leaf.value[0] == suf[0]) {
            node = new Node(this);
            node.value = leaf.value[0];
            node.addSuffix(suf.slice(1));
            node.addSuffix(leaf.value.slice(1));
            this.nodes.push(node);
            this.leaves.splice(i, 1);
            return;
        }
    }

    this.leaves.push(new Leaf(suf, this));
};

Node.prototype.addSuffix = function (suf) {
    if (!suf.length) return;
    if (!this.checkNodes(suf)) {
        this.checkLeaves(suf);
    }
};

Node.prototype.getLongestRepeatedSubString = function () {
    var str = "";
    var temp = "";
    for (var i = 0; i < this.nodes.length; i++) {
        temp = this.nodes[i].getLongestRepeatedSubString();
        if(temp.length > str.length) {
            str = temp;
        }
    }
    return this.value + str;
};

Node.prototype.leavesAt = function (set) {
    for (var i = 0; i < this.leaves.length; i++) {
        set[leaves[i].index] = true;
    }
}

Node.prototype.lcss = function(arr, num) {
    if(Object.keys(this.cover).length == num) {
        var strRev = "";
        var curr = this;
        while(curr != null) {
            strRev += curr.value;
            curr = curr.parent;
        }
        var str = "";
        for(var i = strRev.length - 1; i >= 0; i--) {
            str += strRev[i];
        }
        arr.push(str);
        
        for(var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].lcss(arr, num);
        }
    }
}

SuffixTree = function(arr) {
    this.node = new Node();
    this.arr = arr;
    
    var ending = 1000;
    for (var i = 0; i < arr.length; i++) {
        var wordToAdd = arr[i] + String.fromCharCode(ending++);
        for (var j = 0; j < wordToAdd.length; j++) {
            this.node.addSuffix(wordToAdd.slice(j));
        }
    }
    
    var lcssArr = [];
    this.node.lcss(lcssArr, arr.length);
}

SuffixTree.prototype.getLCSS = function() {
    var lcssArr = [];
    this.node.lcss(lcssArr, this.arr.length);
    return lcssArr.sort(function(a, b) { return b.length - a.length } );
}

function lcss(arr) {
    var s = new SuffixTree(arr);
    return s.getLCSS();
}

function groupByLCSS(arr, minLength) {
    var groups = [];
    
    for(var i = 0; i < arr.length; i++) {
        var bestMatchInd = -1;
        var bestMatchLength = -1;
        
        for(var j = 0; j < groups.length; j++) {
            var tempArr = lcss(groups[j].concat([arr[i]]));
            if(tempArr[0].length > bestMatchLength && tempArr[0].length >= minLength) {
                bestMatchInd = j;
                bestMatchLength = tempArr[0].length;
            }
        }
        if(bestMatchInd == -1) {
            groups.push([arr[i]]);
        }
        else {
            groups[bestMatchInd] = groups[bestMatchInd].concat([arr[i]]);
        }
    }
    
    return groups;
}