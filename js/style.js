/* ========== TEXT-ÄNDERUNG FÜR KONFIGURATOR ======== */


/* --- Hochtöner --- */
/* Was passiert nach Button click*/
var changetoht1 = function() {
    document.getElementById('ht-1').classList.remove("dont-show");
    document.getElementById('ht-2').classList.add("dont-show");
    document.getElementById('ht-2').classList.remove("show");
    document.getElementById('ht-1').classList.add("show");
};
var changetoht2 = function() {
    document.getElementById('ht-2').classList.remove("dont-show");
    document.getElementById('ht-1').classList.add("dont-show");
    document.getElementById('ht-1').classList.remove("show");
    document.getElementById('ht-2').classList.add("show");
};
/* Button Click */
document.getElementById('slider-ht-1').onclick = changetoht1;
document.getElementById('slider-ht-2').onclick = changetoht2;

/* --- Mitteltöner --- */
/* Was passiert nach Button click*/
var changetomt1 = function() {
    document.getElementById('mt-1').classList.remove("dont-show");
    document.getElementById('mt-2').classList.add("dont-show");
    document.getElementById('mt-2').classList.remove("show");
    document.getElementById('mt-1').classList.add("show");
};
var changetomt2 = function() {
    document.getElementById('mt-2').classList.remove("dont-show");
    document.getElementById('mt-1').classList.add("dont-show");
    document.getElementById('mt-1').classList.remove("show");
    document.getElementById('mt-2').classList.add("show");
};
/* Button Click */
document.getElementById('slider-mt-1').onclick = changetomt1;
document.getElementById('slider-mt-2').onclick = changetomt2;

/* --- Tieftöner --- */
/* Was passiert nach Button click*/
var changetott1 = function() {
    document.getElementById('tt-1').classList.remove("dont-show");
    document.getElementById('tt-2').classList.add("dont-show");
    document.getElementById('tt-2').classList.remove("show");
    document.getElementById('tt-1').classList.add("show");
};
var changetott2 = function() {
    document.getElementById('tt-2').classList.remove("dont-show");
    document.getElementById('tt-1').classList.add("dont-show");
    document.getElementById('tt-1').classList.remove("show");
    document.getElementById('tt-2').classList.add("show");
};
/* Button Click */
document.getElementById('slider-tt-1').onclick = changetott1;
document.getElementById('slider-tt-2').onclick = changetott2;

$(document).ready(function(){
    $('[data-toggle="popover"]').popover();
});