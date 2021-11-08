<template>
  <div class="MIDIInput" :style="style">
    :data-device-id="deviceId"
  </div>
</template>

<script>
import {primary_message, warn_message} from "../library/Message";
export let midiAccess;
export default{
  created(){
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(this.onMIDISuccess, this.onMIDIFailure);
    } else {
      alert("No Midi Support for the browser"); // eslint-disable-line
    }

  },
  methods: {
    onMIDISuccess(midi) {

      midiAccess = midi
      this.$emit('midi-success', midiAccess)
      primary_message('MIDI READY')
      midiAccess.onstatechange = this.onStateChange;

      // handle devices
      this.setDevices(midiAccess)
    },
    onMIDIFailure(msg) {
      this.$emit('midi-fail', msg)
      warn_message("Failed to get MIDI access - " + msg);
    },
    onStateChange(event) {
      this.$emit.call(this, 'midi-change', event)

      // handle devices
      this.setDevices(midiAccess)
    },
    setDevices(midiAccess) {
      const _this = this
      this.activeDevices = []
      for (let entry of midiAccess.inputs) {
        this.activeDevices.push(entry)
        midiAccess.inputs.forEach(entry => entry.onmidimessage = event => _this.$emit('midi-input', event));
      }
      for (let entry of midiAccess.outputs) {
        this.activeDevices.push(entry)
      }
    },
  },
  data() {
    return {
      activeDevices: []
    }
  }
}
</script>


<style scoped>

</style>