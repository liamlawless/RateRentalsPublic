
let buttons = document.getElementsByName("delete");



let reviewsDiv = document.getElementById("reviews");
let vari = (document.getElementById('variableJSON'));
let user = JSON.parse(vari.innerHTML);
vari.remove();

let hide = function (i) {
    for (let j = 0; j < listings.length; j++) {
        if (j != i) {
            listings[j].style.display = "block";
            postReviews[j].style.display = "none";
        }
    }
    listings[i].style.display = "none";
    postReviews[i].style.display = "block";
}
let lis = document.getElementsByName("listing");
let editBtns = document.getElementsByName("edit");
let listings = document.getElementsByName("view");
let postReviews = document.getElementsByName("postReview");
let titleInputs = document.getElementsByName("titleInput");
let titles = document.getElementsByName("title");
let dates = document.getElementsByName("date");
let stars = document.getElementsByName("stars");
let comments = document.getElementsByName("comments");
let starsInputs = document.getElementsByName("starsInput");
let ratingInputs = document.getElementsByName("ratingInput");
let commentsAreas = document.getElementsByName("commentsArea");
let cancels = document.getElementsByName("cancel");
let confirms = document.getElementsByName("confirm");
let adds = document.getElementsByName("address");
let deletes = document.getElementsByName("delete");
let deleteAcc = document.getElementById("deleteAcc");
let done = () => {
    let afterListings = document.getElementsByName("listing");
    for (let i = 0; i < afterListings.length - 1; i++) {
        for (let j = 0; j < afterListings.length - i - 1; j++) {
            let date1 = new Date(lis[j].dataset.date);
            let date2 = new Date(lis[j + 1].dataset.date);
            if (date1 <= date2) {
                let temp = lis[j + 1];
                lis[j + 1] = lis[j];
                lis[j] = temp;
                lis[j].parentNode.insertBefore(lis[j + 1], lis[j]);
            }
        }
    }
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].onclick = function () {
            hide(i);

            let starz = document.getElementsByClassName("stars");
            let starBtns = document.getElementsByName("starBtn")
            for (let j = 0; j < 5; j++) {
                starBtns[i * 5 + j].onclick = function () {
                    ratingInputs[i].value = starz[i * 5 + j].value;
                    starz[i * 5 + j].checked = true;
                    for (let c = 0; c < 5; c++) {
                        if (c != j) {
                            starz[i * 5 + c].checked = false;
                        }
                    }
                }
            }


            titleInputs[i].placeholder = "";
            titleInputs[i].value = titles[i].dataset.title;
            let starLabel = document.getElementsByName("star" + Math.floor(stars[i].dataset.stars))[i];
            starLabel.checked = true;
            commentsAreas[i].innerHTML = comments[i].dataset.comments;
            cancels[i].onclick = () => {
                listings[i].style.display = "block";
                postReviews[i].style.display = "none";
            }
            confirms[i].onclick = () => {
                if (titleInputs[i].value.length > 25 || titleInputs[i].value.length < 3) {
                    return;
                }
                if (ratingInputs[i].value < 0 || ratingInputs[i].value > 5 || commentsAreas[i].value.length > 3000) {
                    return;
                }
                fetch('/users/profile/editReview', {
                    method: 'put',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: deletes[i].dataset.reviewid,
                        listingId: deletes[i].dataset.listingid,
                        title: titleInputs[i].value,
                        stars: ratingInputs[i].value,
                        oldStars: stars[i].dataset.stars,
                        comments: commentsAreas[i].value
                    })
                }).then(res => {
                    if (res.ok) {
                        res.json().then(function (review) {
                            // After stuff here
                            window.location.reload(true)
                        });
                    }
                })
            }

        }
    }
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function () {
            let confirm = false;
            sweetAlert(
                {
                    title: "Are you sure?",
                    text: "You are deleting the review for " + buttons[i].dataset.listingadd,
                    icon: "warning",
                    buttons: true,
                    dangerMode: true
                }
            ).then((confirm) => {
                if (confirm) {
                    swal("Your review has been deleted!", {
                        icon: "success",
                    });
                    // Delete an entry
                    fetch('/users/profile/delReview', {
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            rid: buttons[i].value,
                            listingId: buttons[i].dataset.listingid,
                            uid: buttons[i].dataset.uid,
                            rating: buttons[i].dataset.rating
                        })
                    })
                        .then(res => {
                            //if (res.ok) return res.json()
                        })
                        .then(response => {
                            if (response === 'No reviews to delete') {
                                alert('No more reviews to delete')
                            } else {
                                lis[i].remove();
                            }
                        })

                } else {
                    return false;
                }
            })
        }
    }
    init();
    checkPosition();
}
let dones = 0;
for (let i = 0; i < user.reviews.length; i++) {
    fetch('/listings/listing/getreview', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: user.reviews[i].reviewId
        })
    }).then(res => {
        if (res.ok) {
            res.json().then(function (review) {
                dates[i].innerHTML = review.date;
                lis[i].dataset.date = review.date;
                dates[i].style.fontSize = ".9em";
                let a = document.getElementById("a" + i);
                a.href = "/listings/listing/" + review.listingId;
                a.innerHTML = review.listingAdd;
                let del = document.getElementById('del' + i);
                del.value = review._id;
                del.setAttribute("data-listingid", review.listingId);
                del.setAttribute("data-uid", user._id);
                del.setAttribute("data-rating", review.stars);
                del.setAttribute("data-listingadd", review.listingAdd);
                del.setAttribute("data-reviewid", review._id)
                let title = titles[i];
                title.innerHTML = review.title;
                title.setAttribute("data-title", review.title);
                if (!review.title) {
                    title.hidden = true;
                }
                let star = stars[i];
                // star.innerHTML = review.stars;
                star.setAttribute("data-stars", review.stars);

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
                let starx = document.createElement("span");
                starx.innerHTML = "★★★★★";
                rating.appendChild(starx);
                rating.style = "font-size: 20px;background: linear-gradient(to right, #FFEA00, #FFEA00 20%, #000 1%, #000 99%);background-clip: text;-webkit-background-clip: text;color: rgba(0,0,0,0);text-shadow: 2px 2px 2px rgba(0,0,0,0.2);"
                const fill = value * 20;
                rating.style.backgroundImage = `linear-gradient(to right,#FFEA00, #FFEA00, ${fill}%, #000 1%, #000 99%)`;
                rating.setAttribute('aria-label', 'Rating: ' + value + ' of 5');
                rating.innerHTML = starx.innerHTML.replace(/\s/gm, '');
                rating.style.padding = "0px 10px 0px 0px";
                stars[i].appendChild(rating);


                let comment = comments[i];
                comment.innerHTML = review.comments.substring(0, MED_COMMENT);

                let expand = document.createElement("a");
                expand.innerHTML = "show more";
                expand.classList.add("expand");
                if (review.comments.length > MED_COMMENT) {
                    comment.appendChild(expand);
                }

                expand.onclick = () => {
                    if (expand.innerHTML == "show more") {
                        comment.innerText = review.comments;
                        comment.appendChild(expand)
                        expand.innerHTML = "show less";
                    }
                    else {
                        comment.innerText = review.comments.substring(0, MED_COMMENT);
                        comment.appendChild(expand)
                        expand.innerHTML = "show more";
                    }
                }
                comment.setAttribute("data-comments", review.comments);
                if (!review.comments) {
                    comment.hidden = true;
                }
                dones++;
                if (dones == user.reviews.length) {
                    done();
                }
            });
        }
    }).catch(function (error) {
        console.log('Fetch Error:', error);
    });
}

deleteAcc.onclick = function () {
    sweetAlert(
        {
            title: "Are you sure?",
            text: "You are deleting your account and your reviews forever",
            icon: "warning",
            buttons: true,
            dangerMode: true
        }
    ).then((confirm) => {
        if (confirm) {
            // Delete an entry
            fetch('/users/profile/delacc', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' }
            }).then(res => {
                window.location.href = "/"
            }).catch(function (error) {
                console.log('Fetch Error:', error);
            });
        } else {
            return false;
        }
    });
}

let elements;
let windowHeight;

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


let checkOverflow;
window.onload = () => {
    checkOverflow = () => {
        var hasVScroll = window.innerWidth > document.documentElement.clientWidth;
        if(hasVScroll){
            reviewsDiv.style.overflow = "hidden";
            window.onscroll = function(ev) {
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
