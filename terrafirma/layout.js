var container = document.getElementById("container");
var footer = document.getElementById("footer");
var musicBox = document.getElementById("music-box");
var boxes = container.getElementsByClassName('box');

var nowYears = document.getElementsByClassName('now-year');
var d = new Date();
for (var i = 0; i < nowYears.length; i++) {
    nowYears[i].innerHTML = d.getFullYear();
}

var boxHeight = parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('height'));
var boxWidth = parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('width'));
boxWidth = boxWidth + parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('margin-left'));
boxWidth = boxWidth + parseInt(window.getComputedStyle(boxes[0]).getPropertyValue('margin-right'));

var prevCols = 0;

function reportWindowSize() {
    var containerWidth = parseInt(window.getComputedStyle(container).getPropertyValue('width'));
    var cols = Math.floor(containerWidth / boxWidth);
    var remainder = boxes.length % cols
    if (prevCols !== cols) {
	footer.classList.remove('lift');
	if (remainder !== 0) {
	    footer.classList.add('lift');
	}
	// console.log('cols', cols, 'boxes', boxes.length, 'remainder', remainder);
	// show the correct top-left and top-right svg top lines
	if (prevCols == 0) {
	    boxes[0].children[0].classList.remove('hidden');
	    boxes[0].children[0].children[0].classList.remove('hidden');
	}
	if (prevCols == 1) {
	    boxes[prevCols - 1].children[0].children[1].classList.add('hidden');
	}
	if (prevCols > 1) {
            boxes[prevCols - 1].children[0].classList.add('hidden');
        }
	// if (cols > 2) {
	boxes[cols - 1].children[0].classList.remove('hidden');
	boxes[cols - 1].children[0].children[1].classList.remove('hidden');
	// }
    }
    prevCols = cols;
}

var protoBox = container.children[0].cloneNode(true);
protoBox.removeAttribute('style');

var makeTwitterURL = function(uname) {
    return 'https://twitter.com/' + uname.replace('@', '');
}

var renderMusicBox = function(item) {
    var embedStr = item[keys.indexOf('URL')];
    if (embedStr != '') {
	var embedElem = document.createElement('div');
	embedElem.classList.add('embed');
	embedElem.innerHTML = embedStr;
	embedElem.children[0].setAttribute('width', 208);
	embedElem.children[0].setAttribute('height', 117);
	musicBox.querySelector('.box-content').appendChild(embedElem);
    }
}

