"use strict";

import {TestType} from "./testType.js";

export interface IAudioControls {
   testType: TestType,
   play(): void,
   /** @param playbackTime in seconds */
   seek(playbackTime: number): void,
   pause(): void,
   stop(pause?: boolean): void,

   /**
    * @param intensity ratio of the wet intensity to the dry intensity in case testType.signalflowIsParallel
    */
   setGains(isStimulus: boolean, intensity?: number): void
   getGainWet(): number,
   setGainWet(muted: boolean, gain_dB?: number): void,
   getGainDry(): number,
   setGainDry(muted: boolean, gain_dB?: number): void,
   getGainMaster(): number,
   setGainMaster(muted: boolean, gain_dB?: number): void,

   getIsPlaying(): boolean,
   /** 
    * @returns buffer duration in seconds */
   getBufferDuration(): number,
   /** 
    * @returns elapsed time in seconds */
   getElapsedTime(): number,
   /** 
    * @param targetLength Length of the returned number[]
    * @param channel 0 represents first channel
    * @returns envelope of the audio in the buffer
     */
   getEnvelope(targetLength: number, channel: number): number[],
}

class AudioControls implements IAudioControls {

   private _playbackTime: number;
   private _startTimestamp: number;
   private _isPlaying: boolean;
   private _soundSource: AudioBufferSourceNode;

   constructor(
      readonly testType: TestType,
      readonly _gainDry: GainNode,
      readonly _gainWet: GainNode,
      readonly _gainMaster: GainNode,
      readonly _audioContext: AudioContext,
      readonly _buffer: AudioBuffer,

      readonly _destinationNodeWet: AudioNode,
      readonly _destinationNodeDry: AudioNode
   ) {
      this._playbackTime = 0;       // time of the audio playback, seconds
      this._startTimestamp = 0;     // timestamp of last playback start, milliseconds
      this._isPlaying = false;
      this._soundSource = this._audioContext.createBufferSource();
   }

   setGains(isStimulus: boolean, intensity?: number): void {
      if (this.testType.signalflowIsParallel) {
         if (isStimulus) {
            if (typeof intensity !== 'number') throw new Error('setGains needs param intensity if (isStimulus == true)');

            let dry = 1,
               wet = intensity,
               sum = dry + wet;

            this._gainDry.gain.value = dry / sum;
            this._gainWet.gain.value = wet / sum;
         } else {
            this._gainWet.gain.value = 0;
            this._gainDry.gain.value = 1;
         }
      } else { // todo
         throw new Error('parallel signalflow is not implemented yet!');
      }
   }

   getGainWet(): number {
      return 20 * Math.log10(this._gainWet.gain.value);
   }
   setGainWet(muted: boolean, gain_dB?: number): void {
      if (muted) {
         this._gainWet.gain.value = 0;
      } else if (typeof gain_dB === 'number') {
         if (gain_dB > 0) {
            throw new Error('gain_dB may not be greater than 0 to prevent clipping!');
         }
         this._gainWet.gain.value = Math.pow(10, gain_dB / 20);
      }
   }

   getGainDry(): number {
      return 20 * Math.log10(this._gainDry.gain.value);
   }
   setGainDry(mute: boolean, gain_dB: number): void {
      if (mute) {
         this._gainDry.gain.value = 0;
      } else if (typeof gain_dB === 'number') {
         if (gain_dB > 0) {
            throw new Error('gain_dB may not be greater than 0 to prevent clipping!');
         }
         this._gainDry.gain.value = Math.pow(10, gain_dB / 20);
      }
   }

   getGainMaster(): number {
      return 20 * Math.log10(this._gainMaster.gain.value);
   }
   setGainMaster(mute: boolean, gain_dB?: number): void {
      if (mute) {
         this._gainMaster.gain.value = 0;
      } else if (typeof gain_dB === 'number') {
         if (gain_dB > 0) {
            throw new Error('gain_dB may not be greater than 0 to prevent clipping!');
         }
         this._gainMaster.gain.value = Math.pow(10, gain_dB / 20);
      }
   }

   ////////////////////////////////// get status, time, duration, envelope /////////////////////////////////////////////
   getIsPlaying(): boolean {
      return this._isPlaying;
   }
   getBufferDuration(): number {
      return this._buffer.duration;
   }
   getElapsedTime(): number {
      if (this._isPlaying === true) {
         return (Date.now() - this._startTimestamp) / 1000 + this._playbackTime;
      } else {
         return this._playbackTime;
      }
   }
   getEnvelope(targetLength: number, channel: number): number[] {    // todo: channel optional als number[]
      const envelope: number[] = new Array(targetLength),
         channelData = this._buffer.getChannelData(channel),
         segmentLength = Math.floor(channelData.length / targetLength);

      for (let segmentIndex = targetLength - 1; segmentIndex >= 0; segmentIndex--) {
         let average = 0;
         const startIndex = segmentIndex * segmentLength,
            endIndex = startIndex + segmentLength;
         for (let i = startIndex; i < endIndex; i++) {
            average += Math.abs(channelData[i]);
         }
         envelope[segmentIndex] = (1 / segmentLength) * average;
      }

      return envelope;
   }

