"use strict";

import { ListeningTest } from "../listeningTest.js";

export function displayConclusion(listeningTest: ListeningTest): void {

   document.getElementById('threshold')!.innerHTML = listeningTest.getThreshold(2).toFixed(1).toString() + 'dB';

}