var renderBox = function(title, items, className) {
    var elem = protoBox.cloneNode(true);
    elem.children[1].classList.add(className); // .box.inner
    elem.getElementsByTagName('h1')[0].textContent = title;

    for (var i = 0; i < items.length; i++) {
        var liElem = document.createElement('li');
	var linkElem = document.createElement('a');
	linkElem.setAttribute('target', '_blank');
	linkElem.setAttribute('href', items[i][keys.indexOf('URL')]);
	linkElem.innerHTML = items[i][keys.indexOf('Title')];

	var authorTwitters = items[i][keys.indexOf('Author Twitter')].split(',');
	var authors = items[i][keys.indexOf('Author')].split(',');
	var authorContents = [];

	for (var j = 0; j < authors.length; j++) {
	    if (typeof authorTwitters[j] !== 'undefined' && authorTwitters[j] !== '') {
		var authElem = document.createElement('a');
		authElem.setAttribute('href', makeTwitterURL(authorTwitters[j]));
		authElem.setAttribute('target', '_blank');
		authElem.innerHTML = authors[j];
		authorContents.push(authElem.outerHTML);
	    } else {
		authorContents.push(authors[j]);
	    }
	}

	if (title === 'ICYMI / Featured') {
	    var imgElem = document.createElement('img');
	    imgElem.setAttribute('src', items[i][keys.indexOf('Image URL')]);
	    liElem.appendChild(imgElem);
	}

	var titleDiv = document.createElement('div');
	titleDiv.classList.add('title-author');
	titleDiv.innerHTML = linkElem.outerHTML + ' // ' + authorContents.join(', ');
        liElem.appendChild(titleDiv);

	var divElem = document.createElement('div');
	divElem.classList.add('dateline');
	var pubURL = items[i][keys.indexOf('Publication URL')];
	var pubContent = items[i][keys.indexOf('Publication Title')];
	if (pubURL != '') {
	    var pubElem = document.createElement('a');
	    pubElem.setAttribute('href', pubURL);
	    pubElem.setAttribute('target', '_blank');
	    pubElem.innerHTML = pubContent;
	    pubContent = pubElem.outerHTML;
	}

	text = pubContent;
	var date = items[i][keys.indexOf('Publish Date')];
	if (date != null) {
	    date = new Date(date);
	    var ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
	    var mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
	    var da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
	    date = ye + '.' + mo + '.' + da;
	    text = text + ' — ' + date;
	}
        divElem.innerHTML = text;
        liElem.appendChild(divElem);
	var svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svgElem.setAttributeNS(null, 'viewBox', '0 0 874.8 34');
	var polylineElem = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
	polylineElem.setAttributeNS(null, 'points', '0.7,2.6 31.2,30.4 847.2,30.4 873.7,2.5 873.7,16.4');
	svgElem.classList.add('rule');
	svgElem.appendChild(polylineElem);
	liElem.appendChild(svgElem);
        elem.getElementsByTagName('ul')[0].appendChild(liElem);
    }
    
    container.appendChild(elem);
}

window.onresize = reportWindowSize;

// https://developers.google.com/sheets/api/reference/rest

var API_KEY = "AIzaSyAZKpXAdjYOcSUrunD1AJIVXvSwRXYYynk";
var sheet_id = "1VsbC0dGsGWi4PIu3IsKhvdx2C3qbfWG7qzPc-AfMISw";

var make_url = function(values) {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + sheet_id;
    url += "/values/" + values + "?key=" + API_KEY;
    return url;
}

var categories = [];
var sheet = {};
var keys = [];

Promise.all([
    fetch(make_url('categories')),
    fetch(make_url('2021_01')),
]).then(function (responses) {
    // Get a JSON object from each of the responses
    return Promise.all(responses.map(function (response) {
	return response.json();
    }));
}).then(function (data) {
    // Log the data to the console
    // You would do something with both sets of data here
    // console.log(data);
    // first request
    let values = data[0]['values'];
    for (var i = 1; i < values.length; i++) {
	categories.push(values[i]);
    }

    values = data[1]['values'];
    let musicItem = null;
    keys = values.shift();
    for (var i = 0; i < values.length; i++) {
	for (var j = 0; j < values[i].length; j++) {
	    if (keys[j] === 'Category') {
		var c = values[i][j];
		if (c === '') {
		    console.log('skipping item missing category: ', values[i]);
		    continue;
		}
		if (c == 'Music') {
		    musicItem = values[i];
		    continue;
		}
		if (c in sheet) {
		    sheet[c].push(values[i]);
		} else {
		    sheet[c] = [values[i]];
		}
	    }
	}
    }

    if (musicItem != null) {
	renderMusicBox(musicItem);
    }

    for (var i = 0; i < categories.length; i++) {
	var elem = null;
	if (i < boxes.length) {
	    boxes[i].parentNode.removeChild(boxes[i]);
	}
	if (sheet[categories[i][0]] !== undefined) {
	    renderBox(categories[i][0], sheet[categories[i][0]], categories[i][1]);
	}
    }
    for (var i = 0; i < 3; i++) {
	var emptySpaceElem = document.createElement('div');
	emptySpaceElem.classList.add('empty-space-childs');
	container.appendChild(emptySpaceElem);
    }
    reportWindowSize();
}).catch(function (error) {
    // if there's an error, log it
    console.log(error);
});
