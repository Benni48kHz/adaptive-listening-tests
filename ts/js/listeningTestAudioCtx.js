"use strict";
class AudioControls {
    constructor(testType, _gainDry, _gainWet, _gainMaster, _audioContext, _buffer, _destinationNodeWet, _destinationNodeDry) {
        this.testType = testType;
        this._gainDry = _gainDry;
        this._gainWet = _gainWet;
        this._gainMaster = _gainMaster;
        this._audioContext = _audioContext;
        this._buffer = _buffer;
        this._destinationNodeWet = _destinationNodeWet;
        this._destinationNodeDry = _destinationNodeDry;
        this._playbackTime = 0;
        this._startTimestamp = 0;
        this._isPlaying = false;
        this._soundSource = this._audioContext.createBufferSource();
    }
    setGains(isStimulus, intensity) {
        if (this.testType.signalflowIsParallel) {
            if (isStimulus) {
                if (typeof intensity !== 'number')
                    throw new Error('setGains needs param intensity if (isStimulus == true)');
                let dry = 1, wet = intensity, sum = dry + wet;
                this._gainDry.gain.value = dry / sum;
                this._gainWet.gain.value = wet / sum;
            }
            else {
                this._gainWet.gain.value = 0;
                this._gainDry.gain.value = 1;
            }
        }
        else {
            throw new Error('parallel signalflow is not implemented yet!');
        }
    }
    getGainWet() {
        return 20 * Math.log10(this._gainWet.gain.value);
    }
    setGainWet(muted, gain_dB) {
        if (muted) {
            this._gainWet.gain.value = 0;
        }
        else if (typeof gain_dB === 'number') {
            if (gain_dB > 0) {
                throw new Error('gain_dB may not be greater than 0 to prevent clipping!');
            }
            this._gainWet.gain.value = Math.pow(10, gain_dB / 20);
        }
    }
    getGainDry() {
        return 20 * Math.log10(this._gainDry.gain.value);
    }
    setGainDry(mute, gain_dB) {
        if (mute) {
            this._gainDry.gain.value = 0;
        }
        else if (typeof gain_dB === 'number') {
            if (gain_dB > 0) {
                throw new Error('gain_dB may not be greater than 0 to prevent clipping!');
            }
            this._gainDry.gain.value = Math.pow(10, gain_dB / 20);
        }
    }
    getGainMaster() {
        return 20 * Math.log10(this._gainMaster.gain.value);
    }
    setGainMaster(mute, gain_dB) {
        if (mute) {
            this._gainMaster.gain.value = 0;
        }
        else if (typeof gain_dB === 'number') {
            if (gain_dB > 0) {
                throw new Error('gain_dB may not be greater than 0 to prevent clipping!');
            }
            this._gainMaster.gain.value = Math.pow(10, gain_dB / 20);
        }
    }
    getIsPlaying() {
        return this._isPlaying;
    }
    getBufferDuration() {
        return this._buffer.duration;
    }
    getElapsedTime() {
        if (this._isPlaying === true) {
            return (Date.now() - this._startTimestamp) / 1000 + this._playbackTime;
        }
        else {
            return this._playbackTime;
        }
    }
    getEnvelope(targetLength, channel) {
        const envelope = new Array(targetLength), channelData = this._buffer.getChannelData(channel), segmentLength = Math.floor(channelData.length / targetLength);
        for (let segmentIndex = targetLength - 1; segmentIndex >= 0; segmentIndex--) {
            let average = 0;
            const startIndex = segmentIndex * segmentLength, endIndex = startIndex + segmentLength;
            for (let i = startIndex; i < endIndex; i++) {
                average += Math.abs(channelData[i]);
            }
            envelope[segmentIndex] = (1 / segmentLength) * average;
        }
        return envelope;
    }
    initSource() {
        this._soundSource = this._audioContext.createBufferSource();
        this._soundSource.buffer = this._buffer;
        this._soundSource.connect(this._destinationNodeWet);
        this._soundSource.connect(this._destinationNodeDry);
        let endOfPlayback = this.endOfPlayback.bind(this);
        this._soundSource.onended = endOfPlayback;
    }
    play() {
        if (this._isPlaying)
            return;
        this.initSource();
        this._soundSource.start(0, this._playbackTime);
        this._startTimestamp = Date.now();
        this._isPlaying = true;
    }
    seek(playbackTime) {
        if (playbackTime > this._buffer.duration) {
            console.log("Seek time is greater than duration of audio buffer!");
            return;
        }
        if (this._isPlaying) {
            this.stop();
            this._playbackTime = playbackTime;
            setTimeout(() => {
                this._playbackTime = playbackTime;
                this.play();
            }, 100);
        }
        else {
            this._playbackTime = playbackTime;
        }
    }
    pause() {
        this.stop(true);
    }
    stop(pause) {
        if (!this._isPlaying)
            return;
        pause = (pause === undefined) ? false : pause;
        this._isPlaying = false;
        this._soundSource.stop(0);
        this._playbackTime = pause ? (Date.now() - this._startTimestamp) / 1000 + this._playbackTime : 0;
    }
    endOfPlayback() {
        if (this._isPlaying)
            this._playbackTime = 0;
        this._isPlaying = false;
        console.log('endOfPlayback');
    }
    sleep(milliseconds) {
        const date = Date.now();
        let currentDate;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
}
export function createAudioCtx(type, audioFile) {
    const audioCtx = new window.AudioContext(), fileReader = new FileReader();
    return new Promise((resolve) => {
        fileReader.readAsArrayBuffer(audioFile);
        fileReader.onloadend = function (e) {
            if (!(e.target.result instanceof ArrayBuffer)) {
                resolve(new Error('e.target.result is not an ArrayBuffer! /ne: ' + e));
            }
            const targetResult = e.target.result;
            const audioControls = audioCtx.decodeAudioData(targetResult)
                .then(function (buffer) {
                const oversample = '4x';
                const distortion = audioCtx.createWaveShaper();
                distortion.curve = makeDistortionCurve(50);
                distortion.oversample = oversample;
                const dry = audioCtx.createWaveShaper();
                dry.curve = makeDistortionCurve(0);
                dry.oversample = oversample;
                const gainWet = audioCtx.createGain(), gainDry = audioCtx.createGain(), gainMaster = audioCtx.createGain();
                distortion.connect(gainWet).connect(gainMaster);
                dry.connect(gainDry).connect(gainMaster);
                gainMaster.connect(audioCtx.destination);
                return new AudioControls(type, gainDry, gainWet, gainMaster, audioCtx, buffer, distortion, dry);
            })
                .catch(() => {
                return new Error('decodeAudioData has failed!');
            });
            resolve(audioControls);
        };
        fileReader.onerror = function (e) {
            resolve(new Error('fileReader.readAsArrayBuffer(audioFile) has failed! /ne:' + e));
        };
    });
}
function makeDistortionCurve(amount, nSamples = 44100) {
    const curve = new Float32Array(nSamples), deg = Math.PI / 180;
    if (amount === 0) {
        for (let i = 0; i < nSamples; ++i) {
            const x = i * 2 / nSamples - 1;
            curve[i] = x;
        }
    }
    else {
        for (let i = 0; i < nSamples; ++i) {
            const x = (i * 2 / nSamples) - 1;
            curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
        }
    }
    return curve;
}
//# sourceMappingURL=listeningTestAudioCtx.js.map