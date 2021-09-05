let reviewsDiv = document.getElementById("reviews");
let vari = (document.getElementById('variableJSON'));
let listing = JSON.parse(vari.innerHTML);
vari.remove();
let variUser = (document.getElementById('variableJSONUser'));
let pageUser;
let sortedReviews = [];
let finished = 0;
if (variUser.innerHTML.trim()) {
    pageUser = JSON.parse(variUser.innerHTML);
    variUser.remove();
}
for (let i = 0; i < listing.reviews.length; i++) {
    fetch('/listings/listing/getreview', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: listing.reviews[i].reviewId
        })
    }).then(res => {
        if (res.ok) {
            res.json().then(function (review) {
                // Dont show reviews that are just a number rating (no title/comments)
                if (review.title.length > 0) {
                    let user = document.createElement("span");
                    let li = document.createElement("li");
                    li.class = "reivew";
                    fetch('/listings/getuser', {
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: review.userId
                        })
                    }).then(res => {
                        if (res.ok) {
                            let userDiv = document.createElement("div");
                            userDiv.style.padding = "10px 0px 0px 0px"
                            let img = new Image();
                            img.src = "/images/usericon.png";
                            img.width = "35";
                            img.style.padding = "0px 5px 0px 0px"
                            userDiv.appendChild(img);
                            res.json().then(function (data) {
                                user.innerHTML = data.firstname;
                                if (pageUser) {
                                    if (pageUser.username == data.username) {
                                        user.style = "color:#54b7f0"
                                    }
                                }
                            });
                            userDiv.appendChild(user);
                            li.appendChild(userDiv);
                            let voteDiv = document.createElement("button");
                            voteDiv.innerHTML = "Helpful ";
                            voteDiv.className = "likeBtn";
                            let voteNum = document.createElement("span");
                            let helpful = document.createElement("span");
                            voteNum.name = "num"
                            voteNum.innerHTML = review.upvotes;
                            voteDiv.setAttribute('data-checked', "false");
                            let likeImg = new Image();
                            likeImg.src = "/images/likebutton.png";
                            likeImg.width = "15";
                            likeImg.style.padding = "0px 5px 0px 0px"
                            voteDiv.appendChild(likeImg);
                            if (pageUser) {
                                // Set the box to checked if the user has already liked this review
                                for (let j = 0; j < pageUser.upvotes.length; j++) {
                                    if (pageUser.upvotes[j].reviewId == review._id) {
                                        //upvote.checked = true;
                                        upvoteId = pageUser.upvotes[j]._id;
                                        voteDiv.style.backgroundColor = "#54b7f0";
                                        voteDiv.setAttribute('data-checked', "true");
                                    }
                                }
                            }
                            // If user has liked it, true
                            voteDiv.onclick = function () {
                                if (pageUser) {
                                    let reviewId = review._id;
                                    fetch('/listings/listing/upvote', {
                                        method: 'put',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            reviewId: reviewId,
                                        })
                                    }).then(res => {
                                        res.json().then(function (upvotes) {
                                            voteNum.innerHTML = upvotes;
                                            if (voteDiv.dataset.checked == "true") {
                                                voteDiv.setAttribute('data-checked', "false")
                                                voteDiv.style.backgroundColor = "rgb(194, 194, 194)";
                                            }
                                            else {
                                                voteDiv.setAttribute('data-checked', "true");
                                                voteDiv.style.backgroundColor = "#54b7f0";

                                            }
                                        });
                                    }).catch(function (error) {
                                        console.log('Fetch Error:', error);
                                    });
                                }
                                else {
                                    openPopup();
                                }
                            }
                            voteDiv.appendChild(voteNum);
                            let titleDiv = document.createElement("div");
                            let title = document.createElement("span");
                            title.innerHTML = review.title;
                            let rating = document.createElement("span");
                            rating.class = "rating";
                            let value;
                            if (review.stars == undefined) {
                                value = 5;
                            }
                            else {
                                value = review.stars;
                            }
                            rating.setAttribute("data-rating", value);
                            let stars = document.createElement("span");
                            stars.innerHTML = "★★★★★";
                            rating.appendChild(stars);
                            rating.style = "font-size: 20px;background: linear-gradient(to right, #FFEA00, #FFEA00 20%, #000 1%, #000 99%);background-clip: text;-webkit-background-clip: text;color: rgba(0,0,0,0);text-shadow: 2px 2px 2px rgba(0,0,0,0.2);"
                            const fill = value * 20;
                            rating.style.backgroundImage = `linear-gradient(to right,#FFEA00, #FFEA00, ${fill}%, #000 1%, #000 99%)`;
                            rating.setAttribute('aria-label', 'Rating: ' + value + ' of 5');
                            rating.innerHTML = stars.innerHTML.replace(/\s/gm, '');
                            rating.style.padding = "0px 10px 0px 0px";
                            titleDiv.appendChild(rating);
                            titleDiv.appendChild(title);
                            li.appendChild(titleDiv);
                            let date = document.createElement("span");
                            date.innerHTML = review.date || new Date().toLocaleDateString();
                            date.style.fontSize = ".75em";
                            date.style.padding = "5px";
                            userDiv.appendChild(date);
                            let comments = document.createElement("div");
                            comments.innerHTML = review.comments.substring(0, MED_COMMENT);
                            comments.style.padding = "5px 0px 5px 10px";
                            let expand = document.createElement("a");
                            expand.innerHTML = "show more";
                            expand.classList.add("expand");
                            if (review.comments.length > MED_COMMENT) {
                                comments.appendChild(expand);
                            }

                            expand.onclick = () => {
                                if (expand.innerHTML == "show more") {
                                    comments.innerText = review.comments;
                                    comments.appendChild(expand)
                                    expand.innerHTML = "show less";
                                }
                                else {
                                    comments.innerText = review.comments.substring(0, MED_COMMENT);
                                    comments.appendChild(expand)
                                    expand.innerHTML = "show more";
                                }
                            }
                            li.appendChild(comments);
                            li.appendChild(voteDiv);
                            li.setAttribute('data-date', review.date || new Date().toLocaleDateString());
                            li.setAttribute('data-stars', value);
                            li.classList.add("hid");
                            sortedReviews.push({ up: review.upvotes, li: li });
                            if (finished == listing.reviews.length - 1) {
                                done();
                            }
                            else {
                                finished++;
                            }
                        }
                    }).catch(function (error) {
                        console.log('Fetch Error:', error);
                    });
                }
            });
        }
    }).catch(function (error) {
        console.log('Fetch Error:', error);
    });
}

