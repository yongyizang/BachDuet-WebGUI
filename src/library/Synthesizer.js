// import * as Tone from 'tone'

// /*
// Piano
//  */
// export var synth = new Tone.PolySynth().toDestination();

// /*
// Queue contains user input
//  */
// export var notesPlayed = [];

// /*
// Multiple or single key pressed
//  */
// export var keyPressed = {};

// /*
// Key map for the piano
//  */
// var key = {
//     s: {
//         tone: "C4",
//     },
//     e: {
//         tone: "C#4",
//     },
//     d: {
//         tone: "D4",
//     },
//     r: {
//         tone: "D#4",
//     },
//     f: {
//         tone: "E4",
//     },
//     g: {
//         tone: "F4",
//     },
//     y: {
//         tone: "F#4",
//     },
//     h: {
//         tone: "G4",
//     },
//     u: {
//         tone: "G#4",
//     },
//     j: {
//         tone: "A4",
//     },
//     i: {
//         tone: "A#4",
//     },
//     k: {
//         tone: "B4",
//     },
// };
// export default key

// /*
// Detect if synth playing or not
//  */
// var synthPlaying = {};
// export default synthPlaying

// /*
// Function after key down event
//  */
// export function pressAndSet(){
//     var whichKey = event.key.toLowerCase();
//     var keyElem = $(`.key${whichKey.toUpperCase()}`);
//     if (keyElem) {
//         keyElem.css("background", "yellow");
//     }
//     setKeyPressedObj(whichKey, true);
// }

// /*
// Function after key up event
//  */
// export function releaseAndSet(){
//     var whichKey = event.key.toLowerCase();
//     var keyElem = $(`.key${whichKey.toUpperCase()}`);
//     if (keyElem) {
//         keyElem.css("background", "");
//     }
//     setKeyPressedObj(whichKey, false);
// }

// /*
// Function after mouse down event
//  */
// export function mousedownAndSet(){
//     var note = $(this).data("key");
//     setKeyPressedObj(note, true);
// }

// /*
// Function after mouse up event
//  */
// export function mouseupAndSet(){
//     var note = $(this).data("key");
//     setKeyPressedObj(note, false);
// }

// /*
// Detect the key pressed and play
//  */
// const setKeyPressedObj = (whichKey, val) => {
//     if (key[whichKey]) {
//         keyPressed[key[whichKey].tone] = val;
//         play();
//     }
// };
// export default setKeyPressedObj()

// /*
// Play the piano
//  */
// export let play = () => {
//     var synthID = "";
//     var value = false;
//     for (var key of Object.keys(keyPressed)) {
//         synthID = key;
//         value = keyPressed[key];
//         if (value && !synthPlaying[synthID]) {
//             notesPlayed.push([synthID]);
//             synthPlaying[synthID] = true;
//             synth.triggerAttack(synthID);
//         } else if (!value && synthPlaying[synthID]) {
//             delete synthPlaying[synthID];
//             synth.triggerRelease(synthID);
//         }
//     }
// };

