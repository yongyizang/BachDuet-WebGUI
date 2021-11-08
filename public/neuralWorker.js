// the worker that loads and runs the neural net

// couldn't use import *...  because of errors
// to use that, I have to create the worker as a module, in main.vue in the following way :
//          const neuralWorker = new Worker('neuralWorker.js', { type: "module" })
// when I did that, the postMessage wasn't working, and no errors where displayed in console to debug it
// import * as tf from '@tensorflow/tfjs';

// for know, this does the trick
importScripts("/tf.min.js")


const CHECKPOINT_BASE_URL = "/checkpoints/"
 
async function loadModels(){

    self.modelLstm = await tf.loadLayersModel('checkpoints/modelsFinal_Lstm/model.json');
    self.modelEmb =  await tf.loadLayersModel('checkpoints/modelsFinal_Emb/model_cleaned.json');
    console.log("loaded models");
    tf.setBackend('wasm');

    console.log(tf.getBackend());

}

loadModels()

self.states1A = tf.randomNormal([1,600]);
self.states1B = tf.randomNormal([1,600]);
self.states2A = tf.randomNormal([1,600]);
self.states2B = tf.randomNormal([1,600]);
// self.states1A = tf.zeros([1,600]);
// self.states1B = tf.zeros([1,600]);
// self.states2A = tf.zeros([1,600]);
// self.states2B = tf.zeros([1,600]);
self.temperature = 0.1;
self.lastAiPrediction = {'aiInpMidi':96, 'aiInpCpc':12};
onmessage = function(e) {
    console.log(e.data);
    var data = e.data
    var tick = data['tick'];
    var t1 = performance.now();
    // console.time(tick)
    // var midiInp = tf.tensor2d([[133,123]]);
    // var cpcInp = tf.tensor2d([[12, 11]]);
    // var rhyInp = tf.tensor2d([[9]]);

    var midiInp = tf.tensor2d([[self.lastAiPrediction['aiInpMidi'],data['humanInpMidi']]]);
    var cpcInp = tf.tensor2d([[self.lastAiPrediction['aiInpCpc'], data['humanInpCpc']]]);
    var rhyInp = tf.tensor2d([[data['rhythmInd']]]);

    var exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
    var embMidi = exodos[0];
    var embCpc = exodos[1];
    var embRhy = exodos[2];
    var embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
    var embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
    var totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);
    var out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);
    self.states1A = out[1];
    self.states1B = out[2];
    self.states2A = out[3];
    self.states2B = out[4]

    var logits = out[0]
    var logits_temp = logits.div(self.temperature);
    var predictedNote = tf.multinomial(logits_temp, 2);

    // console.log('pred is ', predictedNote.print());
    self.lastAiPrediction['aiInpMidi'] = predictedNote.dataSync()[0]
    // I have no way to get the aiInpCpc here. I need the tokensDict, and the worker doesn't have 
    // access to vuex. 

    // var predictedNote = 4;
    // predictedNote is a number (0-134) which corresponds to a token of the form "midi_articulation"
    // where midi is the midi number of the note and articulation is either 1 (hit) or 0 (hold)

    // Also, self predictedNote was predicted in tick = currentTickNumber,
    // however it should be played in tick = currentTickNumber + 1

    // we should store the predictedNote in a vuex dictionary = {currentTickNumber+1 : predictedNote}
    // and let the clock in main.vue to access it, and trigger the note when it's time

        
    // console.log('Message received from main script');
    // var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
    // console.log('Posting message back to main script');
    var t2 = performance.now();
    console.log("neuralNet: " + (t2-t1) + " tick " + tick);
    var output = {
        'tick' : data['tick'],
        'midiArticInd' : predictedNote.dataSync()[0]
    }
    postMessage(output);
}

// export default {
//   name: "neuralNet",
//   props:{},
//   data() {
//       return {
//         //   model: ""
//         states1A: tf.randomNormal([1,600]),
//         states1B: tf.randomNormal([1,600]),
//         states2A: tf.randomNormal([1,600]),
//         states2B: tf.randomNormal([1,600]),
//         temperature: 0.1
//       }
//   },
//   watch: {},
// //   mounted() {},
//   methods: {
//       inference(currentTickNumber){

//         console.time(currentTickNumber)
//         // var midiInp = tf.tensor2d([[60,61]]);
//         // var cpcInp = tf.tensor2d([[12, 0]]);
//         // var rhyInp = tf.tensor2d([[5]]);
//         // var exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
//         // var embMidi = exodos[0];
//         // var embCpc = exodos[1];
//         // var embRhy = exodos[2];
//         // var embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
//         // var embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
//         // var totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);
//         // var out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);
//         // self.states1A = out[1];
//         // self.states1B = out[2];
//         // self.states2A = out[3];
//         // self.states2B = out[4]

//         // var logits = out[0]
//         // var logits_temp = logits.div(self.temperature);
//         // var predictedNote = tf.multinomial(logits_temp, 2);
//         var predictedNote = 4;
//         // predictedNote is a number (0-134) which corresponds to a token of the form "midi_articulation"
//         // where midi is the midi number of the note and articulation is either 1 (hit) or 0 (hold)

//         // Also, self predictedNote was predicted in tick = currentTickNumber,
//         // however it should be played in tick = currentTickNumber + 1

//         // we should store the predictedNote in a vuex dictionary = {currentTickNumber+1 : predictedNote}
//         // and let the clock in main.vue to access it, and trigger the note when it's time

        
//         console.timeEnd(currentTickNumber)
//         return {predictedNote}
//       }
//   },
//   async created() {
//         // Define a model for linear regression.
//         // self.model = tf.sequential();
//         // self.model.add(tf.layers.dense({units: 1, inputShape: [1]}));

//         // self.model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

//         // // Generate some synthetic data for training.
//         // const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
//         // const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

//         // // Train the model using the data.
//         // self.model.fit(xs, ys, {epochs: 10}).then(() => {
//         // // Use the model to do inference on a data point the model hasn't seen before:
//         // self.model.predict(tf.tensor2d([5], [1, 1])).print();
//         // // Open the browser devtools to see the output
//         // });
//         self.modelLstm = await tf.loadLayersModel('checkpoints/modelsFinal_noEmb/model.json');
//         self.modelEmb = await tf.loadLayersModel('checkpoints/modelsFinal_Emb/model.json');

//         console.log("created");
//   }

// }
