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
import { addChoicesELs, IDS } from "./gui/afc.js";
import { displayNewTrial } from "./gui/helper.js";
export class ListeningTest {
    constructor(testType, down, up, step, maxTurningPoints, _intensity = 1) {
        this.testType = testType;
        this.down = down;
        this.up = up;
        this.step = step;
        this.maxTurningPoints = maxTurningPoints;
        this._intensity = _intensity;
        this.answers = [];
        this.question = { intensity: this._intensity, id: this.getRandomId() };
        this.turningPoints = [];
        this._goingDown = true;
    }
    static getFactor(gain_dB) {
        return Math.pow(10, gain_dB / 20);
    }
    static getDecibels(factor) {
        return 20 * Math.log10(factor);
    }
    run(audioControls) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let question = this.getQuestion(), answer;
            while (this.turningPoints.length < this.maxTurningPoints) {
                answer = yield addChoicesELs(question, audioControls);
                question = this.getQuestion(answer);
                displayNewTrial();
            }
            audioControls.stop();
            resolve();
        }));
    }
    getQuestion(answer) {
        if (answer) {
            this.answers.push(answer);
            const length = this.answers.length;
            let decrease = false, increase = false;
            console.log('Trial ' + length + ':');
            console.log('correct: ' + answer.correct + ', intensity [dB]: ' + ListeningTest.getDecibels(this._intensity).toFixed(2) + ', liked: ' + answer.liked);
            if (length >= this.down) {
                let correctCount = this.answers.map(answer => answer.correct).reverse().indexOf(false);
                correctCount = (correctCount === -1) ? length : correctCount;
                if ((correctCount >= this.down) && (correctCount % this.down === 0)) {
                    decrease = true;
                }
            }
            if (length >= this.up) {
                let incorrectCount = this.answers.map(answer => answer.correct).reverse().indexOf(true);
                incorrectCount = (incorrectCount === -1) ? length : incorrectCount;
                if ((incorrectCount >= this.up) && (incorrectCount % this.up === 0)) {
                    increase = true;
                }
            }
            if (decrease)
                this._intensity = (this.testType.intensityIsFactorAdjusted) ? (this._intensity * this.step[this.turningPoints.length]) : (this._intensity + this.step[this.turningPoints.length]);
            if (increase)
                this._intensity = (this.testType.intensityIsFactorAdjusted) ? (this._intensity / this.step[this.turningPoints.length]) : (this._intensity - this.step[this.turningPoints.length]);
            if (increase !== decrease) {
                if (this._goingDown && increase) {
                    this.turningPoints.push(answer);
                    this._goingDown = false;
                }
                else if (!this._goingDown && decrease) {
                    this.turningPoints.push(answer);
                    this._goingDown = true;
                }
            }
        }
        else if (this.answers.length !== 0) {
            throw new Error('newTrial() expects Answer, if it is not the first trial!');
        }
        return { intensity: this._intensity, id: this.getRandomId() };
    }
    getThreshold(count) {
        const length = this.turningPoints.length;
        if (length < 2) {
            throw new Error('Not enough turningPoints available!');
        }
        let threshold = 0;
        for (let i = length - 1; i >= length - count; i--) {
            threshold += this.turningPoints[i].intensity;
        }
        threshold = threshold / count;
        return ListeningTest.getDecibels(threshold);
    }
    getRandomId() {
        return IDS[Math.floor(IDS.length * Math.random())];
    }
}
//# sourceMappingURL=listeningTest.js.map