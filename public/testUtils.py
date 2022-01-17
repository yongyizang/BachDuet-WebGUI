#%%
import pickle
import numpy as np
#%%
store = np.load("bachDuetTest.npy", allow_pickle=True).item()

# %%
# put the first hiddenSTates to inputsFromPython.js
state1A = store['hiddenStates'][0][0][0]
state2A = store['hiddenStates'][0][0][1]
state1B = store['hiddenStates'][0][1][0]
state2B = store['hiddenStates'][0][1][1]
#%%
#  self.humanTestInputMidi = [52,53,60,61]
#  self.humanTestInputCpc = [0,0,2,2]
#  self.humanTestInputRhythm = [4,1,2,1,5,6,7,6,0,1,2,1,5,6,7,8]

# aa = np.array([[1,2,3,4,5],[3,4,5,6,7]])
with open("inputsFromPython.js", "w") as f:
    f.write(f"self.states1A = tf.tensor({state1A.tolist()},[1,600],'float32');\n")
    f.write(f"self.states2A = tf.tensor({state2A.tolist()},[1,600],'float32');\n")
    f.write(f"self.states1B = tf.tensor({state1B.tolist()},[1,600],'float32');\n")
    f.write(f"self.states2B = tf.tensor({state2B.tolist()},[1,600],'float32');\n")
    f.write(f"self.humanTestInputMidi = {store['humanMidiArtic']};\n")
    f.write(f"self.humanTestInputCpc = {store['humanCpc']};\n")
    f.write(f"self.testInputRhythm = {store['rhythmToken']};\n")
    f.write(f"self.aiTestOutputMidiArticInd = {store['aiMidiArticInd']};\n")
    f.write(f"self.humanTestInputMidiInd = {store['humanMidiArticInd']};\n")
    f.write(f"self.humanTestInputCpcInd = {store['humanCpc']};\n")
    f.write(f"self.testInputRhythmInd = {store['rhythmInd']};\n")
    f.write(f"self.temperature = {store['temperature']};\n")

    f.write(f"self.aiTestOutputMidiArtic = {store['aiMidiArtic']};\n")
    f.write(f"self.aiTestOutputMidi = {store['aiMidi']};\n")
    f.write(f"self.aiTestOutputCpc = {store['aiCpc']};\n")