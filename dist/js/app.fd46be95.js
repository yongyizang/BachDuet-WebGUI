(function(e){function t(t){for(var a,r,c=t[0],u=t[1],l=t[2],s=0,d=[];s<c.length;s++)r=c[s],Object.prototype.hasOwnProperty.call(i,r)&&i[r]&&d.push(i[r][0]),i[r]=0;for(a in u)Object.prototype.hasOwnProperty.call(u,a)&&(e[a]=u[a]);f&&f(t);while(d.length)d.shift()();return o.push.apply(o,l||[]),n()}function n(){for(var e,t=0;t<o.length;t++){for(var n=o[t],a=!0,r=1;r<n.length;r++){var c=n[r];0!==i[c]&&(a=!1)}a&&(o.splice(t--,1),e=u(u.s=n[0]))}return e}var a={},r={app:0},i={app:0},o=[];function c(e){return u.p+"js/"+({piano:"piano"}[e]||e)+"."+{piano:"88ce1aaa"}[e]+".js"}function u(t){if(a[t])return a[t].exports;var n=a[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,u),n.l=!0,n.exports}u.e=function(e){var t=[],n={piano:1};r[e]?t.push(r[e]):0!==r[e]&&n[e]&&t.push(r[e]=new Promise((function(t,n){for(var a="css/"+({piano:"piano"}[e]||e)+"."+{piano:"e03394fc"}[e]+".css",i=u.p+a,o=document.getElementsByTagName("link"),c=0;c<o.length;c++){var l=o[c],s=l.getAttribute("data-href")||l.getAttribute("href");if("stylesheet"===l.rel&&(s===a||s===i))return t()}var d=document.getElementsByTagName("style");for(c=0;c<d.length;c++){l=d[c],s=l.getAttribute("data-href");if(s===a||s===i)return t()}var f=document.createElement("link");f.rel="stylesheet",f.type="text/css",f.onload=t,f.onerror=function(t){var a=t&&t.target&&t.target.src||i,o=new Error("Loading CSS chunk "+e+" failed.\n("+a+")");o.code="CSS_CHUNK_LOAD_FAILED",o.request=a,delete r[e],f.parentNode.removeChild(f),n(o)},f.href=i;var m=document.getElementsByTagName("head")[0];m.appendChild(f)})).then((function(){r[e]=0})));var a=i[e];if(0!==a)if(a)t.push(a[2]);else{var o=new Promise((function(t,n){a=i[e]=[t,n]}));t.push(a[2]=o);var l,s=document.createElement("script");s.charset="utf-8",s.timeout=120,u.nc&&s.setAttribute("nonce",u.nc),s.src=c(e);var d=new Error;l=function(t){s.onerror=s.onload=null,clearTimeout(f);var n=i[e];if(0!==n){if(n){var a=t&&("load"===t.type?"missing":t.type),r=t&&t.target&&t.target.src;d.message="Loading chunk "+e+" failed.\n("+a+": "+r+")",d.name="ChunkLoadError",d.type=a,d.request=r,n[1](d)}i[e]=void 0}};var f=setTimeout((function(){l({type:"timeout",target:s})}),12e4);s.onerror=s.onload=l,document.head.appendChild(s)}return Promise.all(t)},u.m=e,u.c=a,u.d=function(e,t,n){u.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},u.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.t=function(e,t){if(1&t&&(e=u(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(u.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)u.d(n,a,function(t){return e[t]}.bind(null,a));return n},u.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return u.d(t,"a",t),t},u.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},u.p="/",u.oe=function(e){throw console.error(e),e};var l=window["webpackJsonp"]=window["webpackJsonp"]||[],s=l.push.bind(l);l.push=t,l=l.slice();for(var d=0;d<l.length;d++)t(l[d]);var f=s;o.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"034f":function(e,t,n){"use strict";n("85ec")},"56d7":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var a=n("2b0e"),r=n("2f62"),i=n("b85c"),o=n("2909"),c=(n("d3b7"),n("ddb0"),n("b0c0"),n("ac1f"),n("1276"),n("25f0"),n("b1f8")),u=n("3835"),l=n("d4ec"),s=n("bee2"),d=(n("d9e2"),n("4fad"),n("5319"),n("caad"),n("2532"),n("b64b"),n("5e54")),f=n("772f"),m=n("50e5"),p="/samples/",g={metronome:["C0","C#0"],harpischord:["C2","B6"]};function h(e,t){var n=Object(f["c"])(e),a=Object(f["c"])(t);if(n.height>=a.height)throw new Error("Reverse ranges are not yet implemented.");"b"===n.acc&&(n=Object(f["c"])(Object(m["b"])(n)));for(var r=[],i=0,o=a.height-n.height,c=n;i<o;i++)r.push(c),c=Object(f["c"])(Object(m["b"])(Object(f["d"])(c,"m2")));return r}var k=function(){function e(){Object(l["a"])(this,e),this.samplers={},this.sampleMaps={},this.generateSampleMaps()}return Object(s["a"])(e,[{key:"generateSampleMaps",value:function(){for(var e=0,t=Object.entries(g);e<t.length;e++){var n=Object(u["a"])(t[e],2),a=n[0],r=Object(u["a"])(n[1],2),i=r[0],o=r[1];this.sampleMaps[a]=h(i,o).reduce((function(e,t){return e[t.name]=t.name.replace("#","s")+".mp3",e}),{})}return this.sampleMaps}},{key:"getSamplerForInstrument",value:function(e,t){var n=this.samplers[e];return n||(createSampler(e,t),Object(c["a"])("sampler")),n}},{key:"createSampler",value:function(e,t){if(!Object.keys(g).includes(e))throw new Error("Invalid instrument - ".concat(e,". We don't currently support this instrument."));"function"!==typeof t&&(t=function(){});var n=new d["b"](this.sampleMaps[e],(function(){return t(n)}),"".concat(p).concat(e,"/"));return this.samplers[e]=n,n}}]),e}(),b=h("A0","C8"),v=Object(o["a"])(Array(16).keys()),S=b.reduce((function(e,t){return e[t.name]=!1,e}),{}),T=v.reduce((function(e,t){return e[t]={midi:0,artic:1,cpc:12,midiArticInd:96,name:"R"},e}),{}),y=v.reduce((function(e,t){return e[t]={midi:0,artic:1,cpc:12,midiArticInd:96,name:"R"},e}),{}),N=new a["default"].observable(S),I=new a["default"].observable(T),A=new a["default"].observable(y),w={pianoState:N,lastNotePlayed:"",lastNotePlayedOnTick:-1,lastHumanNote:{midi:-1,cpc:-1,name:"",dur:0,startTick:-1},lastAINote:{midi:0,cpc:12,name:"R",dur:1,startTick:-1},notesBuffer:[],aiPredictions:I,humanQuantizedInput:A,tokensDict:{}},O={getActiveNotes:function(e){var t,n=[],a=Object(i["a"])(b);try{for(a.s();!(t=a.n()).done;){var r=t.value;e.pianoState[r.name]&&n.push(r.name)}}catch(o){a.e(o)}finally{a.f()}return n},keyboardIsActive:function(e,t){return t.getActiveNotes.length>0},getAiPredictionFor:function(e){return function(t){return e.aiPredictions[t]}},getHumanInputFor:function(e){return function(t){return e.humanQuantizedInput[t]}},getPianoState:function(e){return e.pianoState},getLastNotePlayed:function(e){return e.lastNotePlayed},getLastNotePlayedOnTick:function(e){return e.lastNotePlayedOnTick},getNotesBuffer:function(e){return e.notesBuffer},getAiPredictions:function(e){return e.aiPredictions},getTokensDict:function(e){return e.tokensDict},getLastHumanNoteQuantized:function(e){return e.lastHumanNote},getLastAINoteQuantized:function(e){return e.lastAINote}},D={newAiPrediction:function(e,t){e.commit;var n=e.state,a=e.getters,r=t.midiArticInd,i=t.tick,o=a.getTokensDict.midiArtic.index2token[r],c=parseInt(o.split("_")[0]),u=parseInt(o.split("_")[1]),l=c%12;0==c&&(l=12);var s=a.getNextLocalTick(i);n.aiPredictions[s]={midi:c,artic:u,cpc:l,midiArticInd:r},0==c?0==n.lastAINote.midi?n.lastAINote.dur+=1:(n.lastAINote.midi=c,n.lastAINote.cpc=l,n.lastAINote.dur=1,n.lastAINote.startTick=a.getGlobalTick):1==u?(n.lastAINote.midi=c,n.lastAINote.cpc=l,n.lastAINote.dur=1,n.lastAINote.startTick=a.getGlobalTick):(console.assert(c===n.lastAINote.midi),n.lastAINote.dur+=1)},newHumanInputQuantized:function(e,t){e.commit;var n=e.state,a=e.getters,r=t.midi;while(r<28&&r>0)r+=12;while(r>94)r-=12;var i=r.toString()+"_"+t.artic.toString(),o=a.getTokensDict.midiArtic.token2index[i];n.humanQuantizedInput[a.getLocalTick]={midi:t.midi,artic:t.artic,cpc:t.cpc,midiArticInd:o},0===t.midi?0===n.lastHumanNote.midi?n.lastHumanNote.dur+=1:(n.lastHumanNote.midi=t.midi,n.lastHumanNote.cpc=t.cpc,n.lastHumanNote.name=t.name,n.lastHumanNote.dur=1,n.lastHumanNote.startTick=a.getGlobalTickDelayed()):1==t.artic?(n.lastHumanNote.midi=t.midi,n.lastHumanNote.cpc=t.cpc,n.lastHumanNote.name=t.name,n.lastHumanNote.dur=1,n.lastHumanNote.startTick=a.getGlobalTickDelayed()):(console.assert(t.midi===n.lastHumanNote.midi),n.lastHumanNote.dur+=1)},noteOn:function(e,t){e.commit;var n=e.state,a=e.getters;n.pianoState[t]=!0,n.notesBuffer.push(t),n.lastNotePlayed=t,n.lastNotePlayedOnTick=a.getGlobalTickDelayed()},noteOff:function(e,t){e.commit;var n=e.state;e.getters;n.pianoState[t]=!1}},P={clearNotesBuffer:function(e){e.notesBuffer=[]},setTokensDict:function(e,t){e.tokensDict=t}},j={state:w,getters:O,actions:D,mutations:P},C=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1],M=[0,-2,-1,-2,0,-2,-1,-2,0,-2,-1,-2,0,-2,-1,-2],H=[0,-3,-2,-3,-2,-4,-3,-4,-1,-3,-2,-3,-2,-4,-3,-4],L={globalTick:-1,localTick:-1,localTickDelayed:-1,globalTickDelayed:-1,barTick:-1,barNumber:0},_={getGlobalTick:function(e){return e.globalTick},getLocalTick:function(e){return e.localTick},getLocalTickDelayed:function(e){return e.localTickDelayed},getGlobalTickDelayed:function(e){return function(){return e.globalTickDelayed}},getBarTick:function(e){return e.barTick},getBarNumber:function(e){return e.barNumber},isNewBar:function(e){return e.localTick%16===0},getNextLocalTickAfter:function(e){return function(e){return(e+1)%16}},getNextLocalTick:function(e){return function(){return(e.localTick+1)%16}},getRhythmToken:function(e){return C[e.localTick].toString()+"_"+M[e.localTick].toString()+"_"+H[e.localTick].toString()}},G={},B={incrementTick:function(e){e.globalTick+=1,e.localTick+=1,e.barTick+=1,e.localTick=e.localTick%16,0==e.localTick&&(e.barNumber+=1),e.barTick=Math.floor(e.globalTick/16)},incrementTickDelayed:function(e){e.localTickDelayed+=1,e.localTickDelayed=e.localTickDelayed%16,e.globalTickDelayed+=1}},x={state:L,getters:_,actions:G,mutations:B},E={isDataCollecting:!0,sessionID:null,clockStatus:!1,clockInitialized:!1,bpm:90,frequency:4,temperature:.25,modalStatus:!1},z={getDataCollectingState:function(e){return e.isDataCollecting},getSessionID:function(e){return e.sessionID},getClockStatus:function(e){return e.clockStatus},getClockInitialized:function(e){return e.clockInitialized},getBPM:function(e){return e.bpm},getTemperature:function(e){return e.temperature},getModalStatus:function(e){return e.modalStatus}},R={},$={changeDataCollectionState:function(e,t){e.isDataCollecting=t,console.log(t)},writeSessionID:function(e,t){e.sessionID=t,console.log(t)},changeClockStatus:function(e){e.clockStatus=!e.clockStatus},setClockStatus:function(e,t){e.clockStatus=t},initializeClock:function(e){e.clockInitialized=!0},setBPM:function(e,t){e.bpm=t},changeModalStatus:function(e){e.modalStatus=!e.modalStatus},setTemperature:function(e,t){e.temperature=t}},Q={state:E,getters:z,actions:R,mutations:$};window.onclick=function(){d["e"](),d["c"].lookAhead=0};var F=(new k).createSampler("harpischord",(function(e){e.toDestination()})),q=(new k).createSampler("harpischord",(function(e){e.toDestination()})),U=(new k).createSampler("metronome",(function(e){e.release=.2})),V=(new d["a"]).toDestination();U.connect(V);var J={metronomeStatus:!0,userSamplerGain:0,AISamplerGain:0},K={getMetronomeStatus:function(e){return e.metronomeStatus},getUserSamplerGain:function(e){return e.userSamplerGain},getAISamplerGain:function(e){return e.AISamplerGain}},W={samplerOn:function(e,t){"user"==t.name?F.triggerAttack(t.note,t.time):"AI"==t.name?q.triggerAttack(t.note,t.time):"metronome"==t.name&&U.triggerAttack(t.note,t.time)},samplerOff:function(e,t){"user"==t.name?F.triggerRelease(t.note,t.time):"AI"==t.name&&q.triggerRelease(t.note,t.time)}},X={muteMetronome:function(e){V.mute=e.metronomeStatus},flipMetronomeStatus:function(e){e.metronomeStatus=!e.metronomeStatus},setUserPianoVolume:function(e,t){if(10==t)e.userSamplerGain=0;else{var n=-Math.abs(20*Math.log(t/10));e.userSamplerGain=n}F.volume.value=e.userSamplerGain},setAIPianoVolume:function(e,t){if(10==t)e.AISamplerGain=0;else{var n=-Math.abs(20*Math.log(t/10));e.AISamplerGain=n}q.volume.value=e.AISamplerGain}},Y={state:J,getters:K,actions:W,mutations:X};a["default"].use(r["a"]);var Z=new r["a"].Store({state:{},actions:{},mutations:{},getters:{},modules:{noteBuffers:j,tickNumber:x,globalSettings:Q,samplers:Y}}),ee=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("div",{ref:"LoadingScreen",attrs:{id:"LoadingScreen"}},[n("div",{staticClass:"center"},[n("p",{ref:"workerStatus",staticClass:"loadingStatus"},[e._v(" 正在加载 AI 巴赫的静态文件... ")]),e._m(0)])]),n("router-view")],1)},te=[function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"loader"},[n("div",{staticClass:"loaderBar"})])}],ne={watch:{$route:function(){this.$nextTick(this.routeLoaded)}},data:function(){return{}},methods:{routeLoaded:function(){this.$refs.LoadingScreen.style.display="none"}},mounted:function(){var e=this;this.$router.onReady((function(){return e.routeLoaded()}))}},ae=ne,re=(n("034f"),n("2877")),ie=Object(re["a"])(ae,ee,te,!1,null,null,null),oe=ie.exports,ce=(n("3ca3"),n("8c4f"));a["default"].use(ce["a"]);var ue=[{path:"/",name:"mainScreen",component:function(){return n.e("piano").then(n.bind(null,"7f94"))}}],le=new ce["a"]({mode:"history",base:"/",routes:ue}),se=le,de=n("0086"),fe=n.n(de),me=n("f206"),pe=n.n(me),ge=n("1881"),he=n.n(ge),ke=n("a65d"),be=n.n(ke),ve=n("4971"),Se=n.n(ve),Te=(n("24df"),n("9c30")),ye=(n("51de"),n("e094"),n("ab05"),n("ae2e")),Ne=n.n(ye);a["default"].use(Te["MdButton"]),a["default"].use(Te["MdIcon"]),a["default"].use(Te["MdField"]),a["default"].use(Ne.a),a["default"].component("VueSlider",Se.a),a["default"].use(he.a),a["default"].use(be.a,{duration:1e3}),a["default"].use(pe.a),a["default"].use(fe.a,{disableClick:!0,touchClass:"",tapTolerance:10,touchHoldTolerance:400,swipeTolerance:30,longTapTimeInterval:400,namespace:"touch"}),a["default"].config.productionTip=!1,new a["default"]({router:se,store:Z,render:function(e){return e(oe)}}).$mount("#app")},"85ec":function(e,t,n){}});
//# sourceMappingURL=app.fd46be95.js.map