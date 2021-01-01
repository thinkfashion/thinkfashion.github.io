var container = document.getElementById("container");
var boxes = container.children;
var clones = [];
var boxHeight = parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('height'));
var boxWidth = parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('width'));
boxWidth = boxWidth + parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('margin-left'));
boxWidth = boxWidth + parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('margin-right'));

function addClones(num) {
    var lastBox = boxes[boxes.length - 1];
    for (i = 0; i < num; i++) {
	var clone = lastBox.cloneNode(true);
	clone.classList.add('placeholder');
	clones.push(clone);
	lastBox.after(clone);
    }
}

function removeClones() {
    for (var i = 0; i < clones.length; i++) {
	clones[i].parentNode.removeChild(clones[i]);
    }
    clones = [];
}

var prevCols = 0;

function reportWindowSize() {
    var containerWidth = parseInt(window.getComputedStyle(container).getPropertyValue('width'));
    var cols = Math.floor(containerWidth / boxWidth);
    var remainder = (boxes.length - clones.length) % cols
    if (prevCols !== cols) {
	removeClones();
	if (remainder !== 0) {
	    addClones(cols - remainder);
	}
	// console.log('cols', cols, 'clones', clones.length);
    }
    prevCols = cols;
}

reportWindowSize();
window.onresize = reportWindowSize;

// https://developers.google.com/sheets/api/reference/rest

// TODO: obfuscate
var API_KEY = "AIzaSyAZKpXAdjYOcSUrunD1AJIVXvSwRXYYynk";
var sheet_id = "1VsbC0dGsGWi4PIu3IsKhvdx2C3qbfWG7qzPc-AfMISw";
// END
var values = "2021_01!A1:L100";

var url = "https://sheets.googleapis.com/v4/spreadsheets/" + sheet_id;
url += "/values/" + values + "?key=" + API_KEY;
var sheetData = null;

let promise = fetch(url);
promise.then(response => {
    if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
        return;
    }
    response.json().then(data => {
        console.log(data);
        boxes[0].getElementsByTagName("h1")[0].textContent = data['values'][0];
        boxes[1].getElementsByTagName("h1")[0].textContent = data['values'][1];
    }).catch(error => {
        console.log(error.message);
    })
})
