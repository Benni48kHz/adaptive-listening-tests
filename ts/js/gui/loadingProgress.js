"use strict";
import { getSVGElement } from './helper.js';
let indexProgressStep = -20, loadingProgressStepAmount, loadingProgressBar, loadingProgressBarWidth, loadingProgressBarHeight, progressStepWidth, actualProgress;
export function initializeProgressBar(count) {
    loadingProgressStepAmount = count;
    loadingProgressBar = document.getElementById('loadingProgressBarSVG');
    loadingProgressBarWidth = +(loadingProgressBar.getAttribute('width'));
    loadingProgressBarHeight = +(loadingProgressBar.getAttribute('height'));
    progressStepWidth = Math.floor(loadingProgressBarWidth / loadingProgressStepAmount);
    actualProgress = getSVGElement('rect', 'loadingProgressBarSVGElement' + indexProgressStep, indexProgressStep, -(loadingProgressBarHeight / 2), progressStepWidth, loadingProgressBarHeight, '#0e2369');
    loadingProgressBar.appendChild(actualProgress);
    indexProgressStep += progressStepWidth;
}
export function updateLoadingProgressBar() {
    indexProgressStep += progressStepWidth;
    actualProgress.setAttribute('width', indexProgressStep.toString());
}
//# sourceMappingURL=loadingProgress.js.map