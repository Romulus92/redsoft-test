"use strict";

var func = {};
var app = {
  'init': function init() {},
  'scroll': function scroll() {},
  'load': function load() {},
  'resize': function resize() {}
};
app.init();
window.addEventListener("load", function () {
  app.load();
});
window.addEventListener("resize", function () {
  app.resize();
});
window.addEventListener("scroll", function () {
  app.scroll();
});