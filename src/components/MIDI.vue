<template>
  <div class="MIDIInput">
    <select v-model="selectedMIDIDevice" @change="onMIDIDeviceSelectedChange">
      <option v-for="item in activeDevices" :value="item.index">{{item.name}}</option>
    </select>
  </div>
</template>

<script>
import { WebMidi } from "webmidi";
var midiAccess;

export default {
  created() {

  },

  mounted() {
    // Enable WebMIDI, then call onEnabled method.
    WebMidi.enable()
      .then(this.onEnabled)
      .catch((err) => alert(err)); 
  },

  methods: {
    onEnabled() {
      var vm = this;
      if (WebMidi.inputs.length < 1) {
        console.log("No device detected.");
      } else {
        WebMidi.inputs.forEach((device) => {
          vm.activeDevices.push({"index": device.id, "name": device.name});
        });
        this.selectedMIDIDevice = this.activeDevices[0].index;
        this.messageListener();
      }
    },

    onMIDIDeviceSelectedChange() {
      console.log("MIDI Device Changed to " + this.selectedMIDIDevice)
    },

    messageListener(){
      var vm = this;
      const inputDevice = WebMidi.getInputById(this.selectedMIDIDevice);
      inputDevice.addListener("noteon", message => {
        vm.$root.$refs.keyboardUI.toggleAttack(message.note.identifier);
        vm.$root.$refs.gameUI.keyDown(message.note.identifier, true);
      });
      inputDevice.addListener("noteoff", message => {
        vm.$root.$refs.keyboardUI.toggleRelease(message.note.identifier);
        vm.$root.$refs.gameUI.keyUp(message.note.identifier, true);
      });
    }
  },

  data() {
    return {
      activeDevices: [],
      selectedMIDIDevice: '',
    };
  },
};
</script>

<style scoped>

.MIDIInput {
  z-index:999;
  position:absolute;
  top:20;
  left:20;
  width:100px;
  height:50px;
}

</style>
