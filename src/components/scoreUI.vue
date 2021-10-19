<template>
  <div id="pianoScores"></div>
</template>

<script>
import * as vextab from "@/library/vextab-div";
const DEFAULT_HEIGHT = 400;

const maxBarNum = 4;

const fakeAIData = [
  [1, "C4", "4n"],
  [5, "C#4", "4n"],
  [9, "C3", "4n"],
  [13, "C#3", "4n"],
  [17, "C4", "4n"],
  [23, "C#4", "4n"],
  [27, "C3", "4n"],
  [31, "C#3", "4n"],
];

const fakeHumanData = [
  [1, ["D4","C3"], "4n"],
  [5, "D#4", "4n"],
  [9, "D3", "4n"],
  [13, "D#3", "4n"],
  [17, "D4", "4n"],
  [23, "D#4", "4n"],
  [27, "D3", "4n"],
  [31, "D#3", "4n"],
];

function random_item(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomNote(input, clef = "high") {
  const notesArray = ["C", "D", "E", "F", "G", "A", "B"];
  const accidentals = ["#", "##", "@", "@@", ""];
  const rangesHigh = ["/4", "/5"];
  const rangesLow = ["/2", "/3"];
  var connector;
  if (input !== 3){
    connector = "-";
  } else {
    connector = " ";
  }
  var ranges;
  if (clef == "high"){
    ranges = rangesHigh;
  } else {
    ranges = rangesLow;
  }
  return random_item(notesArray) + random_item(ranges) + connector;
}

function noteParser(input, measureCount){
  // This function would pass an array of data for 1 player into a way VexTab could parse. Note: This function doesn't automatically generate rests. If you need rest, you have to pass it in manually.
  // call it as noteParser([], 3);
  if (!isNumber(measureCount) || measureCount < 1 || measureCount > 4){
    throw new Error("measureCount parameter is wrong. You entered: " + measureCount + ". We currently only support integar from 1 to 4. Try again.")
  }

  if (input[input.length-1][0] + input[1][0])


  var measure1 = [[],[]];
  var measure2 = [[],[]];
  var measure3 = [[],[]];
  var measure4 = [[],[]];

  var lastTickNumber = 1;

  // Iterate through every element within input array.
  for (var i = 0; i < input.length; i++) {
    var currentElement = input[i];
    if (i == 0) {
      var currentTickNumber = 1;
    } else {
      var currentTickNumber = currentElement[0]
    }
    // We fetch currentElememt from input.
    // so now, the currentElement would look like this:
    // [1, ["D4","C3"], "4n"]
    lastTickNumber = currentElement[0];
    // Set the lastTickNumber to the tickNumber of currentElement.
    if (i != 0)

  }
}

function isNumber (n) {
  return ! isNaN (n-0);
}

function vexTabParser(inputData) {
  // This function takes in data that's in the format of fakeHumanData or fakeAIData.
  var highClefUser = "";
  var bassClefUser = "";
  var highClefAI = "";
  var bassClefAI = "";
  if (!inputData) {
    for (var i = 0; i < maxBarNum; i++) {
      for (var j = 0; j < 4; j++){
      highClefUser += randomNote(j);
      bassClefUser += randomNote(j,"bass");
      highClefAI += randomNote(j);
      bassClefAI += randomNote(j,"bass");
      }
      highClefUser += "| ";
      bassClefUser += "| ";
      highClefAI += "| ";
      bassClefAI += "| ";
    }
    highClefUser += "||";
      bassClefUser += "|| ";
      highClefAI += "||";
      bassClefAI += "||";
  }
  return (
    "options width=" +
    (document.body.clientWidth - 100) +
    "\ntabstave notation=true tablature=false\nnotes " +
    highClefUser +
    "\n\ntabstave notation=true tablature=false clef=bass\nnotes " +
    bassClefUser +
    "\ntabstave notation=true tablature=false\nnotes " +
    highClefAI +
    "\n\ntabstave notation=true tablature=false clef=bass\nnotes " +
    bassClefAI
  );
}


export default {
  name: "scoreUI",
  props: {
    height: {
      type: Number,
      validator(value) {
        return value > 0 && value < document.body.clientWidth;
      },
      default() {
        return DEFAULT_HEIGHT;
      },
    },
  },

  data() {
    return {
      screenWidth: document.body.clientWidth,
      barWidth: document.body.clientWidth / maxBarNum,
      vextabContent: "",
    };
  },

  watch: {
    screenWidth: {
      immediate: true,
      handler(newValue) {
        console.log("changed");
      },
    },
  },

  mounted() {
    const vm = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        vm.screenWidth = window.screenWidth;
      })();
    };

    const VF = vextab.Flow;
    const Renderer = VF.Renderer;
    // Create VexFlow Renderer from canvas element with id #boo
    const renderer = new Renderer($("#pianoScores")[0], Renderer.Backends.SVG);

    // Initialize VexTab artist and parser.
    const artist = new vextab.Artist(50, 50, document.body.clientWidth, {
      scale: 1,
    });
    const tab = new vextab.VexTab(artist);

    var currentTime = Date.now();
    var currentRun = 1;
    setInterval(function(){
      tab.reset();
      artist.reset();
      tab.parse(vexTabParser());
      artist.render(renderer);
      console.log("Regenerate #" + currentRun);
      console.log("Time took: " + (Date.now() - currentTime))
      currentRun += 1;
      currentTime = Date.now();
    }, 100);
  },

  methods: {
    renderScore(){

    }
  },
};
</script>

<style scoped>
#pianoScores {
  z-index: 1;
  background-image: url("/paper-texture.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  width: 100%;
  position: fixed;
  top: 0;
  -webkit-box-shadow: 0px 8px 16px -6px #000000;
  box-shadow: 0px 8px 16px -6px #000000;
}
</style>
