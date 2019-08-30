
sign = Math.sign || function sign(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x))
    return x;

  return x > 0 ? 1 : -1;
};

function rectify(x, minValue, maxValue) {
  if (x > maxValue) return maxValue;
  if (x < minValue) return minValue;
  return x;
}

function getWidth() {
  return $(window).width() - 20 * 0;
}

function getHeight() {
  return $(window).height() - 20 * 0;
}

// useful helper functions
let getRandom = (min, max) => Math.random() * (max - min) + min;

let getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

let getRandomColor = alpha => p5.color(getRandomInt(127, 255), getRandomInt(127, 255), getRandomInt(127, 255), alpha ? alpha : 0);

let
  cosTable = new Array(360),
  sinTable = new Array(360),
  PI = Math.PI;

// pre compute sine and cosine values to the nearest degree
for (i = 0; i < 360; i++) {
  cosTable[i] = Math.cos((i / 360) * 2 * PI);
  sinTable[i] = Math.sin((i / 360) * 2 * PI);
}

let fastSin = xDeg => {
  let deg = Math.round(xDeg);
  if (deg >= 0) {
    return sinTable[(deg % 360)];
  }
  return -sinTable[((-deg) % 360)];
};

let fastCos = xDeg => {
  let deg = Math.round(Math.abs(xDeg));
  return cosTable[deg % 360];
};
