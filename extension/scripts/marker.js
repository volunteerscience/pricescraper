/*if(typeof document.vs_marker == "undefined") {
    document.vs_marker = true;
    true;
}
else {
    false;
}*/
var marker_id = "vs_page_marker_213";
var marker = document.getElementById(marker_id);
if(!marker) {
    //console.log("HEY AWESOME IT DOESN'T EXIST!!!");
    marker = document.createElement("div");
    marker.setAttribute("id", marker_id);
    document.body.appendChild(marker);
    true;
}
else {
    //console.log("IS THIS SOME SORT OF JOKE");
    false;
}