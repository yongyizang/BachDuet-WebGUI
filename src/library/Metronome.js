import * as Tone from "tone";
import {setScheduledPrint} from "./Quantize";
/*
bpm for the metronome
 */
var bpm = document.getElementById("bpm").value || 60;
export default bpm
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

/*
Start the metronome
 */
export function start() {
    Tone.Transport.start();
}

/*
Stop the metronome
 */
export function stop() {
    Tone.Transport.stop();
}

/*
Change the BPM of metronome
 */
export function changeBPM() {
    var bpm = document.getElementById("bpm").value || 60;
    Tone.Transport.bpm.value = bpm;
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