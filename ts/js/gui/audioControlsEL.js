"use strict";
import { getSVGElement, updateSVGColor, convertElapsedTime } from './helper.js';
export function addAudioControlsEL(audioControls) {
    return new Promise((resolve) => {
        {
            const volumeControl = document.getElementById('volume');
            addEventListener('input', function () {
                const volumeControlInput = volumeControl.valueAsNumber;
                audioControls.setGainMaster(false, volumeControlInput);
            });
        }
        {
            const audioPlayPause = document.getElementById('audioPlayPause');
            const durationSpan = document.getElementById('duration');
            durationSpan.innerHTML = convertElapsedTime(audioControls.getBufferDuration());
            const elapsedTimeSpan = document.getElementById('elapsedTime');
            updateElapsedTimeSpan();
            setInterval(updateElapsedTimeSpan, 1000);
            function updateElapsedTimeSpan() {
                elapsedTimeSpan.innerHTML = convertElapsedTime(audioControls.getElapsedTime());
            }
            audioPlayPause.addEventListener('click', playPause);
            function playPause() {
                if (audioControls.getIsPlaying() === false) {
                    audioPlayPause.innerHTML = '<h2>Pause</h2>';
                    audioControls.play();
                }
                else {
                    audioPlayPause.innerHTML = '<h2>Play</h2>';
                    audioControls.pause();
                }
            }
        }
        {
            const cursorColor = 'black', cursorWidth = 2, elapsedEnvelopeColor = 'grey', envelopeColor = 'lightgrey', seekingBar = document.getElementById('seekingBar'), seekingBarWidth = +(seekingBar.getAttribute('width')), seekingBarHeight = +(seekingBar.getAttribute('height')), stripInterval = 2, seekingBarStripsCount = seekingBarWidth / stripInterval, envelope = audioControls.getEnvelope(seekingBarStripsCount, 0);
            let max = 0;
            envelope.forEach((value) => {
                if (value > max) {
                    max = value;
                }
            });
            const normalizationFactor = 1 / max * seekingBarHeight;
            let fragment = document.createDocumentFragment();
            for (let i = (seekingBarStripsCount - 1); i >= 0; i--) {
                const height = envelope[i] * normalizationFactor;
                fragment.appendChild(getSVGElement('rect', 'rect' + i, i * stripInterval, -(height / 2), 1, height, envelopeColor));
            }
            seekingBar.appendChild(fragment);
            {
                let elapsedTime = audioControls.getElapsedTime();
                const duration = audioControls.getBufferDuration();
                let elapsedTimeIndex = Math.floor(elapsedTime / duration * seekingBarWidth);
                const updateInterval = duration / seekingBarWidth * 1000;
                seekingBar.appendChild(getSVGElement('rect', 'playCursor', elapsedTimeIndex, -(seekingBarHeight / 2), cursorWidth, seekingBarHeight, cursorColor));
                setInterval(updateSeekingBar, updateInterval);
                const cursor = document.getElementById('playCursor');
                function updateSeekingBar() {
                    elapsedTime = audioControls.getElapsedTime();
                    elapsedTimeIndex = Math.floor(elapsedTime / duration * seekingBarWidth);
                    cursor.setAttribute('x', elapsedTimeIndex.toString());
                    if ((elapsedTimeIndex % stripInterval) === 0) {
                        const stripId = ((elapsedTimeIndex / stripInterval) < seekingBarStripsCount) ? (elapsedTimeIndex / stripInterval) : (seekingBarStripsCount - 1);
                        updateSVGColor('rect' + stripId, elapsedEnvelopeColor);
                    }
                }
                {
                    const svg = document.getElementById('seekingBar'), pt = svg.createSVGPoint();
                    svg.addEventListener('mousedown', updatePlayCursor);
                    svg.addEventListener('mousedown', () => {
                        svg.addEventListener('mousemove', updatePlayCursor);
                    });
                    document.addEventListener('mouseup', () => {
                        svg.removeEventListener('mousemove', updatePlayCursor);
                    });
                    function updatePlayCursor(event) {
                        pt.x = event.clientX;
                        const cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());
                        audioControls.seek(cursorpt.x / seekingBarWidth * duration);
                        elapsedTime = audioControls.getElapsedTime();
                        elapsedTimeIndex = Math.floor(elapsedTime / duration * seekingBarWidth);
                        for (let i = 0; i < seekingBarStripsCount; i++) {
                            updateSVGColor('rect' + i, (i <= (elapsedTimeIndex / stripInterval)) ? elapsedEnvelopeColor : envelopeColor);
                        }
                        cursor.setAttribute('x', (elapsedTimeIndex < (seekingBarWidth - cursorWidth)) ? elapsedTimeIndex.toString() : (seekingBarWidth - cursorWidth - 1).toString());
                        const elapsedTimeSpan = document.getElementById('elapsedTime');
                        elapsedTimeSpan.innerHTML = convertElapsedTime(elapsedTime);
                    }
                }
            }
        }
        resolve();
    });
}
//# sourceMappingURL=audioControlsEL.js.map