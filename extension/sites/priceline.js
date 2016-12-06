var vsScraperVersion = "001";

if(typeof window.vs_scraper == "undefined") {
    var url = window.location.href;
    /*console.log("url is " + url);
    if(url.indexOf("page=1") >= 0) {
        window.vs_scraper = true;
        vs_init();
    }
    else {
        console.log("only the first page of results is supported on Priceline.");
    }*/
    vs_init();
}

function vs_init() {
    waitFor([{"class-":"=next"}, {"tag-":"=BUTTON"}], 1000, function() {
         var url = window.location.href;
        console.log("url is " + url);
        if(url.indexOf("page=1") >= 0) {
            window.vs_scraper = true;
            vs_init_ui();
        }
        else {
            console.log("only the first page of results is supported on Priceline.");
        }
        //vs_init_ui();
    });
}

function vs_precapture(cb) {
    cb();
}

function vs_continue() {
    var jsonBlock = 
        [{"desc":[{"chain":[{"prop-bo-html":"=hotel.name"}]},{"name":"temp_title"}]},{"desc":[{"super":{"ref":"temp_title"}},{"name":"vs_container","vsid":"generate","tag":true}]},{"desc":[{"chain":[{"prop-bo-html":"=hotel.name"}]},{"name":"vs_hotel_name","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","grab":"text","mandatory":true,"cascade":true,"tag":true}]},{"desc":[{"chain":[{"class-":"=price-wrapper"}]},{"name":"vs_price","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","grab":"text","mandatory":true,"tag":true,"cascade":true}]},{"desc":[{"chain":[{"class-":"+thumbnail"},{"class-":"+img"},{"tag-":"=IMG"}]},{"name":"vs_hotel_img","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","grab":"src,alt","mandatory":false,"tag":true,"cascade":true}]}];
    
    processJSON(jsonBlock);
    
    vs_scraper_done(labels);
}