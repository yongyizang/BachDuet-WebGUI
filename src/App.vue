<template>
  <div id="app">
    <div ref="LoadingScreen" id="LoadingScreen">
      <div class="center">
        <p ref="workerStatus" class="loadingStatus">
          Loading Static Files for BachDuet...
        </p>
        <div class="loader">
  <div class="loaderBar"></div>
</div>
      </div>
    </div>
    <router-view />
  </div>
</template>
<script>
export default {
  watch: {
    $route() {
      this.$nextTick(this.routeLoaded);
    },
  },
  data() {
    return {};
  },
  methods: {
    routeLoaded() {
      this.$refs.LoadingScreen.style.display = "none";
    },
  },
  mounted() {
    /* The route will not be ready in the mounted hook if it's component is async
so we use $router.onReady to make sure it is.
it will fire right away if the router was already loaded, so catches all the cases.
Just understand that the watcher will also trigger in the case of an async component on mount
because the $route will change and the function will be called twice in this case,
it can easily be worked around with a local variable if necessary
*/
    this.$router.onReady(() => this.routeLoaded());
  },
};
</script>

<style>
#app {
  font-family: source-serif-pro, serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  background-color: rgb(243, 225, 190);
  overflow: hidden;
  padding: 0;
  margin: 0;
  height: 100%;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

#LoadingScreen {
  position: absolute;
  z-index: 1;
  height: 100%;
  width: 100%;
}

.center {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.loader { 
  width:500px; 
  margin:0 auto;
  border-radius:10px;
  border:4px solid transparent;
  position:relative;
  padding:1px;
}
.loader:before {
  content:'';
  border:1px solid rgb(89, 50, 54); 
  border-radius:10px;
  position:absolute;
  top:-4px; 
  right:-4px; 
  bottom:-4px; 
  left:-4px;
}
.loader .loaderBar { 
  position:absolute;
  border-radius:10px;
  top:0;
  right:100%;
  bottom:0;
  left:0;
  background:rgb(89, 50, 54); 
  width:0;
  animation:borealisBar 1s linear infinite;
}

@keyframes borealisBar {
  0% {
    left:0%;
    right:100%;
    width:0%;
  }
  10% {
    left:0%;
    right:75%;
    width:25%;
  }
  90% {
    right:0%;
    left:75%;
    width:25%;
  }
  100% {
    left:100%;
    right:0%;
    width:0%;
  }
}
</style>
