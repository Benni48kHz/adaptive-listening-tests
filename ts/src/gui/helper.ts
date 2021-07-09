"use strict";

/**
 * @param type tested for 'rect'
 * @param id of the created node
 * @param x position in viewport
 * @param y position in viewport 
 * @param fill color
 */
export function getSVGElement(type: string, id: string, x: number, y: number, width: number, height: number, fill: string): SVGElement {
   
   const node = document.createElementNS("http://www.w3.org/2000/svg", type);
   
   const attributeList = {
      id: id,
      x: x,
      y: y,
      width: width,
      height: height,
      fill: fill,
   };
   
   for (const attribute in attributeList) {
      node.setAttribute(attribute, attributeList[attribute]);
   }

   return node;
}

export function updateSVGColor(id: string, color: string): void {
   const node = document.getElementById(id)!;
   if(node === null) throw new Error('No valid id!');
   const svgNode = node as unknown as SVGElement;
   svgNode.setAttribute('fill', color);
}

/**
 * @returns minutes:seconds
 */
export function convertElapsedTime(inputSeconds: number): string {
   const seconds = Math.floor(inputSeconds % 60);
   let secondsString = seconds.toString();
   if (seconds < 10) {
      secondsString = '0' + secondsString;
   }
   const minutes = Math.floor(inputSeconds / 60),
      minutesString = minutes.toString();

   return minutesString + ':' + secondsString;
}

/**
 * fades New Trial / Neue Runde sign in and out
 */
export function displayNewTrial(): void {
   const newTrial = document.getElementById('newTrial')!;
   newTrial.style.opacity = '1';
   setTimeout(() => newTrial.style.opacity = '0', 1500);
}