"use strict";

/* 

drag and drop area
alternativ sample aus verschiedenen genre auswählen: buJazzo, bhrist, kcr, jazztrio,

*/

import {
   Answer,
   Question
} from '../listeningTest.js';
import {
   IAudioControls
} from '../listeningTestAudioCtx.js';

export const IDS = ['A', 'B', 'C'] as const;

let lastActiveChoice: string | null,
   lastChoiceEL: EventListener,
   lastThumbEL: EventListener,
   lastNewTrialEL: EventListener;

const cursorPointer = function(this: any) {
   this.style.cursor = 'pointer';
},
   cursorDefault = function(this: any) {
      this.style.cursor = 'default';
   },
   backgroundHover = function(this: any) {
      this.style.backgroundColor = 'lightblue';
   },
   backgroundDefault = function(this: any) {
      this.style.backgroundColor = '#fff';
   };

   window.addEventListener('DOMContentLoaded', () => { 

      pointerEventsChoices();

      // preloadImageList([
      //    'img/listening-test/thumbs-up-regular.png',
      //    'img/listening-test/thumbs-down-regular.png',
      //    'img/listening-test/thumbs-up-green.png',
      //    'img/listening-test/thumbs-down-red.png'
      // ]);
      function preloadImageList(urls: string | string[]) {
         if(typeof urls === 'string') urls = [urls];
         urls.forEach(preloadImage)
         function preloadImage(url: string) {
            let img = new Image();
            img.src = url;
         }
      }
   });
/**
 * add eventListeners to choices and thumbs and set gains according to the given Question
 */
export function addChoicesELs(question: Question, audioControls: IAudioControls): Promise<Answer> {

   // reset gains and GUI
   audioControls.setGains(false);
   hideOtherThumbs();
   setBackgroundColors();

   lastActiveChoice = null;

   return new Promise((resolve) => {

      IDS.forEach((ID) => {
         document.getElementById('choice' + ID)!.addEventListener('click', choiceEL);
      });

      /** sets the gains according to the question, shows only thumbs of the active choice, adds EL to the thumbs: */
      function choiceEL(e: Event) {

         const id = getTagChoiceId(e.target);

         setChoiceGains(id);

         // update GUI
         hideOtherThumbs(id);
         showThumbs(id);
         setBackgroundColors(id);
         pointerEventsChoices(id);

         document.getElementById('choice' + id)!.removeEventListener('click', lastChoiceEL);

         if (lastActiveChoice) {
            // allow selecting a choice several times after selecting another choice
            document.getElementById('choice' + lastActiveChoice)!.addEventListener('click', choiceEL);
            // in case, choice was selected by user and no thumbs were clicked on the last selected choice
            document.getElementById('thumbUp' + lastActiveChoice)!.removeEventListener('click', lastThumbEL);
            document.getElementById('thumbDown' + lastActiveChoice)!.removeEventListener('click', lastThumbEL);
            // enter new trial without rating
            document.getElementById('enterNewTrial')!.removeEventListener('click', lastNewTrialEL);
         }

         document.getElementById('enterNewTrial')!.addEventListener('click', newTrialEL);

         // add EL to thumbs
         document.getElementById('thumbUp' + id)!.addEventListener('click', thumbEL);
         document.getElementById('thumbDown' + id)!.addEventListener('click', thumbEL);

         lastActiveChoice = id;
         lastChoiceEL = choiceEL;
         lastThumbEL = thumbEL;
         lastNewTrialEL = newTrialEL;

         function thumbEL(e: Event) {

            const tag = e.target as HTMLInputElement,
               thumbId = tag.getAttribute('id')!,
               liked = thumbId.includes('Up'),
               choiceId = getTagChoiceId(e.target),
               correct = (choiceId === question.id);

            document.getElementById('thumbUp' + choiceId)!.removeEventListener('click', thumbEL);
            document.getElementById('thumbDown' + choiceId)!.removeEventListener('click', thumbEL);

            IDS.forEach((ID) => {
               document.getElementById('choice' + ID)!.removeEventListener('click', choiceEL);
            });
            document.getElementById('enterNewTrial')!.removeEventListener('click', newTrialEL);

            resolve({correct: correct, intensity: question.intensity, liked: liked});
         }

         function newTrialEL(): void {
            IDS.forEach((ID) => {
               document.getElementById('choice' + ID)!.removeEventListener('click', choiceEL);
            });
            document.getElementById('enterNewTrial')!.removeEventListener('click', newTrialEL);
            document.getElementById('thumbUp' + id)!.removeEventListener('click', thumbEL);
            document.getElementById('thumbDown' + id)!.removeEventListener('click', thumbEL);

            resolve({correct: (id === question.id), intensity: question.intensity});
         }
      }
   });

   /**
    * @returns ID[foo] which is contained in the targets id
    */
   function getTagChoiceId(target: EventTarget | HTMLElement | null): string {
      const tag = target as HTMLElement,        // can be img#A, thumbsA, etc.
         idHtMLtag = tag.getAttribute('id')!;       // 'choice'+id oder 'thumbUp' + id, usw
      let id: string;                                 // 'A','B' or 'C'
      IDS.forEach((ID) => {
         if (idHtMLtag.includes(ID)) {
            id = ID;
         }
      });

      if (!id!) {throw new Error('Tag has no valid choice id!');}

      return id;
   }

   function setChoiceGains(id: string) {    // todo: flexibel in abhngigkeit von testType.signalflowIsParallel
      if (id === question.id) {
         audioControls.setGains(true, question.intensity);
      } else {
         audioControls.setGains(false);
      }
   }
}  /////////////////////////////////////   end of choice EL  ///////////////////////////////////////////////

