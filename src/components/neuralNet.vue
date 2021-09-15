<!--
    This is the vue component of Neural Net.

    It doesn't have any UI
-->
<template>
  <div id="neuralNet"></div>
</template>
<script>
import * as tf from '@tensorflow/tfjs';

const CHECKPOINT_BASE_URL = "/checkpoints/"
 
export default {
  name: "neuralNet",
  props:{},
  data() {
      return {
        //   model: ""
      }
  },
  watch: {},
//   mounted() {},
  methods: {
      testTrigger(){
         this.model.predict(tf.tensor2d([5], [1, 1])).print(); 
         console.log("AAAAAA");
      }
  },
  created() {
        // Define a model for linear regression.
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({units: 1, inputShape: [1]}));

        this.model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

        // Generate some synthetic data for training.
        const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
        const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

        // Train the model using the data.
        this.model.fit(xs, ys, {epochs: 10}).then(() => {
        // Use the model to do inference on a data point the model hasn't seen before:
        this.model.predict(tf.tensor2d([5], [1, 1])).print();
        // Open the browser devtools to see the output
        });
        console.log("created");
  }

}
</script>