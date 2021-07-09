"use strict";
export const IDS = ['A', 'B', 'C'];
let lastActiveChoice, lastChoiceEL, lastThumbEL, lastNewTrialEL;
const cursorPointer = function () {
    this.style.cursor = 'pointer';
}, cursorDefault = function () {
    this.style.cursor = 'default';
}, backgroundHover = function () {
    this.style.backgroundColor = 'lightblue';
}, backgroundDefault = function () {
    this.style.backgroundColor = '#fff';
};
window.addEventListener('DOMContentLoaded', () => {
    pointerEventsChoices();
    function preloadImageList(urls) {
        if (typeof urls === 'string')
            urls = [urls];
        urls.forEach(preloadImage);
        function preloadImage(url) {
            let img = new Image();
            img.src = url;
        }
    }
});
export function addChoicesELs(question, audioControls) {
    audioControls.setGains(false);
    hideOtherThumbs();
    setBackgroundColors();
    lastActiveChoice = null;
    return new Promise((resolve) => {
        IDS.forEach((ID) => {
            document.getElementById('choice' + ID).addEventListener('click', choiceEL);
        });
        function choiceEL(e) {
            const id = getTagChoiceId(e.target);
            setChoiceGains(id);
            hideOtherThumbs(id);
            showThumbs(id);
            setBackgroundColors(id);
            pointerEventsChoices(id);
            document.getElementById('choice' + id).removeEventListener('click', lastChoiceEL);
            if (lastActiveChoice) {
                document.getElementById('choice' + lastActiveChoice).addEventListener('click', choiceEL);
                document.getElementById('thumbUp' + lastActiveChoice).removeEventListener('click', lastThumbEL);
                document.getElementById('thumbDown' + lastActiveChoice).removeEventListener('click', lastThumbEL);
                document.getElementById('enterNewTrial').removeEventListener('click', lastNewTrialEL);
            }
            document.getElementById('enterNewTrial').addEventListener('click', newTrialEL);
            document.getElementById('thumbUp' + id).addEventListener('click', thumbEL);
            document.getElementById('thumbDown' + id).addEventListener('click', thumbEL);
            lastActiveChoice = id;
            lastChoiceEL = choiceEL;
            lastThumbEL = thumbEL;
            lastNewTrialEL = newTrialEL;
            function thumbEL(e) {
                const tag = e.target, thumbId = tag.getAttribute('id'), liked = thumbId.includes('Up'), choiceId = getTagChoiceId(e.target), correct = (choiceId === question.id);
                document.getElementById('thumbUp' + choiceId).removeEventListener('click', thumbEL);
                document.getElementById('thumbDown' + choiceId).removeEventListener('click', thumbEL);
                IDS.forEach((ID) => {
                    document.getElementById('choice' + ID).removeEventListener('click', choiceEL);
                });
                document.getElementById('enterNewTrial').removeEventListener('click', newTrialEL);
                resolve({ correct: correct, intensity: question.intensity, liked: liked });
            }
            function newTrialEL() {
                IDS.forEach((ID) => {
                    document.getElementById('choice' + ID).removeEventListener('click', choiceEL);
                });
                document.getElementById('enterNewTrial').removeEventListener('click', newTrialEL);
                document.getElementById('thumbUp' + id).removeEventListener('click', thumbEL);
                document.getElementById('thumbDown' + id).removeEventListener('click', thumbEL);
                resolve({ correct: (id === question.id), intensity: question.intensity });
            }
        }
    });
    function getTagChoiceId(target) {
        const tag = target, idHtMLtag = tag.getAttribute('id');
        let id;
        IDS.forEach((ID) => {
            if (idHtMLtag.includes(ID)) {
                id = ID;
            }
        });
        if (!id) {
            throw new Error('Tag has no valid choice id!');
        }
        return id;
    }
    function setChoiceGains(id) {
        if (id === question.id) {
            audioControls.setGains(true, question.intensity);
        }
        else {
            audioControls.setGains(false);
        }
    }
}
function showThumbs(id) {
    const thumbUp = document.getElementById('thumbUp' + id);
    thumbUp.setAttribute('src', 'img/listening-test/thumbs-up-regular.png');
    thumbUp.style.pointerEvents = 'auto';
    thumbUp.addEventListener('mouseover', function () {
        thumbUp.setAttribute('src', 'img/listening-test/thumbs-up-green.png');
    });
    thumbUp.addEventListener('mousedown', function () {
        thumbUp.setAttribute('src', 'img/listening-test/thumbs-up-active.png');
    });
    thumbUp.addEventListener('mouseout', function () {
        thumbUp.setAttribute('src', 'img/listening-test/thumbs-up-regular.png');
    });
    const thumbDown = document.getElementById('thumbDown' + id);
    thumbDown.setAttribute('src', 'img/listening-test/thumbs-down-regular.png');
    thumbDown.style.pointerEvents = 'auto';
    thumbDown.addEventListener('mouseover', function () {
        thumbDown.setAttribute('src', 'img/listening-test/thumbs-down-red.png');
    });
    thumbDown.addEventListener('mousedown', function () {
        thumbDown.setAttribute('src', 'img/listening-test/thumbs-down-active.png');
    });
    thumbDown.addEventListener('mouseout', function () {
        thumbDown.setAttribute('src', 'img/listening-test/thumbs-down-regular.png');
    });
}
function hideOtherThumbs(id) {
    IDS.forEach((ID) => {
        if (id !== ID) {
            const thumbUp = document.getElementById('thumbUp' + ID);
            if (!thumbUp) {
                throw new Error('thumbUp falsy!');
            }
            thumbUp.setAttribute('src', 'img/listening-test/thumbs-transparent.png');
            thumbUp.style.pointerEvents = 'none';
            const thumbDown = document.getElementById('thumbDown' + ID);
            if (!thumbDown) {
                throw new Error('thumbUp falsy!');
            }
            thumbDown.setAttribute('src', 'img/listening-test/thumbs-transparent.png');
            thumbDown.style.pointerEvents = 'none';
        }
    });
}
function setBackgroundColors(id) {
    IDS.forEach((ID) => {
        if (id == ID) {
            document.getElementById('choice' + ID).style.backgroundColor = '#5477e7';
        }
        else {
            document.getElementById('choice' + ID).style.backgroundColor = '#fff';
        }
    });
}
function pointerEventsChoices(id) {
    IDS.forEach((ID) => {
        const element = document.getElementById('choice' + ID);
        if (id == ID) {
            element.removeEventListener('mouseenter', cursorPointer);
            element.removeEventListener('mouseleave', cursorDefault);
            element.removeEventListener('mouseenter', backgroundHover);
            element.removeEventListener('mouseleave', backgroundDefault);
        }
        else {
            element.addEventListener('mouseenter', cursorPointer);
            element.addEventListener('mouseleave', cursorDefault);
            element.addEventListener('mouseenter', backgroundHover);
            element.addEventListener('mouseleave', backgroundDefault);
        }
    });
}
//# sourceMappingURL=afc.js.map