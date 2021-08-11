import {notesPlayed} from"./Synthesizer"
import {bpm} from"./Metronome"

/*
time interval
 */
export var intervalId = null;

/*
Queue two store the last note of the 16th note interval
 */
export var queueTwo = [];

/*
Schedule printing note base on interval
 */
export function setScheduledPrint(){
    var timeInterval = (60 / bpm / 4) * 1000;
    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        printLastNote();
    }, timeInterval);
}

/*
Print note
 */
export const printLastNote = () => {
    if (notesPlayed && notesPlayed.length > 0) {
        const lastNote = notesPlayed[notesPlayed.length - 1];
        console.log("Notes playes : ", notesPlayed.toString());
        console.log("Last Note Played : ", lastNote.toString());
        queueTwo.push(lastNote ? lastNote : "");
        if (keyPressed[lastNote]) {
            notesPlayed = [lastNote];
        } else {
            notesPlayed = [];
        }
    } else {
        console.log("Last Note Played : []");
    }
};

