const func = {
  
}

const app = {
  'init': () => {
  },
  'scroll': () => {
  },
  'load': () => {
  },
  'resize': () => {
  },
};

app.init();
window.addEventListener("load", () => {
  app.load();
});
window.addEventListener("resize", () => {
  app.resize();
});
window.addEventListener("scroll", () => {
  app.scroll();
})