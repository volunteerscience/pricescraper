var vs_data = null;
window.vs_scraper = true;

function vs_scraper_done(labels) {
    vs_data = collectPriceData(labels);
}

function getVSData() {
    return vs_data;
}