var container = document.getElementById("container");
var boxes = container.children;
var clones = [];
var boxHeight = parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('height'));
var boxWidth = parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('width'));
boxWidth = boxWidth + parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('margin-left'));
boxWidth = boxWidth + parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('margin-right'));

function addClones(num, className) {
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

var protoBox = boxes[0].cloneNode(true);
var renderBox = function(title, items) {
    var elem = protoBox.cloneNode(true);
    elem.getElementsByTagName('h1')[0].textContent = title;

    for (var i = 0; i < items.length; i++) {
        var liElem = document.createElement("li");
        var text = items[i][keys.indexOf('Title')] + ' // ' + items[i][keys.indexOf('Author')];
        liElem.textContent = text;
	var divElem = document.createElement("div");
	text = items[i][keys.indexOf('Publication Title')];
	var date = items[i][keys.indexOf('Publish Date')];
	if (date != null) {
	    date = new Date(date);
	    var ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
	    var mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
	    var da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
	    date = ye + '-' + mo + '-' + da;
	    text = text + ' — ' + date;
	}
        divElem.textContent = text;
        divElem.classList.add('dateline');
        liElem.appendChild(divElem);
        elem.getElementsByTagName('ul')[0].appendChild(liElem);
    }
    
    container.appendChild(elem);
}

// window.onresize = reportWindowSize;
// reportWindowSize();

// https://developers.google.com/sheets/api/reference/rest

var API_KEY = "AIzaSyAZKpXAdjYOcSUrunD1AJIVXvSwRXYYynk";
var sheet_id = "1VsbC0dGsGWi4PIu3IsKhvdx2C3qbfWG7qzPc-AfMISw";

var values = "2021_01!A1:L100";
var url = "https://sheets.googleapis.com/v4/spreadsheets/" + sheet_id;
url += "/values/" + values + "?key=" + API_KEY;

var categories = {};
var keys = [];

let promise = fetch(url);
promise.then(response => {
    if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
        return;
    }
    response.json().then(data => {
	var values = data['values'];
	keys = values.shift();
	for (var i = 0; i < values.length; i++) {
	    for (var j = 0; j < values[i].length; j++) {
		if (keys[j] === 'Category') {
		    if (values[i][j] === '') {
			console.log("skipping item missing category: ", values[i]);
			continue;
		    }
		    var c = values[i][j];
		    if (c in categories) {
			categories[c].push(values[i]);
		    } else {
			categories[c] = [values[i]];
		    }
		}
	    }
	}

	var categoryArray = Object.keys(categories);
	for (var i = 0; i < categoryArray.length; i++) {
	    var elem = null;
	    if (i < boxes.length) {
		boxes[i].parentNode.removeChild(boxes[i]);
	    }
	    renderBox(categoryArray[i], categories[categoryArray[i]]);
	}
	// reportWindowSize();
    }).catch(error => {
        console.log(error.message);
    })
})

