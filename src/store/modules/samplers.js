import Vue from "vue";
import * as Tone from "tone";
import Instruments from "@/library/instruments";

window.onclick = () => {
    Tone.start();
    Tone.context.lookAhead = 0;
  };

const userSampler = new Instruments().createSampler("piano", (piano) => {
    piano.toDestination();
});

const AISampler = new Instruments().createSampler("piano", (piano) => {
    piano.toDestination();
});

const metronomeSampler = new Instruments().createSampler(
    "metronome",
    (metronome) => {
      metronome.release = 0.2;
    }
);

const metronomeBus = new Tone.Channel().toDestination();
metronomeSampler.connect(metronomeBus);

const state = {
    metronomeStatus: true,
    userSamplerGain: 1,
    AISamplerGain: 1
};

const getters = {
    getMetronomeStatus(state){
        return state.metronomeStatus;
    },
    getUserSamplerGain(state){
        return state.userSamplerGain;
    },
    getAISamplerGain(state){
        return state.AISamplerGain;
    }
};

const actions = {
    samplerOn(state, payload){
        // {samplerName, currentNote, time}
        if (payload.name == "user"){
            userSampler.triggerAttack(payload.note, payload.time);
        } else if (payload.name == "AI"){
            AISampler.triggerAttack(payload.note, payload.time);
        } else if (payload.name == "metronome"){
            metronomeSampler.triggerAttack(payload.note, payload.time);
        }
    },
    samplerOff(state, payload){
        if (payload.name == "user"){
            userSampler.triggerRelease(payload.note, payload.time);
        } else if (payload.name == "AI"){
            AISampler.triggerRelease(payload.note, payload.time);
        }
    },
    toggleMetronome(state){
        metronomeBus.mute = state.metronomeStatus;
        state.metronomeStatus = !state.metronomeStatus;
    }
};

const mutations = {
    
};

export default {
  state,
  getters,
  actions,
  mutations,
};
