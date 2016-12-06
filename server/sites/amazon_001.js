var vsScraperVersion = "001";

if(typeof window.vs_scraper == "undefined") {
    window.vs_scraper = true;
    vs_init();
}

function vs_init() {
    vs_init_ui();
}

function vs_continue() {
   var jsonBlock = 
        [
            {"desc":[{"chain":[{"class-":"+access-title"},{"class-":"+text-normal"}]},{"name":"temp_titles"}]},
         
            {"desc":[{"super":{"ref":"temp_titles"}},{"name":"vs_container","vsid":"generate","tag":true}]},
         
            {"desc":[{"chain":[{"class-":"=sx-price"}]},{"name":"vs_price","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","tag":true,"cascade":true,"grab":"amaprice","mandatory":true}]},
          
            {"desc":[{"chain":[{"class-":"+access-title"},{"class-":"+text-normal"}]},{"name":"vs_anchor","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","tag":true,"cascade":true,"grab":"text,data-attribute","mandatory":true}]},
         
            {"desc":[{"chain":[{"class-":"+s-access-image"},{"tag-":"=img"}]},{"name":"vs_product_img","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","tag":true,"cascade":true,"grab":"src,srcset"}]},
            
            {"desc":[{"chain":[{"class-":"+a-size-small"},{"class-":"+a-color-null"},{"class-":"+s-inline"},{"class-":"+a-text-normal"}]},{"name":"vs_price::{\"above\":30,\"name\":\"primary_label\",\"gap-above\":10,\"mode\":\"middles\"}","deep":true,"ctxt":{"ref":"vs_container"},"vsid":"generate","tag":true,"cascade":true,"grab":"text"}]}
        ];
    
    registerType("amaprice", function(elem) {
      var priceWholes = $(elem).find(".sx-price-whole");
      var priceFractionals = $(elem).find(".sx-price-fractional");
      var price = "";
      for(var i = 0; i < priceWholes.length; i++) {
          var currPrice = "$" + $(priceWholes[i]).text() + "." + $(priceFractionals[i]).text();
          //var currPrice = "$" + priceWholes[i] + "." + priceFractionals[i];
          if(i < priceWholes.length - 1) {
              currPrice += " - ";
          }
          price += currPrice;
      }
      //console.log(price);
      return price;
    });
    
    processJSON(jsonBlock);
    vs_scraper_done(labels);
}