   // Create a new AudioBufferSourceNode when play() is called
   initSource(): void {
      this._soundSource = this._audioContext.createBufferSource();
      this._soundSource.buffer = this._buffer;
      // routing      could be done more flexible with array of destination nodes
      this._soundSource.connect(this._destinationNodeWet);
      this._soundSource.connect(this._destinationNodeDry);
      // Bind the callback to this                 ///// todo: sollte auch ohne bind gehn ////////////////////////
      let endOfPlayback = this.endOfPlayback.bind(this);
      this._soundSource.onended = endOfPlayback;
   }

   // Play the currently loaded buffer
   play(): void {
      if (this._isPlaying) return;
      this.initSource();
      this._soundSource.start(0, this._playbackTime);
      this._startTimestamp = Date.now();
      this._isPlaying = true;
   }

   // Seek to a specific playbackTime (seconds) in the audio buffer. Do not change playback state.
   seek(playbackTime: number): void {
      if (playbackTime > this._buffer.duration) {
         console.log("Seek time is greater than duration of audio buffer!");
         return;
      }

      if (this._isPlaying) {
         this.stop();         // Stop any existing playback if there is any
         this._playbackTime = playbackTime;
         setTimeout(() => {      // wait a bit until endOfPlayback is completed
            this._playbackTime = playbackTime;     // happens a 2nd time here, because endOfPlayback has reset _playbackTime to 0
            this.play(); // Resume playback at new time
         }, 100);
      } else {
         this._playbackTime = playbackTime;
      }
   }

   // Pause playback, keep track of where playback stopped
   pause(): void {
      this.stop(true);
   }

   // Stops or pauses playback and sets playbackTime accordingly
   stop(pause?: boolean): void {
      if (!this._isPlaying) return;
      pause = (pause === undefined) ? false : pause;
      this._isPlaying = false; // Set to flag to endOfPlayback callback that this was set manually
      this._soundSource.stop(0);
      // If paused, calculate time where we stopped. Otherwise go back to beginning of playback (0).
      this._playbackTime = pause ? (Date.now() - this._startTimestamp) / 1000 + this._playbackTime : 0;
   }

   // todo: ohne diese function auskommen und dann in seek setTimeout entfernen
   endOfPlayback(): void {
      // If playback stopped because end of buffer was reached
      if (this._isPlaying) this._playbackTime = 0;
      this._isPlaying = false;
      console.log('endOfPlayback');
   }

   sleep(milliseconds: number): void {
      const date = Date.now();
      let currentDate: number;
      do {
         currentDate = Date.now();
      } while (currentDate - date < milliseconds);
   }

   /**     // Whenever we get a new AudioBuffer, we create a new AudioBufferSourceNode and reset
   // the playback time. Make sure any existing audio is stopped beforehand.
   initNewBuffer(buffer: any): void {
       this.stop();
       this._buffer = buffer;
       this._playbackTime = 0;
   } */
}

export function createAudioCtx(type: TestType, audioFile: Blob): Promise<AudioControls | Error> {

   const audioCtx = new window.AudioContext(),
      fileReader = new FileReader();

   return new Promise((resolve) => {

      fileReader.readAsArrayBuffer(audioFile);
      fileReader.onloadend = function(e) {

         if (!(e.target!.result instanceof ArrayBuffer)) {
            resolve(new Error('e.target.result is not an ArrayBuffer! /ne: ' + e));
         }

         const targetResult = e.target!.result as unknown as ArrayBuffer;

         const audioControls = audioCtx.decodeAudioData(targetResult)
            .then(function(buffer: AudioBuffer) {

               // waveshaper nodes
               const oversample = '4x';
               const distortion = audioCtx.createWaveShaper();
               distortion.curve = makeDistortionCurve(50);
               distortion.oversample = oversample;
               const dry = audioCtx.createWaveShaper();
               dry.curve = makeDistortionCurve(0);
               dry.oversample = oversample;

               // gain nodes, 1 = 0dB
               const gainWet = audioCtx.createGain(),
                  gainDry = audioCtx.createGain(),
                  gainMaster = audioCtx.createGain();

               // routing
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

      fileReader.onerror = function(e) {
         resolve(new Error('fileReader.readAsArrayBuffer(audioFile) has failed! /ne:' + e));
      };
   });
}

/**
 * @param amount todo: test how the thd is dependent on the amount
 * @returns array which length is nSamples (default = 44100)
 */
function makeDistortionCurve(amount: number, nSamples = 44100) {
   const curve = new Float32Array(nSamples),
      deg = Math.PI / 180;
   if (amount === 0) {
      for (let i = 0; i < nSamples; ++i) {
         const x = i * 2 / nSamples - 1;
         curve[i] = x;
      }
   } else {
      for (let i = 0; i < nSamples; ++i) {
         const x = (i * 2 / nSamples) - 1;
         curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
      }
   }
   return curve;
}