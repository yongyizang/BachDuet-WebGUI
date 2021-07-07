# BachDuet Web GUI
A Web GUI for BachDuet.
Still under development. Basically nothing has been done. It doesn't work at all. Don't install BachDuet. BachDuet is not ready! He will suffer! It's not his decision to be born!

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

## How's the project organized?
In short it's a silly little standard Vue project.

### Routing
This project is built using `Vue-cli`, so I used the `Vue-router` module. It's at `/src/router/index.js` right now.

### Static files
Static files, as their names suggest, are static. They are stored in `/public`.

`index.html` serves as a very bare minimum template for the entire project. Right now it basically has nothing in it.

`/audio` directory stores MIDI and sample audio right now.

`robots.txt` as the name suggest, is the default robots.txt that search engines use to determine how their spider should work.

### src/main.js, src/App.vue and router
`.vue` files are Vue Single File Componment (SFC). You could check [here](https://vuejs.org/v2/guide/single-file-components.html) for more information on that.

`main.js` is the entry point of the entire program, which imports Vue, Vue-Router and other stuff we need, including the `App.vue` file, which acts as the "in-fact" template. It calls `<router-view>`, defined in the routing file as mentioned above `/src/router/index.js`. The router-view deciphers the url, then return the `/src/views/Piano.vue`, the actual view we are looking for.

Till now, we actually have three layers of "templates". So let's go through them again to try to figure out how they are connected.

First, we have `main.js`, the entry point. It introduces in Vue, router, other stuff we need, along with the next step, `App.vue`.

Then, in `App.vue` (which is a SFC), we have a `<template>` and some basic stylesheets, then it calls the `<ruoter-view>`.

Then, `<router-view>`, which belongs in `/src/router/index.js`, looks at the browser's URL. It determines that since the path right now is `"/"`, it should return the piano view, which is `/src/views/Piano.vue`.

Why is understanding this important? By understanding this, we could gain insight on how to alter the process. For example, if we need to introduce new libraries earlier on the way, we could introduce them in `main.js`. If we need to alter the CSS properties on `body` and `html` element, we could change `App.vue`. If we need to change the router rules (e.g. add a new view), we could just alter the `/src/router/index.js` file.