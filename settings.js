
window.p5Vector = p5.Vector;

let speachBubble = $('#bubble');
let showArrowKeys = false;
let ref_w = 24 * 2;
let ref_h = ref_w;
let ref_u = 1.5; // ground height
let ref_wallwidth = 1.0; // wall width
let ref_wallheight = 3.5;
let factor = 1;
let playerSpeedX = 10 * 1.75;
let playerSpeedY = 10 * 1.35;
let maxBallSpeed = 15 * 1.5;
let gravity;
let timeStep = 1 / 30;
let theFrameRate = 40 * 1;
let nudge = 0.1;
let friction = 1.0; // 1 means no friction, less means friction
let windDrag = 1.0;
let initDelayFrames = 30 * 2 * 1;
let trainingFrames = 30 * 20; // assume each match is 7 seconds. (vs 30fps)
let theGravity = -9.8 * 2 * 1.5;
let trainingMode = false;
let human1 = false; // if this is true, then player 1 is controlled by keyboard
let human2 = false; // same as above
let humanHasControlled = false;
let trainer = null;
let generationCounter = 0;
let baseScoreFontSize = 64;
let bounceSound;
//let trainingVersion = false; // this variable is stored on html file pro.html

let initGeneJSON = '{"fitness":1.3846153846153846,"nTrial":0,"gene":{"0":7.5719,"1":4.4285,"2":2.2716,"3":-0.3598,"4":-7.8189,"5":-2.5422,"6":-3.2034,"7":0.3935,"8":-6.7593,"9":-8.0551,"10":1.3679,"11":2.1859,"12":1.2202,"13":-0.49,"14":-0.0316,"15":0.5221,"16":0.7026,"17":0.4179,"18":-2.1689,"19":1.646,"20":-13.3639,"21":1.5151,"22":1.1175,"23":-5.3561,"24":5.0442,"25":0.8451,"26":0.3987,"27":-2.6158,"28":0.4318,"29":-0.7361,"30":0.5715,"31":-2.9501,"32":-3.7811,"33":-5.8994,"34":6.4167,"35":2.5014,"36":7.338,"37":-2.9887,"38":2.4586,"39":13.4191,"40":2.7395,"41":-3.9708,"42":1.6548,"43":-2.7554,"44":-1.5345,"45":-6.4708,"46":-4.4454,"47":-0.6224,"48":-1.0988,"49":4.4501,"50":9.2426,"51":-0.7392,"52":0.4452,"53":1.8828,"54":-2.6277,"55":-10.851,"56":-3.2353,"57":-4.4653,"58":-3.1153,"59":-1.3707,"60":7.318,"61":16.0902,"62":1.4686,"63":7.0391,"64":1.7765,"65":-4.9573,"66":-1.0578,"67":1.3668,"68":-1.4029,"69":-1.155,"70":2.6697,"71":-8.8877,"72":1.1958,"73":-3.2839,"74":-5.4425,"75":1.6809,"76":7.6812,"77":-2.4732,"78":1.738,"79":0.3781,"80":0.8718,"81":2.5886,"82":1.6911,"83":1.2953,"84":-5.5961,"85":2.174,"86":-3.5098,"87":-5.4715,"88":-9.0052,"89":-4.6038,"90":-6.7447,"91":-2.5528,"92":0.4391,"93":-4.9278,"94":-3.6695,"95":-4.8673,"96":-1.6035,"97":1.5011,"98":-5.6124,"99":4.9747,"100":1.8998,"101":3.0359,"102":6.2983,"103":-2.703,"104":1.5025,"105":6.1841,"106":-0.9357,"107":-4.8568,"108":-2.1888,"109":-4.1143,"110":-3.9874,"111":-0.0459,"112":4.7134,"113":2.8952,"114":-9.3627,"115":-4.685,"116":0.3601,"117":-1.3699,"118":9.7294,"119":11.5596,"120":0.1918,"121":3.0783,"122":-6.6828,"123":-5.4398,"124":-5.088,"125":3.6948,"126":0.0329,"127":-0.1362,"128":-0.1188,"129":-0.7579,"130":0.3278,"131":-0.977,"132":-0.9377,"133":2.2935,"134":-2.0353,"135":-1.7786,"136":5.4567,"137":-3.6368,"138":3.4996,"139":-0.0685}}';

let initGeneRaw = JSON.parse(initGeneJSON);

let initGene = convnetjs.zeros(Object.keys(initGeneRaw.gene).length); // Float64 faster.
for (let i = 0; i < initGene.length; i++) {
  initGene[i] = initGeneRaw.gene[i];
}

//initGene = null;

// html elements
let myCanvas;

let handSymbolDisplayed = true;

/*
var intro = {
  text: null,
};
*/

// declare objects
const game = {
  ball: null,
  deadball: null,
  ground: null,
  fence: null,
  fenceStub: null,
  agent1: null,
  agent2: null
};

let
  mobileMode = false,
  md = null;

// conversion to pixels
function toX(x) {
  return (x + ref_w / 2) * factor;
}
function toP(x) {
  return (x) * factor;
}
function toY(y) {
  return p5.height - y * factor;
}

let delayScreen = {
  life: initDelayFrames,
  init: function (life) {
    this.life = life;
  },
  status: function () {
    if (this.life === 0) {
      return true;
    }
    this.life -= 1;
    return false;
  }
};