import * as Tone from "tone";
import {setScheduledPrint} from "./Quantize";

const MIN_BPM = 60;
const MAX_BPM = 120;


/*
    bpm for the metronome
 */
export var bpm = Tone.Transport.bpm.value || 60;

 /*
    Synthesizer for the metronome
 */
export const osc = new Tone.Oscillator().toDestination();

 /*
Function make metronome repeat in even time interval
 */
export function scheduleMetronome(note) {
    let scheduledEventId = null;
    scheduledEventId = Tone.Transport.scheduleRepeat((time) => {
        osc.start(time).stop(time + 0.0001);
    }, note);
}



// export function triggerMetronome(tick) {
//     // determine if the tick is the tick that needs to be triggered,
//     // If it is, trigger the Tone.js sampler
// }

 /*
Change the BPM of metronome
 */
export function changeBPM() {
    var bpm = document.getElementById("bpm").value || 60;
    Tone.Transport.bpm.value = bpm;
}

/*
    Setter: This functions sets the Metronome BPM.
*/

export function setBPM(bpm) {
    if (bpm < MIN_BPM || bpm > MAX_BPM) {
        throw new Error(`Invalid BPM. We currently only support BPM from ` + MIN_BPM + ` to ` + MAX_BPM + `.`)
    } else {
        Tone.Transport.bpm.value = bpm || 60;
    }
}

/*
Start the metronome
 */
export function start() {
    Tone.start();
    Tone.Transport.start();
}

/*
Stop the metronome
 */
export function stop() {
    Tone.Transport.stop();
}



/*
Change the note of the metronome
 */
export function changeNote() {
    var note = document.getElementById("metronomeNote").value || "4n";
    scheduleMetronome(note);
}

/*
Clear the event
 */
export function clear() {
    Tone.Transport.clear(scheduledEventId);
}

/*
start metronome when click button
 */
export function clickAndStart(){
    clear();
    stop();
    changeBPM();
    changeNote();
    setScheduledPrint();
    start();
}

/*
stop the metronome when click button
 */
export function clickAndStop(){
    clear();
    stop();
}