# Settings Modal
### App Settings
    [ ] Metronome Frequency Implementation with Buttons
    [C] Temperature slider. Linear scale. Don't display number to user; Less Random - More Random
    [C] Reset button on the main UI. Manual control to reset the network.
    [C] Predifined hidden states for the neural net

### MIDI Device
    [ ] Integrate MIDI module to settings modal
    [ ] Integrate MIDI alert into global alert system
    [ ] If user browser doesn't support Web MIDI, then just display an error message.

# External Logic
    [ ] Before user click play, nothing in the UI should respond
    [C] Timeout, if user doesn't play anything for ~10 secs? pause the clock.
    [C] Auto-reset. If the neural network is playing the same note for x seconds, then reset the neural network.
    [C] Misalignment. If the neural network is outputting a different tick than current tick, send out warning.    

### Reverb & Mixing Console
    [ ] Implement some reverb choices
    [ ] Design and create Mixing console Modal
    [ ] Reverb amount control
    [ ] Reverb choice control (Small? Large? etc.)
    [ ] Volume controls

### Feedback Modal
    [C] Christo: Waiting for Christo to design feedback questions
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
    [C] Quick Start Guide: How to quickly import your module?
    [C] How to swap out models

# Cool to have things
    [ ] Map part of the keyboard to Cello and part to violin
    [ ] Electric Piano

# GUI
    [ ] Detect which key we are in, display notes in sharp or flat.