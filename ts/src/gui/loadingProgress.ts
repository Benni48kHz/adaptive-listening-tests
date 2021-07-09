"use strict";

import {
   getSVGElement
} from './helper.js';

/////////////////////////////////////// nicht in Verwendung!!!!! ///////////////////////////////

let indexProgressStep = -20,      // offset = 2 * border-radius
   loadingProgressStepAmount: number,
   loadingProgressBar: SVGElement,
   loadingProgressBarWidth: number,
   loadingProgressBarHeight: number,
   progressStepWidth: number,
   actualProgress: SVGElement;


export function initializeProgressBar(count: number): void {

   loadingProgressStepAmount = count;

   loadingProgressBar = document.getElementById('loadingProgressBarSVG') as unknown as SVGElement;

   loadingProgressBarWidth = +(loadingProgressBar.getAttribute('width')!);
   loadingProgressBarHeight = +(loadingProgressBar.getAttribute('height')!);
   progressStepWidth = Math.floor(loadingProgressBarWidth / loadingProgressStepAmount);

   actualProgress = getSVGElement(
      'rect', 'loadingProgressBarSVGElement' + indexProgressStep,
      indexProgressStep, -(loadingProgressBarHeight / 2),
      progressStepWidth, loadingProgressBarHeight,
      '#0e2369'
   );

   loadingProgressBar.appendChild(actualProgress);

   indexProgressStep += progressStepWidth;
}

export function updateLoadingProgressBar(): void {

   indexProgressStep += progressStepWidth;

   actualProgress.setAttribute('width', indexProgressStep.toString());
}
