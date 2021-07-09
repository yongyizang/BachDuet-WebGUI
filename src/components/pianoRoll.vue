<template>
  <div id="pianoRoll" class="pianoRollClass"> </div>
</template>

<script>
const MIN_WIDTH = 0
const MAX_WIDTH = 3000
const MIN_HEIGHT = 0
const MAX_HEIGHT = 3000

// TODO: implement all functions of pianoRoll again using Vue.
// Another layer of abstraction.
// export default {
//     props: {
//         width: {
//             type: Number,
//         }
//     }
// }

var pianoRoll = pixiPianoRoll({
    width: 900,
    height: 400,
    noteColor: 0xdb000f,
    gridLineColor: 0x333333,
    backgroundColor: 0x1a0002,
    bpm: 140,
    antialias: true,
    zoom: 4,
    resolution: 2,
    time: '0:0:0',
    renderer: 'WebGLRenderer',
    noteFormat: 'String',
    noteData: [
        ['0:0:0', 'C4', '2n'],
        ['0:0:0', 'D4', '2n'],
        ['0:0:0', 'E4', '2n'],
        ['0:2:0', 'B4', '4n'],
        ['0:3:0', 'A#4', '4n']
    ]
});

document.getElementsById('pianoRoll')[0].appendChild(pianoRoll.view);
</script>