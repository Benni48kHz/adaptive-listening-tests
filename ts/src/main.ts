"use strict";

import {createAudioCtx, IAudioControls} from './listeningTestAudioCtx.js';
import {ListeningTest} from './listeningTest.js';
import {addAudioControlsEL} from './gui/audioControlsEL.js';
import {displayConclusion} from './gui/conclusion.js';
import {TestType} from './testType.js';


let userFile: File;

window.addEventListener('DOMContentLoaded', function() {

   if (!check()) {
      alert('Dieser Hörversuch ist in diesem Browser nicht lauffähig. Bitte probieren Sie es in einem aktuellen Browser nocheinmal.');
   }

   /*     window.onbeforeunload = function() {
           return 'Möchten Sie die Seite wirklich verlassen?';
       };
       */
   document.getElementById('cancel')!.addEventListener('click', function() {
      const cancel = window.confirm('Um den Hörversuch abzubrechen, klicken Sie auf ok. Der bisherige Fortschritt geht dabei verloren.');
      if (cancel === false) {return;}
      else {window.location.href = "Hörversuche.php";}
   });

   document.getElementById('dropArea')!.addEventListener('drop', function(event) {
      userFile = event.dataTransfer!.files[0];
      if (userFile.type.includes('audio')) {
         displayUserFile(userFile);
      }
   });

   document.getElementById('fileUpload')!.addEventListener('change', function(event: Event) {
      const target = event.target as HTMLInputElement,
         files = target.files;
      userFile = files![0];
      if (userFile.type.includes('audio')) {
         displayUserFile(userFile);
      }
   });

   document.getElementById('start')!.addEventListener('click', async function() {

      try {
         checkUserFile(userFile);
      } catch (err) {
         console.log(err);
         return;
      }

      const testType: TestType = {
         signalType: 'distortion',
         signalflowIsParallel: true,
         intensityIsFactorAdjusted: true,
      }

      const audioControls = await createAudioCtx(testType, userFile);
      if (audioControls instanceof Error) {
         alert('Hoppla! Da ist etwas beim Lesen der Audiodatei schiefgelaufen. Bitte versuchen Sie es nach Möglichkeit mit einer kürzeren Audiodatei erneut.');
         window.location.href = "Hörversuche.php";
         console.log(audioControls);
         return;
      }

      await addAudioControlsEL(audioControls);

      document.getElementById('loadingScreen')!.style.display = 'none';
      document.getElementById('listeningTest')!.style.display = 'block';

      const maxTurningPoints = 5,
         step = [ListeningTest.getFactor(-4),
         ListeningTest.getFactor(-2), ListeningTest.getFactor(-2),
         ListeningTest.getFactor(-1), ListeningTest.getFactor(-1)],
         startIntensity = ListeningTest.getFactor(-10),
         listeningTest = new ListeningTest(testType, 2, 1, step, maxTurningPoints, startIntensity);

      await listeningTest.run(audioControls);

      document.getElementById('listeningTest')!.style.display = 'none';
      document.getElementById('conclusion')!.style.display = 'block';

      displayConclusion(listeningTest);
   });
});

/**
 * throws Error if file is not an audio file
 * @param file audio file
 */
function checkUserFile(file?: File): void {
   if (file && (file.type.includes('audio'))) {
      document.getElementById('dropArea')!.style.display = 'none';
      document.getElementById('navbar')!.style.display = 'none';
      document.getElementById('loadingScreen')!.style.display = 'block';
   } else {
      alert('Bitte Audiodatei einfügen!');
      throw new Error('Userfile not valid!');
   }
}

function displayUserFile(file: File): void {
   document.getElementById('checkMark')!.style.display = 'block'
   document.getElementById('fileName')!.innerText = file.name;
   document.getElementById('userFile')!.style.display = 'block';
}

function check() {
   if (typeof Symbol == "undefined") return false;
   try {
      eval("class Foo {}");
      eval("var bar = (x) => x+1");
   } catch (e) {return false;}

   return true;
}