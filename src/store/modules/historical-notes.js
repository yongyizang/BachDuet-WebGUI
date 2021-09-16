import Vue from "vue";
import noteHelper from "../../library/note-helper";

let allHumanNotes = [];
let allAINotes = [];

const state = {
  humanNotes: allHumanNotes,
  AINotes: allAINotes,
  /*
        here, all notes should be stored in this format.
        [(ticknumber), (note), (duration)].
    */
};

const getters = {
  getAllHumanNotes(state) {
    return state.humanNotes;
  },
  getAllAINotes(state) {
    return state.AINotes;
  },
};

const actions = {};

const mutations = {
  /*
        A noteInfo should be sent in this format:
        [(ticknumber), (player), (note), (noteStatus)]
        ticknumber: the current ticknumber.
        player: who is the player of this note. 
            for human player, use "player"; for network, use "AI".
        note: the note. For example: "C4". If there's a rest, use "rest".
        noteStatus: a boolean variable. if the note is continuing, then use 0; if the note is initialized first time here, use 1.
    */

  noteAdd(state, noteInfo) {
    // Parse everything into different variables.
    let ticknumber = noteInfo[0];
    let player = noteInfo[1];
    let note = noteInfo[2];
    let noteStatus = noteInfo[3];

    // If the note is intialized for the first time
    if (noteStatus) {
      if (player == "player") {
        state.humanNotes.push([ticknumber, note, "16n"]);
      } else if (player == "AI") {
        state.AINotes.push([ticknumber, note, "16n"]);
      } else {
        throw new Error(
          "the player variable in noteInfo should be either 'player' or 'AI'."
        );
      }
    } else {
        // if it's not
      if (player == "player") {
        // WARNING: .pop() method may be slow. But it suits the purpose here for now. If this program gets bigger, a better approach would be defining a prototype behavior getting the last element of the array separately, like var last = array.slice(-1)[0]; .pop() would also change the value of the array. Here, we take the last note of the array, compare it with the new note, make changes, then put it back to the original array.
        var lastNote = state.humanNotes.pop();
        if (note == lastNote[1]) {
            lastNote[2] = noteHelper.incrementDuration(lastNote[2]);
            state.humanNotes.push(lastNote);
        } else {
          throw new Error(
            "the noteInfo with a continuing noteStatus doesn't match the previous note."
          );
        }
      } else if (player == "AI") {
        var lastNote = state.AINotes.pop();
        if (note == lastNote[1]) {
            lastNote[2] = noteHelper.incrementDuration(lastNote[2]);
            state.AINotes.push(lastNote);
        } else {
          throw new Error(
            "the noteInfo with a continuing noteStatus doesn't match the previous note."
          );
        }
      } else {
          throw new Error(
            "the player variable in noteInfo should be either 'player' or 'AI'."
          )
      }
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
