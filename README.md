# BachDuet Web GUI
A Web GUI for BachDuet.

## What's Done Now?
- Keyboard UI, with Oct Up and Down.
- Demo Playback, playing back midi.
- Piano instrument, along with other samplers (cello and violin) available.

## TODOs
- [BUG] Keyboard UI does not trigger the active state when in demo playback.
- [BUG] Piano samples are lagging in sample triggering. It appears now all samples are loaded for every change.
- [IMPROVEMENT] Add Metronome feature. Right now it's just a dummy button.
- [IMPROVEMENT] Replace the piano sample with full range and better sounding. This sounds like shit.
- [IMPROVEMENT] Write a good button style.
- [IMPROVEMENT] Try to integrate Vuex for global status management.

## How to run?

### Project setup
For first time installment, run this in the root directory.
```
npm install
```

### Compiles and hot-reloads for development
After first installment, run this command, then use the browser.
```
npm run serve
```
You may need Vue DevTools, available in Google Chrome Store.

### Compiles and minifies for production
```
npm run build
```