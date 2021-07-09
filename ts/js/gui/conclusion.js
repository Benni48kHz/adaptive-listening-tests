"use strict";
export function displayConclusion(listeningTest) {
    document.getElementById('threshold').innerHTML = listeningTest.getThreshold(2).toFixed(1).toString() + 'dB';
}
//# sourceMappingURL=conclusion.js.map