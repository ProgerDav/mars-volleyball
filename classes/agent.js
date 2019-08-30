// Happy Retangle !!

import Brain from './brain.js';

export default class Agent { //The happy Rectangle!!

  dir; // -1 === left && 1 === right
  loc;
  v = p5.createVector(0, 0);
  desiredVelocity = p5.createVector(0, 0);
  r = 1.5;
  c;
  opponent = null;
  score = 0;
  emotion = 'happy'; // Jumps at start
  scoreSize = baseScoreFontSize;
  action = { // Actions set by neural network
    forward: false,
    backward: false,
    jump: false,
  };
  actionIntensity = [0, 0, 0];
  state = { // Data used by neural network
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    bx: 0,
    by: 0,
    bvx: 0,
    bvy: 0
  };
  brain;

  constructor(dir, loc, c) {
    this.dir = dir;
    this.loc = loc;
    this.c = c;
    this.brain = new Brain(); //Neural network for this agent
  }

  setOpponent(opponent) {
    this.opponent = opponent;
  }

  setAction(forward, backward, jump) {
    this.action.forward = forward;
    this.action.backward = backward;
    this.action.jump = jump;
  };

  setBrainAction = function () {
    //Brain decides which is the best action
    // this function converts the brain's output layer into actions to move forward, backward, or jump
    var forward = this.brain.outputState[0] > 0.75; // sigmoid decision.
    var backward = this.brain.outputState[1] > 0.75; // sigmoid decision.
    var jump = this.brain.outputState[2] > 0.75; // sigmoid decision.
    this.setAction(forward, backward, jump);
  };

  processAction = function () { // convert action into real movement
    const { forward, backward, jump } = this.action;

    // reset velocity
    this.desiredVelocity.x = 0;
    this.desiredVelocity.y = 0;

    if (forward && !backward) {
      this.desiredVelocity.x = -playerSpeedX;
    }

    if (backward && !forward) {
      this.desiredVelocity.x = playerSpeedX;
    }

    if (jump) {
      this.desiredVelocity.y = playerSpeedY;
    }
  };

  move() {
    this.loc.add(p5Vector.mult(this.v, timeStep));
  };

  updateAndGetState() {
    this.state = {
      x: this.loc.x * this.dir,
      y: this.loc.y,
      vx: this.v.x * this.dir,
      vy: this.v.y,
      // ball 
      bx: game.ball.loc.x * this.dir,
      by: game.ball.loc.y,
      bvx: game.ball.v.x * this.dir,
      bvy: game.ball.v.y
    };
    return this.state;
  };

  printState() {
    let
      r = 10,
      stateText = '',
      state = this.updateAndGetState();

    stateText += 'X: ' + Math.round(state.x * r) / r + '\n';
    stateText += 'Y: ' + Math.round(state.y * r) / r + '\n';
    stateText += 'vx: ' + Math.round(state.vx * r) / r + '\n';
    stateText += 'vy: ' + Math.round(state.vy * r) / r + '\n';
    stateText += 'bx: ' + Math.round(state.bx * r) / r + '\n';
    stateText += 'by: ' + Math.round(state.by * r) / r + '\n';
    stateText += 'bvx: ' + Math.round(state.bvx * r) / r + '\n';
    stateText += 'bvy: ' + Math.round(state.bvy * r) / r + '\n';


    p5.fill(this.c);
    p5.stroke(this.c);
    p5.textFont("Courier New");
    p5.textSize(16);
    p5.text(stateText, toX(this.dir * ref_w / 4), toP(ref_u));
  };

  update() {
    this.v.add(p5Vector.mult(gravity, timeStep));

    if (this.loc.y <= ref_u + nudge * timeStep) {
      this.v.y = this.desiredVelocity.y;
    }

    this.v.x = this.desiredVelocity.x * this.dir;
    this.move();

    if (this.loc.y <= ref_u) { // max height
      this.loc.y = ref_u;
      this.v.y = 0;
    }

    // stay in their own half
    if (this.loc.x * this.dir <= (ref_wallwidth / 2 + this.r)) {
      this.v.x = 0;
      this.loc.x = this.dir * (ref_wallwidth / 2 + this.r);
    }
    if (this.loc.x * this.dir >= (ref_w / 2 - this.r)) {
      this.v.x = 0;
      this.loc.x = this.dir * (ref_w / 2 - this.r);
    }

  };
  display() {
    const
      { x, y } = this.loc,
      r = this.r;
    let
      angle = 60,
      eyeX = 0,
      eyeY = 0;

    if (this.dir === 1)
      angle = 135; // angle for right agent

    p5.noStroke();
    // p5.fill(this.c);
    // p5.ellipse(toX(x), toY(y), toP(r) * 2, toP(r) * 2);
    // p5.arc(toX(x), toY(y), toP(r)*2, toP(r)*2, Math.PI, 2*Math.PI);
    p5.fill(this.c);
    p5.rect(toX(x - r), toY(y + r), 2 * r * factor, r * factor);


    // Look at the ball

    let
      ballX = game.ball.loc.x - (x + (0.6) * r * fastCos(angle)),
      ballY = game.ball.loc.y - (y + (0.6) * r * fastSin(angle));

    if (this.emotion === "sad") {
      ballX = -this.dir;
      ballY = -3;
    }

    const dist = Math.sqrt(ballX * ballX + ballY * ballY);

    eyeX = ballX / dist;
    eyeY = ballY / dist;

    // eyeball
    p5.fill(255);
    p5.ellipse(toX(x + (0.6) * r * fastCos(angle)), toY(y + (0.6) * r * fastSin(angle)), toP(r) * 0.6, toP(r) * 0.6);
    p5.fill(0);
    p5.ellipse(toX(x + (0.6) * r * fastCos(angle) + eyeX * 0.15 * r), toY(y + (0.6) * r * fastSin(angle) + eyeY * 0.15 * r), toP(r) * 0.2, toP(r) * 0.2);

  };
  drawScore() {
    const
      r = p5.red(this.c),
      g = p5.green(this.c),
      b = p5.blue(this.c),
      size = this.scoreSize,
      factor = 0.95;

    this.scoreSize = baseScoreFontSize + (this.scoreSize - baseScoreFontSize) * factor;

    if (this.score > 0) {
      p5.textFont("Courier New");
      p5.textSize(size);
      p5.stroke(r, g, b, 128 * (baseScoreFontSize / this.scoreSize));
      p5.fill(r, g, b, 64 * (baseScoreFontSize / this.scoreSize));
      p5.textAlign(this.dir === -1 ? p5.LEFT : p5.RIGHT);
      p5.text(this.score, this.dir === -1 ? size * 3 / 4 : p5.width - size / 4, size / 2 + p5.height / 3);
    }

  };
};