let voteClick;

function done() {
    sortedReviews.sort((firstItem, secondItem) => secondItem.up - firstItem.up)
    for (let i = 0; i < sortedReviews.length; i++) {
        reviewsDiv.appendChild(sortedReviews[i].li);
    }
    init();
    checkPosition();
}

let myOptions, query, pairs, pos, value, coords, panorama, heading;
let sv = new google.maps.StreetViewService();
let pano = document.getElementById("pano");
let err = document.getElementById("err");
err.style.display = "none";
pano.style.display = "none";
// https://stackoverflow.com/questions/28731200/google-maps-api-v3-google-street-view-and-google-street-view-static-image
function initialize(urlstring) {
    // skip the first character, we are not interested in the "?"
    query = urlstring; // location.search.substring(1);
    coords = query.split(",");
    lat = parseFloat(coords[0]);
    lng = parseFloat(coords[1])
    if (!isNaN(lat) && !isNaN(lng)) {
        myLatLng = new google.maps.LatLng(lat, lng);
    }

    let gesture = "cooperative";
    // Set up the map
    myOptions = {
        zoom: 15,
        center: myLatLng,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
        gestureHandling: gesture
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
        myOptions);

    var pinIcon = new google.maps.MarkerImage(
        "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + 'FF0000',
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        null, /* anchor is bottom center of the scaled image */
    );
    new google.maps.Marker({
        position: myLatLng,
        map,
        title: listing.address,
        icon:pinIcon
    });
    google.maps.event.trigger(map, "resize");
    var panoramaOptions = {
        disableDefaultUI: false,
        clickToGo: false,
        addressControl: false,
        zoomControl: false,
        mapTypeControl: false,
        panControl: false,
        linksControl: false,
        scrollwheel: false
    };
    panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), panoramaOptions);
    //panorama.setPanningGesturesEnabled(false);
    sv.getPanoramaByLocation(myLatLng, 50, processSVData)
        .catch(err => {

        });
}

// https://stackoverflow.com/questions/28731200/google-maps-api-v3-google-street-view-and-google-street-view-static-image
function processSVData(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
        panorama.setPano(data.location.pano);
        if (isNaN(heading))
            heading = google.maps.geometry.spherical.computeHeading(data.location.latLng, myLatLng);
        panorama.setPov({
            heading: heading,
            pitch: 0,
            zoom: 1
        });
        pano.style.display = "block"
    } else {
        err.style.display = "block";
    }
}


if (listing.coords) {
    initialize(listing.coords);
}

let stars = document.getElementsByClassName("stars");
let ratingInput = document.getElementById("ratingInput");
for (let i = 0; i < stars.length; i++) {
    stars[i].onclick = function () {
        ratingInput.value = stars[i].value;
    }
}

// let exitBtn = document.getElementById("reviewExit");
let postReview = document.getElementById("postReview");
let rHeader = document.getElementById("reviewHeader");
let showReview = document.getElementById("showReview");
let exitReview = function () {
    rHeader.style.animation = "hide .25s ease-in forwards";
    postReview.style.animation = "hide .25s ease-in forwards";
    setTimeout(() => {
        postReview.style.display = "none";
        rHeader.style.display = "none";
        showReview.style.display = "block";
    }, 250);
}

