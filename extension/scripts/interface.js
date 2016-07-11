function vs_init_ui() {
    //alert("INJECTION");
    
    var vs_dialog = $('<div class="modal fade" id="vs_modal" role="dialog"> <div class="modal-dialog"> <!-- Modal content--> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">&times;</button> <h4 class="modal-title">Volunteer Science recognizes this site! Would you like to see how your results stack up?</h4> </div> <div class="modal-body"> <p>Volunteer Science can scrape the data on this page and show you how your results compare with those served to a "generic" user. If you click SURE, data from this page will be sent to our servers for analysis, and you will see the results immediately. If you want us to stop asking, click NEVER. Remember, you can always re-enable this site by clicking on the plugin icon!</p> </div> <div class="modal-footer"> <span id="sureButtonHolder"></span> <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> </div> </div> </div> </div>');
    var sureButton = $('<button id="sureButton" type="button" class="btn btn-success" data-dismiss="modal">Sure</button>');
    vs_dialog.find("#sureButtonHolder").append(sureButton);
    
    sureButton.click(function() {
        loadScrapeUI();
    });
    
    vs_dialog.on("hidden.bs.modal", function () {
        centerOverlayBody();
        vs_continue(); 
    });
    
    vs_dialog.prependTo('body');
    vs_dialog.modal("show");
}

function loadScrapeUI() {
    var spinnerSrc = chrome.extension.getURL("images/icon128.png");
    var vs_overlay = $('<div id="vs_overlay"> <div id="vs_overlay_screen"></div> <div id="vs_overlay_body"> <div id="vs_spinner"><img src=' + spinnerSrc + ' /></div> </div> </div>');
    
    vs_overlay.prependTo('body');
    $("body").addClass("vs_overlay");
    centerOverlayBody();
    
     window.onresize = function() {
       centerOverlayBody(); 
    };
}

function centerOverlayBody() {
    centerX = (window.innerWidth / 2) + $(window).scrollLeft();
    centerY = (window.innerHeight / 2) + $(window).scrollTop();
    overlayBodyWidth = $("#vs_overlay_body").width();
    overlayBodyHeight = $("#vs_overlay_body").height();

    $("#vs_overlay_body").offset({"left": centerX - (overlayBodyWidth / 2), "top": centerY - (overlayBodyHeight / 2)});
}