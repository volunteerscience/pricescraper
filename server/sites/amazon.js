if(typeof window.vs_scraper == "undefined") {
    window.vs_scraper = true;
    vs_init();
}

function vs_init() {
    var jsonBlock = 
        [{"desc":[{"chain":[{"class-":"+access-title"},{"class-":"+text-normal"}]},{"name":"temp_titles"}]},{"desc":[{"super":{"ref":"temp_titles"}},{"name":"vs_container","vsid":"generate","tag":true}]},{"desc":[{"chain":[{"class-":"+s-price"},{"contents-20":"+$"}]},{"ctxt":{"ref":"vs_container"},"cascade":true,"name":"vs_price","vsid":"generate","tag":true,"deep":true,"grab":"text","mandatory":true}]},{"desc":[{"chain":[{"class-":"+access-title"},{"class-":"+text-normal"}]},{"name":"vs_product_title","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","tag":true,"cascade":true,"grab":"text","mandatory":true}]},{"desc":[{"chain":[{"class-":"+s-access-image"},{"tag-":"=img"}]},{"name":"vs_product_img","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","tag":true,"cascade":true,"grab":"src,srcset"}]}];
    
    processJSON(jsonBlock);
    
    vs_scraper_done(labels);
}