function showThumbs(id: string): void {

   const thumbUp = document.getElementById('thumbUp' + id)!;
   thumbUp.setAttribute('src', 'img/listening-test/thumbs-up-regular.png');
   thumbUp.style.pointerEvents = 'auto';

   thumbUp.addEventListener('mouseover', function() {
      thumbUp.setAttribute('src', 'img/listening-test/thumbs-up-green.png');
   });
   thumbUp.addEventListener('mousedown', function() {
      thumbUp.setAttribute('src', 'img/listening-test/thumbs-up-active.png');
   });
   thumbUp.addEventListener('mouseout', function() {
      thumbUp.setAttribute('src', 'img/listening-test/thumbs-up-regular.png');
   });

   const thumbDown = document.getElementById('thumbDown' + id)!;
   thumbDown.setAttribute('src', 'img/listening-test/thumbs-down-regular.png');
   thumbDown.style.pointerEvents = 'auto';

   thumbDown.addEventListener('mouseover', function() {
      thumbDown.setAttribute('src', 'img/listening-test/thumbs-down-red.png');
   });
   thumbDown.addEventListener('mousedown', function() {
      thumbDown.setAttribute('src', 'img/listening-test/thumbs-down-active.png');
   });
   thumbDown.addEventListener('mouseout', function() {
      thumbDown.setAttribute('src', 'img/listening-test/thumbs-down-regular.png');
   });
}
function hideOtherThumbs(id?: string): void {
   IDS.forEach((ID) => {
      if (id !== ID) {

         const thumbUp = document.getElementById('thumbUp' + ID)!;
         if (!thumbUp) {throw new Error('thumbUp falsy!');}
         thumbUp.setAttribute('src', 'img/listening-test/thumbs-transparent.png');
         thumbUp.style.pointerEvents = 'none';

         const thumbDown = document.getElementById('thumbDown' + ID)!;
         if (!thumbDown) {throw new Error('thumbUp falsy!');}
         thumbDown.setAttribute('src', 'img/listening-test/thumbs-transparent.png');
         thumbDown.style.pointerEvents = 'none';
      }
   });
}

function setBackgroundColors(id?: string): void {
   IDS.forEach((ID) => {
      if (id == ID) {
         document.getElementById('choice' + ID)!.style.backgroundColor = '#5477e7';
      } else {
         document.getElementById('choice' + ID)!.style.backgroundColor = '#fff';
      }
   });
}
function pointerEventsChoices(id?: string): void {
   IDS.forEach((ID) => {
      const element = document.getElementById('choice' + ID)!;
      if (id == ID) {
         element.removeEventListener('mouseenter', cursorPointer);
         element.removeEventListener('mouseleave', cursorDefault);

         element.removeEventListener('mouseenter', backgroundHover);
         element.removeEventListener('mouseleave', backgroundDefault);
      } else {
         element.addEventListener('mouseenter', cursorPointer);
         element.addEventListener('mouseleave', cursorDefault);

         element.addEventListener('mouseenter', backgroundHover);
         element.addEventListener('mouseleave', backgroundDefault);
      }
   });
}