// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
// vim: set sts=4 shiftwidth=4 expandtab :
"use strict";

/* This script should only be used for functions that cannot be accomplished
with plain HTML/CSS.
If JavaScript is disabled or does not work, rest of the page should continue
to work, without any broken links or strange warnings.
*/

if (navigator.userAgent.includes("Node.js") ||
    navigator.userAgent.includes("jsdom")) {} else {
    window.addEventListener('load', atPageLoad);
}

/* These icons are useless if JavaScript isn't working, so they are loaded with Javascript.
If JavaScript is disabled or doesn't work, the icons simply won't appear.
*/
function atPageLoad() {
	document.getElementById("zoom_div").innerHTML = 
	'<img id="zoom_in" class="zoom" src="assets/ZoomIn_OpenClipArt_211888.png"'
	+ '	onclick="zoomInPage()" title="Maak tekst groter"><br>\n'
	+ '<img id="zoom_out" class="zoom" src="assets/ZoomOut_OpenClipArt_211892.png"'
	+ ' onclick="zoomOutPage()" title="Maak tekst kleiner">';
}

/* For now this is binary: 150% or nothing. We can consider improving this later.
*/
function zoomInPage(){
	document.body.style['-webkit-transform'] = 'scale(1.5)';
	// This works in Firefox and Edge. Not yet tested on Chrome.
}

function zoomOutPage(){
	document.body.style['-webkit-transform'] = 'scale(1)';
}

//TODO change the URL for each hospital's installation
function siteSearch(searchString){
	window.open('https://duckduckgo.com?q=%22'+encodeURIComponent(searchString)+'%22+site%3Ahttps%3A%2F%2Fvalportaal.openelectronicslab.org%2F&k9=%23ff9f01');
	return false;
}
