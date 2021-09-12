

let input = document.getElementById("pac-input");
let vari2 = (document.getElementById('varJ'));
let goo = JSON.parse(vari2.innerHTML);
vari2.remove();
let search = document.getElementById("search");
google.maps.event.addDomListener(window, 'load', initAutocomplete);
let validAddr = false;
let coord;
let place;
let IsplaceChange = false;
function initAutocomplete() {
	let script = document.getElementById("script");
	script.remove();
	let autocomplete = new google.maps.places.Autocomplete(input);
	google.maps.event.addListener(autocomplete, 'place_changed', function () {
		place = autocomplete.getPlace();
		coord = place.geometry.location.toString();
		// if (place.types.includes("street_address") || place.types.includes("premise")) {
		//   validAddr = true;
		// }
		validAddr = true;
		coord = coord.substring(1, coord.length - 1);
		coord = coord.split(" ").join("");
		IsplaceChange = true;
		searchFn();
	});
}
input.onkeydown = (function (event) {
	if (event.key != 'Enter') {
		IsplaceChange = false;
	}

});

document.addEventListener('keydown', (event) => {

	const keyName = event.key;
	if (keyName === 'Enter' && IsplaceChange) {
		event.stopPropagation();
		event.preventDefault();
		searchFn();
	}

}, false);


let checkWord = function (word) {
	for (let i = 0; i < abbrs.length; i++) {
		if (abbrs[i].abbrs.includes(word.toUpperCase())) {
			return abbrs[i].suffix;
		}
	}
}

let searchFn = function () {
	if (IsplaceChange == false) {
		input.value = "";
		alert("please Enter valid location");
		return;
	}
	else {
		let searchInput = input.value;
		// Might want to get some more general split action goin here eventually
		let info = searchInput.split(', ');
		let addr, city, state;
		if (info.length < 4) {
			addr = null;
			city = toTitleCase(info[0]);
			let stateCode = stateList[toTitleCase(info[1])];
			if (stateCode) {
				state = stateCode;
			}
			else {
				state = info[1].toUpperCase();
			}
		}
		else {
			for (let i = 0; i < info.length - 3; i++) {
				if (!addr) {
					addr = info[i];
				}
				else {
					addr = addr + ", " + info[i];
				}

			}
			var words = addr.split(" ");
			for (var i in words) {
				let newWord = checkWord(words[i]);
				if (newWord) {
					addr = addr.replace(words[i], newWord)
				}
			}
			addr = toTitleCase(addr);

			city = toTitleCase(info[info.length - 3]);

			let stateCode = stateList[toTitleCase(info[info.length - 2])];
			if (stateCode) {
				state = stateCode;
			}
			else {
				state = info[info.length - 2].toUpperCase();
			}
		}

		fetch('/listings/search', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				address: addr,
				city: city,
				state: state,
				coords: coord,
				validAddr: validAddr
			})
		}).catch(function (error) {
			console.log('Fetch Error:', error);
		}).then(response => {
			// HTTP 301 response
			// HOW CAN I FOLLOW THE HTTP REDIRECT RESPONSE?
			if (response.redirected) {
				window.location.href = response.url;
			}
		});
	}
}

search.onclick = searchFn;
let myOptions, query, pairs, pos, value, coords;
let panoramas = [];
let headings = [];
let sv = new google.maps.StreetViewService();
let panos = document.getElementsByClassName("panoX");
let errs = document.getElementsByClassName("noPhotos");
let index = 0;
for (let i = 0; i < panos.length; i++) {
	errs[i].style.display = "none";
}
let myLatLngs = [];
let map;
let markers = [];
let links = document.getElementsByClassName('address');
let divListings = document.getElementsByClassName('listing');

