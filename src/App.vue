<template>
  <div id="app">
      <!-- It does nothing more than pull up router-view. -->
      <!-- Router-view right now just spits out the GUI vue file. -->
      <router-view />
  </div>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

html body {
  margin: 0;
  padding: 0;
}

html {
  box-sizing: border-box;
}

*,
*:after,
*:before {
  box-sizing: inherit;
}
</style>