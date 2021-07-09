"use strict";

import {
   IAudioControls
} from '../listeningTestAudioCtx.js';
import {
   getSVGElement,
   updateSVGColor,
   convertElapsedTime
} from './helper.js'

// todo: evtl graphikparameter als object übergeben
export function addAudioControlsEL(audioControls: IAudioControls): Promise<void> {

   return new Promise((resolve) => {

      {   // Volume
         const volumeControl = document.getElementById('volume') as HTMLInputElement;
         addEventListener('input', function() {
            const volumeControlInput = volumeControl.valueAsNumber;
            audioControls.setGainMaster(false, volumeControlInput);
         });
      }

      {  //////////////////// duration, elapsedTime, Play/Pause /////////////////////////
         const audioPlayPause = document.getElementById('audioPlayPause')!;

         // duration
         const durationSpan = document.getElementById('duration')!;
         durationSpan.innerHTML = convertElapsedTime(audioControls.getBufferDuration());
         // elapsedTime
         const elapsedTimeSpan = document.getElementById('elapsedTime')!;
         updateElapsedTimeSpan();              // update when audioControlsEL ist called
         setInterval(updateElapsedTimeSpan, 1000); // maybe add promise which is fullfilled in audioControls.seek and set updateInterval to 1000
         function updateElapsedTimeSpan() {
            elapsedTimeSpan.innerHTML = convertElapsedTime(audioControls.getElapsedTime());
         }

         // Play+Pause      todo: bei endOfPlayback button updaten
         audioPlayPause.addEventListener('click', playPause);
         function playPause() {
            if (audioControls.getIsPlaying() === false) {
               audioPlayPause.innerHTML = '<h2>Pause</h2>';
               audioControls.play();
            } else {
               audioPlayPause.innerHTML = '<h2>Play</h2>';
               audioControls.pause();
               // hier könnte noch status von toggle pause/stop berücksichtigt werden
            }
         }
      }

      {  //////////////////////////////////// svg Seeking ////////////////////////////////////////////////
         const cursorColor = 'black',
            cursorWidth = 2,
            elapsedEnvelopeColor = 'grey',
            envelopeColor = 'lightgrey',
            seekingBar = document.getElementById('seekingBar') as unknown as SVGElement,
            seekingBarWidth = +(seekingBar.getAttribute('width')!),
            seekingBarHeight = +(seekingBar.getAttribute('height')!),
            stripInterval = 2,        // strip every nth pixels, stripInterval=1 means no gaps
         /////////////////// todo: hier fehlt noch Rundung!!!! ///////////////////////////////////////////
            seekingBarStripsCount = seekingBarWidth / stripInterval,
            envelope = audioControls.getEnvelope(seekingBarStripsCount, 0);

         // Normalization to seekingBarHeight
         let max = 0;
         envelope.forEach((value) => {
            if (value > max) {max = value;}
         });
         const normalizationFactor = 1 / max * seekingBarHeight;

         // draw envelope
         let fragment = document.createDocumentFragment();
         for (let i = (seekingBarStripsCount - 1); i >= 0; i--) {
            // for (let i = 0; i < seekingBarStripsCount; i++) {
            const height = envelope[i] * normalizationFactor;

            fragment.appendChild(getSVGElement(
               'rect', 'rect' + i,
               i * stripInterval, -(height / 2),
               1, height,
               envelopeColor
            ));
         }
         seekingBar.appendChild(fragment);

         {  // update GUI / seeking: play cursor, envelope color
            let elapsedTime = audioControls.getElapsedTime();
            const duration = audioControls.getBufferDuration();
            let elapsedTimeIndex = Math.floor(elapsedTime / duration * seekingBarWidth);
            const updateInterval = duration / seekingBarWidth * 1000;

            seekingBar.appendChild(getSVGElement(
               'rect', 'playCursor',
               elapsedTimeIndex, -(seekingBarHeight / 2),
               cursorWidth, seekingBarHeight,
               cursorColor,
            ));

            setInterval(updateSeekingBar, updateInterval);
            const cursor = document.getElementById('playCursor')!;
            function updateSeekingBar(): void {

               elapsedTime = audioControls.getElapsedTime();
               elapsedTimeIndex = Math.floor(elapsedTime / duration * seekingBarWidth);

               // update cursor
               cursor.setAttribute('x', elapsedTimeIndex.toString());

               // update envelope color
               if ((elapsedTimeIndex % stripInterval) === 0) {
                  const stripId = ((elapsedTimeIndex / stripInterval) < seekingBarStripsCount) ? (elapsedTimeIndex / stripInterval) : (seekingBarStripsCount - 1);
                  updateSVGColor('rect' + stripId, elapsedEnvelopeColor);
               }
            }

            {  // seeking
               const svg = document.getElementById('seekingBar') as unknown as SVGSVGElement,
                  pt = svg.createSVGPoint();

               svg.addEventListener('mousedown', updatePlayCursor);

               svg.addEventListener('mousedown', () => {
                  svg.addEventListener('mousemove', updatePlayCursor);
               });
               document.addEventListener('mouseup', () => {
                  svg.removeEventListener('mousemove', updatePlayCursor);
               });

               function updatePlayCursor(event: MouseEvent) {

                  pt.x = event.clientX;
                  // The cursor point, translated into svg coordinates, cursorpt.x contains x coordinate
                  const cursorpt = pt.matrixTransform(svg.getScreenCTM()!.inverse());

                  audioControls.seek(cursorpt.x / seekingBarWidth * duration);

                  elapsedTime = audioControls.getElapsedTime();
                  elapsedTimeIndex = Math.floor(elapsedTime / duration * seekingBarWidth);

                  // GUI
                  for (let i = 0; i < seekingBarStripsCount; i++) {
                     updateSVGColor('rect' + i, (i <= (elapsedTimeIndex / stripInterval)) ? elapsedEnvelopeColor : envelopeColor);
                  }

                  cursor.setAttribute('x', (elapsedTimeIndex < (seekingBarWidth - cursorWidth)) ? elapsedTimeIndex.toString() : (seekingBarWidth - cursorWidth - 1).toString());

                  const elapsedTimeSpan = document.getElementById('elapsedTime')!;
                  elapsedTimeSpan.innerHTML = convertElapsedTime(elapsedTime);
               }
            }
         }
      }

      resolve();
   });
}