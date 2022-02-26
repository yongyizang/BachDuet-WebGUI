# Settings Modal
### App Settings
    [ ] Metronome Frequency Implementation with Buttons (After some thought, Maybe we shouldn't do this?)
    [x] Temperature slider. Linear scale. (TODO) Don't display number to user; Less Random - More Random
    [ ] Reset button on the main UI. Manual control to reset the network. (look for this.reset in main.vue and check the comments I added)
    [ ] Predifined hidden states for the neural net

### MIDI Device
    [x] Integrate MIDI module to settings modal
    [ ] Integrate MIDI alert into global alert system
    [ ] If user browser doesn't support Web MIDI, then just display an error message.

# External Logic
    [ ] Before user click play, nothing in the UI should respond
    [ ] Misalignment. If the neural network is outputting a different tick than current tick, send out warning.    

### Reverb & Mixing Console
    [ ] Implement some reverb choices
    [ ] Design and create Mixing console Modal
    [ ] Reverb amount control
    [ ] Reverb choice control (Small? Large? etc.)
    [ ] Volume controls

### Feedback Modal
    [ ] Christo: Waiting for Christo to design feedback questions
    [ ] (OPTIONAL) https://github.com/jldec/marked-forms Check marked-forms, consider the possibility of changing this code for feedback questionire auto-generation
    [ ] Implement Feedback Section

### Privacy
    [ ] Privacy Statement collapsible
    [ ] Data Kill Button

# Data Collection
    - Send data to firestore at every tick
    [ ] Gather neural network response at each tick
    [ ] Gather user response at each tick
    [ ] Send them to the same document

# Before Launch
    [ ] Deploy to Netlify at a beta testing url (bachduet.com/beta)

# Documentations
    [ ] Why use this repo for your presentation?
    [ ] Project Overview and Structure Overview
    [ ] Design Guidelines
    [ ] How to deploy
    [ ] Quick Start Guide: How to quickly import your module?
    [ ] How to swap out models

# Cool to have things
    [ ] Map part of the keyboard to Cello and part to violin
    [ ] Electric Piano

# GUI
    [ ] Detect which key we are in, display notes in sharp or flat.