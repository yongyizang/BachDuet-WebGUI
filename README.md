# BachDuet Web GUI
A Web GUI for BachDuet.

Still under development. Basically nothing has been done. It doesn't work at all. Don't install BachDuet. BachDuet is not ready! He will suffer! It's not his decision to be born!

This project is based on [this repo](https://github.com/sustained/sforzando), with many modifications.

## What's Done Now?
- Keyboard UI, with Oct Up and Down.
- Demo Playback, playing back midi.
- Piano instrument, along with other samplers (cello and violin) available.

## TODOs (immediate)
- [BUG] Keyboard UI does not trigger the active state when in demo playback.
- [BUG] Piano samples are lagging in sample triggering. It appears now all samples are loaded for every change.
- [IMPROVEMENT] Add a sufficient amount of commenting in codes, before the project turns into a pile of chaotic mess.
- [IMPROVEMENT] Replace the piano sample with full range and better sounding. This sounds like shit.
- [IMPROVEMENT] Write a good button style.

## Next Steps
- Add Metronome feature. Right now it's just a dummy button.
- Add piano roll. (Should the piano roll "Auto-Roll")? [pixi-piano-roll repo](https://github.com/mjhasbach/pixi-piano-roll)
- Add a function for MIDI device selection, test external midi device connectivity.
- Migrate old code into the project. functions: global ticks (timer), keyboard entry event.
- Try to integrate Vuex for global status management of the `piano-state` map.
- Implement a new view, "Internal Mode," with capability of playing with only computer keyboard. Restrict the on-screen keyboard with 2 octaves in this mode. Handle the change by a new url: `/internal-mode`. If there's no midi device detected, auto prompt user to use internal mode.
- Phone view support. Add a router page for diversion, get clientWindowHeight and its width, then diverse into different urls. If it's a phone, then prompt for turning to landscape with special need for bigger keys on keyboard. Don't display the piano roll in this mode.

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

## How's the project organized?
In short it's a silly little standard Vue project.

---

### Routing
This project is built using `Vue-cli`, so I used the `Vue-router` module. It's at `/src/router/index.js` right now.

---

### Static files
Static files, as their names suggest, are static. They are stored in `/public`.

`index.html` serves as a very bare minimum template for the entire project. Right now it basically has nothing in it.

`/audio` directory stores MIDI and sample audio right now.

`robots.txt` as the name suggest, is the default robots.txt that search engines use to determine how their spider should work.

---

### src/main.js, src/App.vue and router
`.vue` files are Vue Single File Componment (SFC). You could check [here](https://vuejs.org/v2/guide/single-file-components.html) for more information on that.

`main.js` is the entry point of the entire program, which imports Vue, Vue-Router and other stuff we need, including the `App.vue` file, which acts as the "in-fact" template. It calls `<router-view>`, defined in the routing file as mentioned above `/src/router/index.js`. The router-view deciphers the url, then return the `/src/views/main.vue`, the actual view we are looking for.

Till now, we actually have three layers of "templates". So let's go through them again to try to figure out how they are connected.

First, we have `main.js`, the entry point. It introduces in Vue, router, other stuff we need, along with the next step, `App.vue`.

Then, in `App.vue` (which is a SFC), we have a `<template>` and some basic stylesheets, then it calls the `<ruoter-view>`.

Then, `<router-view>`, which belongs in `/src/router/index.js`, looks at the browser's URL. It determines that since the path right now is `"/"`, it should return the main view, which is `/src/views/main.vue`.

Why is understanding this important? By understanding this, we could gain insight on how to alter the process. For example, if we need to introduce new libraries earlier on the way, we could introduce them in `main.js`. If we need to alter the CSS properties on `body` and `html` element, we could change `App.vue`. If we need to change the router rules (e.g. add a new view), we could just alter the `/src/router/index.js` file.

---

### library, components
All files in `/src/library` are independent. They are only dependent on a few libraries like Tone.js, which they introduce individually.
-  `instruments.js` provides utilities of defining sampler instruments.
- `math.js` provides helpful math utilities.
- `piano-state.js` provides a note map of all notes from A0 to C8, the full piano range.
- `music.js` is essentially a function, `createRange()`, that's used by both `instruments.js` and `piano-state.js`.  It takes in the start and end notes, and return a range of notes.

---

Currently there's only one component, `Piano.vue`. It defines a standard piano keyboard object. However, for decoupling purposes, the logic of changing octaves and automatic resizing are done in the main view, `/src/views/main.vue`.

The Piano component can be introduced in with the following grammar:
```
import Piano from "@/components/Piano.vue";
```

```
    <piano
      :octave-start="keyboardUIoctaveStart"
      :octave-end="keyboardUIoctaveEnd"
    />
```
