
var elements;
var windowHeight;

function init() {
    elements = document.querySelectorAll('.hid');
    windowHeight = window.innerHeight;
}

function checkPosition() {
    for (var i = 0; i < elements.length; i++) {
        let element = elements[i];
        var positionFromTop = elements[i].getBoundingClientRect().top;

        if (positionFromTop - windowHeight <= 0) {
            if (element.classList.contains("infoImage")) {
                setTimeout(function(){
                    element.style.position = "initial";
                }, 800);
                element.classList.add('animatetop');
            }
            else if (element.classList.contains("infoButton")){
                setTimeout(function(){
                    element.style.position = "initial";
                }, 1500);
                element.classList.add('animatebut');
            }
            else {
                setTimeout(function(){
                    element.style.position = "initial";
                }, 1000);
                element.classList.add('infotop');
            }
            element.classList.remove('hid');
            
        }
    }
}

window.addEventListener('scroll', checkPosition);
window.addEventListener('resize', () => {windowHeight = window.innerHeight;});
window.onload = function() {
    init();
    checkPosition();
}