if (showReview) {
    showReview.onclick = function () {
        postReview.style.display = "block";
        rHeader.style.display = "block";
        showReview.style.display = "none";
        rHeader.style.animation = "show .5s ease-out forwards";
        postReview.style.animation = "show .5s ease-out forwards";
    }
    showReview.click();
}


let setGesture = () => {
    if (document.body.scrollHeight > document.documentElement.clientHeight) {
        gesture = "cooperative"
    }
    else {
        gesture = "greedy"
    }
    map.set('gestureHandling', gesture);
}

window.onresize = () => {
    setGesture();
}

let checkOverflow;
window.onload = () => {
    let script = document.getElementById("script");
	script.remove();
    setTimeout(function () { setGesture(); }, 500);
    checkOverflow = () => {
        var hasVScroll = window.innerWidth > document.documentElement.clientWidth;
        if (hasVScroll) {
            reviewsDiv.style.overflow = "hidden";
            window.onscroll = function (ev) {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                    reviewsDiv.style.overflow = "auto";

                }
                else {
                    reviewsDiv.style.overflow = "hidden";
                }
            };
        }
        else {
            reviewsDiv.style.overflow = "auto";
        }
    }
    checkOverflow();
}


let swapElems = function (i) {
    let temp = sortedReviews[i];
    let temp2 = sortedReviews[i + 1]
    sortedReviews[i] = sortedReviews[i + 1];
    sortedReviews[i + 1] = temp;
    let elem = temp.li;
    elem.parentNode.insertBefore(temp2.li, elem);
}

let reorderDate = function () {
    for (var i = 0; i < sortedReviews.length; i++) {
        // Last i elements are already in place  
        for (var j = 0; j < (sortedReviews.length - i - 1); j++) {
            // Checking if the item at present iteration 
            // is greater than the next iteration
            if (sortedReviews[j].li.dataset.date < sortedReviews[j + 1].li.dataset.date) {
                // If the condition is true then swap them
                swapElems(j)
            }
        }
    }
}

let reorderUpvotes = function () {
    for (var i = 0; i < sortedReviews.length; i++) {
        // Last i elements are already in place  
        for (var j = 0; j < (sortedReviews.length - i - 1); j++) {
            // Checking if the item at present iteration 
            // is greater than the next iteration
            if (sortedReviews[j].up < sortedReviews[j + 1].up) {
                // If the condition is true then swap them
                swapElems(j)
            }
        }
    }
}

let reorderStarsUp = function () {
    for (var i = 0; i < sortedReviews.length; i++) {
        // Last i elements are already in place  
        for (var j = 0; j < (sortedReviews.length - i - 1); j++) {
            // Checking if the item at present iteration 
            // is greater than the next iteration
            if (sortedReviews[j].li.dataset.stars > sortedReviews[j + 1].li.dataset.stars) {
                // If the condition is true then swap them
                swapElems(j)
            }
        }
    }
}

let reorderStarsDown = function () {
    for (var i = 0; i < sortedReviews.length; i++) {
        // Last i elements are already in place  
        for (var j = 0; j < (sortedReviews.length - i - 1); j++) {
            // Checking if the item at present iteration 
            // is greater than the next iteration
            if (sortedReviews[j].li.dataset.stars < sortedReviews[j + 1].li.dataset.stars) {
                // If the condition is true then swap them
                swapElems(j);
            }
        }
    }
}

let selectOrder = document.getElementById("selectOrder");
let currentOrder = "upvotes";
selectOrder.onchange = function () {
    if (selectOrder.value != currentOrder) {
        currentOrder = selectOrder.value;
        if (selectOrder.value == "upvotes") {
            reorderUpvotes();
        }
        else if (selectOrder.value == "date") {
            reorderDate();
        }
        else if (selectOrder.value == "starsup") {
            reorderStarsUp();
        }
        else {
            reorderStarsDown();
        }
    }
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
        if (positionFromTop - reviewsDiv.getBoundingClientRect().bottom <= 0) {
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


window.addEventListener('scroll', checkPosition);
window.addEventListener('resize', () => {
    windowHeight = window.innerHeight;
    checkOverflow();
});
reviewsDiv.addEventListener('scroll', checkPosition);

// Mobile scroll bar
if (reviewsDiv) {
    if ((('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0))) {
        reviewsDiv.classList.remove('desktop')
        reviewsDiv.classList.add('mobile');
    }
}

if (reviewsDiv) {
    if ((('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0))) {
        reviewsDiv.classList.remove('desktop')
        reviewsDiv.classList.add('mobile');
    }
}