let imgLinks = document.getElementsByClassName("imglink");
// https://stackoverflow.com/questions/28731200/google-maps-api-v3-google-street-view-and-google-street-view-static-image
function initialize(urlstring, x) {
	// skip the first character, we are not interested in the "?"
	query = urlstring; // location.search.substring(1);
	coords = query.split(",");
	lat = parseFloat(coords[0]);
	lng = parseFloat(coords[1])
	if (!isNaN(lat) && !isNaN(lng)) {
		myLatLngs[x] = new google.maps.LatLng(lat, lng);
	}
	var panoramaOptions = {
		disableDefaultUI: true,
		scrollwheel: false,
		clickToGo: false,
	};

	var pinIconBig = new google.maps.MarkerImage(
		"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + 'FF0000',
		null, /* size is determined at runtime */
		null, /* origin is 0,0 */
		null, /* anchor is bottom center of the scaled image */
		new google.maps.Size(40, 66)
	);
	var pinIcon = new google.maps.MarkerImage(
		"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + 'FF0000',
		null, /* size is determined at runtime */
		null, /* origin is 0,0 */
		null, /* anchor is bottom center of the scaled image */
	);
	let marker = new google.maps.Marker({
		position: myLatLngs[x],
		map,
		url: 'https://example.com',
		title: listings[x].address,
		zIndex: 0,
		icon: pinIcon,
	});

	markers[x] = marker;
	//Add an url to the marker
	google.maps.event.addListener(marker, 'click', function () {
		window.location.href = "/listings/listing/" + listings[x]._id;
	});

	divListings[x].onmouseenter = () => {
		marker.setLabel({
			text: listings[x].address,
			color: "black",
			fontWeight: "bold",
			fontSize: "16px"
		});
		marker.setIcon(pinIconBig);
	}
	divListings[x].onmouseleave = () => {
		marker.setLabel(null);
		marker.setIcon(pinIcon);
	}


	divListings[x].ontouchstart = () => {
		marker.setLabel({
			text: listings[x].address,
			color: "black",
			fontWeight: "bold",
			fontSize: "16px"
		});
		marker.setIcon(pinIconBig);
	}
	divListings[x].ontouchend = () => {
		marker.setLabel(null);
		marker.setIcon(pinIcon);
	}
	//panoramas[x] = new google.maps.StreetViewPanorama(panos[x], panoramaOptions);
	sv.getPanoramaByLocation(myLatLngs[x], 50, (data, status) => {
		// https://stackoverflow.com/questions/28731200/google-maps-api-v3-google-street-view-and-google-street-view-static-image
		if (status == google.maps.StreetViewStatus.OK) {
			//panoramas[x].setPano(data.location.pano);
			if (isNaN(headings[x])) {
				headings[x] = google.maps.geometry.spherical.computeHeading(data.location.latLng, myLatLngs[x]);
			}
			// panoramas[x].setPov({
			// 	heading: headings[x],
			// 	pitch: 0,
			// 	zoom: 1
			// });
			
			let apiString = "https://maps.googleapis.com/maps/api/streetview?size=600x300&location=";
			apiString += myLatLngs[x].lat() + "," + myLatLngs[x].lng();
			apiString += "&heading=" + headings[x] + "&pitch=0";
			apiString += "&key=" + goo
			let img = document.createElement("img");
			img.style.width = '100%';
			img.style.minWidth = "230px"
			img.style.height = '200px';
			img.className = "listingsImg";
			img.src = apiString;
			imgLinks[x].appendChild(img);
			// panos[x].style.display = "block";
			img.onclick = () => {
				window.location.href = "/listings/listing/" + listings[x]._id;
			}
		} else {
			// panos[x].hidden = "true";
			// errs[x].style.display = "block";
			let img = document.createElement("div");
			img.style.width = '100%';
			img.style.minWidth = "230px"
			img.style.height = '200px';
			img.innerHTML = "No photos found"
			imgLinks[x].appendChild(img);
		}
	})
		.catch(err => {

		});
}

let vari = (document.getElementById('variableJSON'));


let listings = JSON.parse(vari.innerHTML);
let mapCoords = vari.dataset.coords;
vari.remove();
if (mapCoords) {
	let coords = mapCoords.split(",");
	latMap = parseFloat(coords[0]);
	lngMap = parseFloat(coords[1])
	latLngMap = new google.maps.LatLng(latMap, lngMap);
	let gesture = "greedy";
	if (document.body.scrollHeight > document.documentElement.clientHeight) {
		gesture = "cooperative"
	}
	// Set up the map
	myOptions = {
		zoom: 12,
		center: latLngMap,
		streetViewControl: false,
		mapTypeControl: false,
		zoomControl: false,
		gestureHandling: gesture
	};
	map = new google.maps.Map(document.getElementById('map_canvas1'),
		myOptions);

	google.maps.event.trigger(map, "resize");
}



for (let i = 0; i < listings.length; i++) {
	if (listings[i].coords) {
		initialize(listings[i].coords, i);
	}
}

window.onresize = () => {
	if (document.body.scrollHeight > document.documentElement.clientHeight) {
		gesture = "cooperative"
	}
	else {
		gesture = "greedy"
	}
	map.set('gestureHandling', gesture)
}

var elements;
var windowHeight;
let firstAnimation = true;
function init() {
	elements = document.querySelectorAll('.hid');
	windowHeight = window.innerHeight;
}
function checkPosition() {
	for (var i = 0; i < elements.length; i++) {
		let element = elements[i];
		var positionFromTop = elements[i].getBoundingClientRect().top;
		if (positionFromTop - listingsDiv.getBoundingClientRect().bottom <= 0) {
			void element.offsetWidth;
			if (firstAnimation) {
				element.classList.add('infotop');
			}
			else {
				if (!element.classList.contains('infotop')) {
					element.classList.add('scrollani');
				}

			}
			element.classList.remove('hid');
		}
		else {
			element.classList.remove('scrollani');
			element.classList.remove('infotop');
			if (elements[i].getBoundingClientRect() - windowHeight <= 0) {
				element.classList.add('hid');
			}
		}
	}
	firstAnimation = false;
}
let checkOverflow;
window.addEventListener('scroll', checkPosition);
window.addEventListener('resize', () => {
	windowHeight = window.innerHeight;
	checkOverflow();
});
let listingsDiv = document.getElementById("listingsDiv");
if (listingsDiv) {
	listingsDiv.addEventListener('scroll', checkPosition);
}

window.onload = () => {
	init();
	checkPosition();
	if (listingsDiv) {
		checkOverflow = () => {
			var hasVScroll = window.innerWidth > document.documentElement.clientWidth;
			if (hasVScroll) {
				listingsDiv.style.overflow = "hidden";
				window.onscroll = function (ev) {
					if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
						listingsDiv.style.overflow = "auto";

					}
					else {
						listingsDiv.style.overflow = "hidden";
					}
				};
			} else {
				listingsDiv.style.overflow = "auto";
			}
		}
		checkOverflow();
	}
}

if (listingsDiv) {
	if ((('ontouchstart' in window) ||
		(navigator.maxTouchPoints > 0) ||
		(navigator.msMaxTouchPoints > 0))) {
		listingsDiv.classList.remove('desktop')
		listingsDiv.classList.add('mobile');
	}
}