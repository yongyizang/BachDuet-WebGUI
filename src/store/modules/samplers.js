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
    userSamplerGain: 0, // in dB
    AISamplerGain: 0, // in dB
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
};

const mutations = {
    muteMetronome(state){
        metronomeBus.mute = state.metronomeStatus;
    },
    flipMetronomeStatus(state){
        state.metronomeStatus = !state.metronomeStatus;
    },
    setUserPianoVolume(state, volume){
        if (volume == 10){
            state.userSamplerGain = 0;
        } else{
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.userSamplerGain = toDB;
        }
        userSampler.volume.value = state.userSamplerGain;
    },
    setAIPianoVolume(state, volume){
        if (volume == 10){
            state.AISamplerGain = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.AISamplerGain = toDB;
        };
        AISampler.volume.value = state.AISamplerGain;
    },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
