<!--
    This is the vue component of Neural Net.

    It doesn't have any UI. The sole purpose of this vue component,
    is to inject the neural network codes onto the main view itself.
-->
<template>
  <div id="neuralNet">
  </div>
</template>
<script>

import * as tf from '@tensorflow/tfjs';
import Instruments from "@/library/instruments";


const CHECKPOINT_BASE_URL = "/checkpoints/"
 
export default {
  name: "neuralNet",
  props:{},
  data() {
      return {
        //   model: ""
        states1A: tf.randomNormal([1,600]),
        states1B: tf.randomNormal([1,600]),
        states2A: tf.randomNormal([1,600]),
        states2B: tf.randomNormal([1,600]),
        temperature: 0.1
      }
  },
  watch: {},
//   mounted() {},
  methods: {
      inference(currentTickNumber){

        var t1 = performance.now();
        var midiInp = tf.tensor2d([[60,61]]);
        var cpcInp = tf.tensor2d([[12, 0]]);
        var rhyInp = tf.tensor2d([[5]]);
        var exodos = this.modelEmb.predict([midiInp, cpcInp, rhyInp]);
        var embMidi = exodos[0];
        var embCpc = exodos[1];
        var embRhy = exodos[2];
        var embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
        var embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
        var totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);
        var out = this.modelLstm.predict([totalInp, this.states1A, this.states1B, this.states2A, this.states2B]);
        this.states1A = out[1];
        this.states1B = out[2];
        this.states2A = out[3];
        this.states2B = out[4]

        var logits = out[0]
        var logits_temp = logits.div(this.temperature);
        var predictedNote = tf.multinomial(logits_temp, 2);
        // var predictedNote = 4;
        // predictedNote is a number (0-134) which corresponds to a token of the form "midi_articulation"
        // where midi is the midi number of the note and articulation is either 1 (hit) or 0 (hold)

        // Also, this predictedNote was predicted in tick = currentTickNumber,
        // however it should be played in tick = currentTickNumber + 1

        // we should store the predictedNote in a vuex dictionary = {currentTickNumber+1 : predictedNote}
        // and let the clock in main.vue to access it, and trigger the note when it's time

        
        var t2 = performance.now();
        this.$store.commit("updateNeuralNetTime", t2-t1);
        return {predictedNote}
      }
  },
  async created() {
        // Define a model for linear regression.
        // this.model = tf.sequential();
        // this.model.add(tf.layers.dense({units: 1, inputShape: [1]}));

        // this.model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

        // // Generate some synthetic data for training.
        // const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
        // const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

        // // Train the model using the data.
        // this.model.fit(xs, ys, {epochs: 10}).then(() => {
        // // Use the model to do inference on a data point the model hasn't seen before:
        // this.model.predict(tf.tensor2d([5], [1, 1])).print();
        // // Open the browser devtools to see the output
        // });
        this.modelLstm = await tf.loadLayersModel('checkpoints/modelsFinal_noEmb/model.json');
        this.modelEmb = await tf.loadLayersModel('checkpoints/modelsFinal_Emb/model.json');

        console.log("created");
  }

}
</script>