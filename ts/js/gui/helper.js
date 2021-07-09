"use strict";
export function getSVGElement(type, id, x, y, width, height, fill) {
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
export function updateSVGColor(id, color) {
    const node = document.getElementById(id);
    if (node === null)
        throw new Error('No valid id!');
    const svgNode = node;
    svgNode.setAttribute('fill', color);
}
export function convertElapsedTime(inputSeconds) {
    const seconds = Math.floor(inputSeconds % 60);
    let secondsString = seconds.toString();
    if (seconds < 10) {
        secondsString = '0' + secondsString;
    }
    const minutes = Math.floor(inputSeconds / 60), minutesString = minutes.toString();
    return minutesString + ':' + secondsString;
}
export function displayNewTrial() {
    const newTrial = document.getElementById('newTrial');
    newTrial.style.opacity = '1';
    setTimeout(() => newTrial.style.opacity = '0', 1500);
}
//# sourceMappingURL=helper.js.map