"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createAudioCtx } from './listeningTestAudioCtx.js';
import { ListeningTest } from './listeningTest.js';
import { addAudioControlsEL } from './gui/audioControlsEL.js';
import { displayConclusion } from './gui/conclusion.js';
let userFile;
window.addEventListener('DOMContentLoaded', function () {
    if (!check()) {
        alert('Dieser Hörversuch ist in diesem Browser nicht lauffähig. Bitte probieren Sie es in einem aktuellen Browser nocheinmal.');
    }
    document.getElementById('cancel').addEventListener('click', function () {
        const cancel = window.confirm('Um den Hörversuch abzubrechen, klicken Sie auf ok. Der bisherige Fortschritt geht dabei verloren.');
        if (cancel === false) {
            return;
        }
        else {
            window.location.href = "Hörversuche.php";
        }
    });
    document.getElementById('dropArea').addEventListener('drop', function (event) {
        userFile = event.dataTransfer.files[0];
        if (userFile.type.includes('audio')) {
            displayUserFile(userFile);
        }
    });
    document.getElementById('fileUpload').addEventListener('change', function (event) {
        const target = event.target, files = target.files;
        userFile = files[0];
        if (userFile.type.includes('audio')) {
            displayUserFile(userFile);
        }
    });
    document.getElementById('start').addEventListener('click', function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                checkUserFile(userFile);
            }
            catch (err) {
                console.log(err);
                return;
            }
            const testType = {
                signalType: 'distortion',
                signalflowIsParallel: true,
                intensityIsFactorAdjusted: true,
            };
            const audioControls = yield createAudioCtx(testType, userFile);
            if (audioControls instanceof Error) {
                alert('Hoppla! Da ist etwas beim Lesen der Audiodatei schiefgelaufen. Bitte versuchen Sie es nach Möglichkeit mit einer kürzeren Audiodatei erneut.');
                window.location.href = "Hörversuche.php";
                console.log(audioControls);
                return;
            }
            yield addAudioControlsEL(audioControls);
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('listeningTest').style.display = 'block';
            const maxTurningPoints = 5, step = [ListeningTest.getFactor(-4),
                ListeningTest.getFactor(-2), ListeningTest.getFactor(-2),
                ListeningTest.getFactor(-1), ListeningTest.getFactor(-1)], startIntensity = ListeningTest.getFactor(-10), listeningTest = new ListeningTest(testType, 2, 1, step, maxTurningPoints, startIntensity);
            yield listeningTest.run(audioControls);
            document.getElementById('listeningTest').style.display = 'none';
            document.getElementById('conclusion').style.display = 'block';
            displayConclusion(listeningTest);
        });
    });
});
function checkUserFile(file) {
    if (file && (file.type.includes('audio'))) {
        document.getElementById('dropArea').style.display = 'none';
        document.getElementById('navbar').style.display = 'none';
        document.getElementById('loadingScreen').style.display = 'block';
    }
    else {
        alert('Bitte Audiodatei einfügen!');
        throw new Error('Userfile not valid!');
    }
}
function displayUserFile(file) {
    document.getElementById('checkMark').style.display = 'block';
    document.getElementById('fileName').innerText = file.name;
    document.getElementById('userFile').style.display = 'block';
}
function check() {
    if (typeof Symbol == "undefined")
        return false;
    try {
        eval("class Foo {}");
        eval("var bar = (x) => x+1");
    }
    catch (e) {
        return false;
    }
    return true;
}
//# sourceMappingURL=main.js.map