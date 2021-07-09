"use strict";

import {addChoicesELs, IDS} from "./gui/afc.js";
import {displayNewTrial} from "./gui/helper.js";
import {IAudioControls} from "./listeningTestAudioCtx.js";
import {TestType} from "./testType.js";


export interface Answer {
   readonly correct: boolean,
   /** of the stimulus in between 0 and 1 
    * if testType.signalflowIsParallel: ratio of the wet intensity to the dry intensity
   */
   readonly intensity: number,
   readonly liked?: boolean,
}
export interface Question {
   /** of the stimulus in between 0 and 1 */
   readonly intensity: number,
   /** of the alternated test stimulus */
   readonly id: string,
}

export class ListeningTest {

   answers: Answer[];
   question: Question;
   turningPoints: Answer[];
   private _goingDown: boolean;    // true until first increase of _intensity

   constructor(
      readonly testType: TestType,  // todo: not implemented yet
      readonly down: number,
      readonly up: number,
      readonly step: number[],  // between 0 and 1 in case it is a factor or any negative number if it is not, TestType.intensityIsFactorAdjusted: boolean
      readonly maxTurningPoints: number,

      private _intensity: number = 1,
   ) {
      this.answers = [];
      this.question = {intensity: this._intensity, id: this.getRandomId()};   // first question
      this.turningPoints = [];
      this._goingDown = true;
   }

   static getFactor(gain_dB: number): number {
      return Math.pow(10, gain_dB / 20);
   }
   static getDecibels(factor: number): number {
      return 20 * Math.log10(factor);
   }

   run(audioControls: IAudioControls): Promise<void> {
      return new Promise(async (resolve) => {
         let question: Question = this.getQuestion(),
            answer: Answer;

         while (this.turningPoints.length < this.maxTurningPoints) {
            answer = await addChoicesELs(question, audioControls);
            question = this.getQuestion(answer);
            displayNewTrial();
         }

         audioControls.stop();

         resolve();
      });
   }

   getQuestion(answer?: Answer): Question {
      if (answer) {
         this.answers.push(answer);

         const length = this.answers.length;
         let decrease = false,
            increase = false;

         console.log('Trial ' + length + ':');
         console.log('correct: ' + answer.correct + ', intensity [dB]: ' + ListeningTest.getDecibels(this._intensity).toFixed(2) + ', liked: ' + answer.liked);

         // let's find out if we have to decrease the intensity
         if (length >= this.down) {
            let correctCount = this.answers.map(answer => answer.correct).reverse().indexOf(false);
            correctCount = (correctCount === -1) ? length : correctCount;     // in case there is no wrong answer
            if ((correctCount >= this.down) && (correctCount % this.down === 0)) {
               decrease = true;
            }
         }

         // or if we should increase it
         if (length >= this.up) {
            let incorrectCount = this.answers.map(answer => answer.correct).reverse().indexOf(true);
            incorrectCount = (incorrectCount === -1) ? length : incorrectCount;  // in case there is no wrright answer
            if ((incorrectCount >= this.up) && (incorrectCount % this.up === 0)) {
               increase = true;
            }
         }

         // determine new intensity
         if (decrease) this._intensity = (this.testType.intensityIsFactorAdjusted) ? (this._intensity * this.step[this.turningPoints.length]) : (this._intensity + this.step[this.turningPoints.length]);
         if (increase) this._intensity = (this.testType.intensityIsFactorAdjusted) ? (this._intensity / this.step[this.turningPoints.length]) : (this._intensity - this.step[this.turningPoints.length]);

         // maybe add new answer to turningPoints[]:
         if (increase !== decrease) {       // check, that _intensity was changed
            if (this._goingDown && increase) {
               this.turningPoints.push(answer);
               this._goingDown = false;
            }
            else if (!this._goingDown && decrease) {
               this.turningPoints.push(answer);
               this._goingDown = true;
            }
         }

      } else if (this.answers.length !== 0) {
         throw new Error('newTrial() expects Answer, if it is not the first trial!');
      }

      return {intensity: this._intensity, id: this.getRandomId()};
   }

   /**
    * @param count of the last turningPoints to consider
    * @returns threshold in dB
    */
   getThreshold(count: number): number {
      const length = this.turningPoints.length;
      if (length < 2) {throw new Error('Not enough turningPoints available!');}

      let threshold = 0;
      for (let i = length - 1; i >= length - count; i--) {
         threshold += this.turningPoints[i].intensity;
      }

      threshold = threshold / count;
      return ListeningTest.getDecibels(threshold);
   }

   private getRandomId(): string {
      return IDS[Math.floor(IDS.length * Math.random())];
   }
}