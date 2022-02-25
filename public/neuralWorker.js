importScripts("/tf.min.js")

const CHECKPOINT_BASE_URL = "/checkpoints/"
 
async function loadModels(){
    self.modelLstm = await tf.loadLayersModel('checkpoints/modelsFinal_Lstm/model.json');
    self.modelEmb =  await tf.loadLayersModel('checkpoints/modelsFinal_Emb/model_cleaned.json');
    
    // Post this message to UI
    // TODO: explain what is service worker and what is post message
    postMessage("Neural Network is loaded!");

    // tf backend doc
    tf.setBackend('webgl');

    warmupRounds = 2;
    var midiInp = tf.tensor2d([[96, 96]]);
    var cpcInp = tf.tensor2d([[12, 12]]); 
    var rhyInp = tf.tensor2d([[4]]);
    self.states1A = tf.randomNormal([1,600]);
    self.states1B = tf.randomNormal([1,600]);
    self.states2A = tf.randomNormal([1,600]);
    self.states2B = tf.randomNormal([1,600]);

    for (let i = 0; i < warmupRounds; i++) {
        postMessage("Network is warming up. Current round: " + (i+1) + "/" + warmupRounds);
        var exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
        var embMidi = exodos[0];
        var embCpc = exodos[1];
        var embRhy = exodos[2];
        var embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
        var embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
        var totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);
        var out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);
    }

    postMessage("Neural Network is ready to play with you!");
}

loadModels()

// self.lastAiPrediction = {'aiInpMidi':96, 'aiInpCpc':12};

// self.temperature = 0.9;
// self.counter = 0;

onmessage = function(e) {
    var data = e.data
    // console.log("just entered", " counter is ", self.counter, " tick is ", data['tick'])
    // var t1 = performance.now();
    // console.log("counter is ", self.counter, " tick is ", data['tick'], "\n", data['aiInp'],  "\n", data['humanInpMidi']);

    // console.assert(self.lastAiPrediction['aiInpMidi']==data['aiInp'].midiArticInd)

    if (data["reset"] == 1){
        self.states1A = tf.randomNormal([1,600]);
        self.states1B = tf.randomNormal([1,600]);
        self.states2A = tf.randomNormal([1,600]);
        self.states2B = tf.randomNormal([1,600]);
    }
    var midiInp = tf.tensor2d([[data['aiInp'].midiArticInd, data['humanInp'].midiArticInd]]);//data['humanInpMidi']]]);
    var cpcInp = tf.tensor2d([[data['aiInp'].cpc, data['humanInp'].cpc]]); //data['humanInpCpc']]]); 
    var rhyInp = tf.tensor2d([[data['rhythmInd']]]);

    // console.log( " COUNTER is ", self.counter, "midiInp" + midiInp.arraySync() + "cpcInp" + cpcInp.arraySync() + "rhyInp" + rhyInp.arraySync())

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
    self.states2B = out[4];
    
    var logits = out[0]
    
    var logits_temp = logits.div(data["temperature"]);
    var predictedNote = tf.multinomial(logits_temp, 2);

    // console.log('counter is ', self.counter, ' pred is ', predictedNote.dataSync()[0], ' mean logit ', logits.mean().dataSync()[0]);
    // var t2 = performance.now();
    // console.log("neuralNet: " + (t2`-t1) + " tick " + tick);
    // console.log("temperature is ", data["temperature"])
    var output = {
        'tick' : data['tick'],
        'midiArticInd' : predictedNote.dataSync()[0]
    }
    self.counter = self.counter + 1
    postMessage(output);
}