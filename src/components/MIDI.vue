<template>
  <div class="MIDIInput" :style="style">
    :data-device-id="deviceId"
    <div class="device-wrapper">
      <div class="selector-label">Choose a MIDI device...</div>
      <select class="device-selector" v-model="currentDevice" @change="changeDevice">
        <option v-for="device in activeDeviceLabels">{{device}}</option>
      </select>
    </div>
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
      console.log("Hi");
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
      this.activeDevices = [];
      this.activeDeviceLabels = [];
      for (let entry of midiAccess.inputs.values()) {
        this.activeDevices.push(entry);
        this.activeDeviceLabels.push(entry.name);
        // midiAccess.inputs.forEach(entry => entry.onmidimessage = event => _this.$emit('midi-input', event));
      }
      // for (let entry of midiAccess.outputs) {
      //   this.activeDevices.push(entry)
      // }
      if (this.activeDevices.length > 0) {
        if (this.currentDevice == '') {
          this.currentDevice = this.activeDeviceLabels[0];
          this.connectToDevice(this.activeDevices[0]);
        }
      }
    },
    connectToDevice(device) {
      device.onmidimessage = (event) => {
        if (event) {
          const deviceName = event.currentTarget.name;
          if (deviceName == this.currentDevice) {
            this.$emit('midi-input', event.data[1]);
            this.$emit('press-status', event.data[2]);
          }
        }
      }
    },
    changeDevice($event) {
      if ($event) {
        const index = this.activeDeviceLabels.indexOf(this.currentDevice);
        if (index >= 0) {
          this.connectToDevice(this.activeDevices[index]);
        }
      }
    }
  },
  data() {
    return {
      activeDevices: [],
      activeDeviceLabels: [],
      currentDevice: ''
    }
  }
}
</script>


<style scoped>
  .device-wrapper {
    position: absolute;
    z-index: 100;
    left: 30px;
  }
  .selector-label {
    color: black;
    font-size: 16px;
  }
  .device-selector {
    height: 40px;
    width: 200px;
    padding-left: 15px;
    padding-right: 15px;
    margin-top: 5px;
  }
</style>
