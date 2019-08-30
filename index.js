import Agent from "./classes/agent.js";
import Wall from "./classes/wall.js";
import Particle from "./classes/particle.js";
import Trainer from "./classes/trainer.js";
import Text from "./classes/text.js";

function initGame() {
  game.ball = new Particle(p5.createVector(0, ref_w / 4));
  game.ball.r = 0.5;

  // game.agent1 = game.agent1 || new Agent(-1, p5.createVector(-ref_w / 4, 1.5), p5.color(240, 75, 0, 255));
  game.agent1 = game.agent1 || new Agent(-1, p5.createVector(-ref_w / 4, 1.5), p5.color(255, 220, 0, 255));
  // game.agent2 = game.agent2 || new Agent(1, p5.createVector(ref_w / 4, 1.5), p5.color(0, 150, 255, 255));
  game.agent2 = game.agent2 || new Agent(1, p5.createVector(ref_w / 4, 1.5), p5.color(46, 230, 64, 255));

  game.agent1.setOpponent(game.agent2); // point agent to the other agent as an opponent.
  game.agent2.setOpponent(game.agent1);

  human1 = false;
  human2 = false;

  const text = new Text(40000, $('#bubble'));
  text.initInterval();

  delayScreen.init(initDelayFrames);
}

// updates game element according to physics
function update(nStep) {

  let result = 0;

  for (let step = 0; step < nStep; step++) {

    // ai here
    // update internal states
    game.agent1.updateAndGetState();
    game.agent2.updateAndGetState();
    // push states to brain

    game.agent1.brain.setCurrentInputState(game.agent1, game.agent2);
    game.agent2.brain.setCurrentInputState(game.agent2, game.agent1);

    // make a decision
    game.agent1.brain.forward();
    game.agent2.brain.forward();

    // convert brain's output into actions
    game.agent1.setBrainAction();
    game.agent2.setBrainAction();

    // get human keyboard control
    if (!trainingMode) {
      if (!trainingVersion) {
        keyboardControl();
        touchControl();
      }
      betweenGameControl();
    }

    // process actions
    game.agent1.processAction();
    game.agent2.processAction();
    game.agent1.update();
    game.agent2.update();

    if (delayScreen.status() === true) {
      game.ball.applyAcceleration(gravity);
      game.ball.limitSpeed(0, maxBallSpeed);
      game.ball.move();
    }

    if (game.ball.isColliding(game.agent1)) {
      game.ball.bounce(game.agent1);
    }
    if (game.ball.isColliding(game.agent2)) {
      game.ball.bounce(game.agent2);
    }
    if (game.ball.isColliding(game.fenceStub)) {
      game.ball.bounce(game.fenceStub);
    }

    result = game.ball.checkEdges();
    if (Math.abs(result) > 0) {
      // make graphics for dead ball DEAD BALL GAME OVER
      if (!trainingMode) {
        game.deadball = new Particle(game.ball.loc.copy());
        game.deadball.r = 0.5;
        game.deadball.life = initDelayFrames;
      }
      initGame();
      if (!trainingMode) {

        // Set text
        speachBubble.addClass('show').text('player ' + (result > 0 ? '1' : '2') + ' won.');
        setTimeout(() => speachBubble.removeClass('show').text(''), 2000);

        if (result > 0) {
          game.agent1.score += 1;
          game.agent1.scoreSize *= 4;
          game.agent1.emotion = "happy";
          game.agent2.emotion = "sad";
        } else {
          game.agent2.score += 1;
          game.agent2.scoreSize *= 4;
          game.agent2.emotion = "happy";
          game.agent1.emotion = "sad";
        }
      }
      return result;
    }

  }

  return result; // 0 means no one won, -1 means ball landed on left side, 1 means ball landed on right side.
}

function keyboardControl() {

  // player 1:
  var a1_forward = 68; // D
  var a1_backward = 65; // A
  var a1_jump = 87; // W

  // player 2:
  var a2_forward = p5.LEFT_ARROW;
  var a2_backward = p5.RIGHT_ARROW;
  var a2_jump = p5.UP_ARROW;

  if (p5.keyIsDown(a1_forward) || p5.keyIsDown(a1_backward) || p5.keyIsDown(a1_jump)) {
    human1 = true;
    humanHasControlled = true;
  }
  if (human1) {
    game.agent1.setAction(p5.keyIsDown(a1_forward), p5.keyIsDown(a1_backward), p5.keyIsDown(a1_jump));
  }

  if (p5.keyIsDown(a2_forward) || p5.keyIsDown(a2_backward) || p5.keyIsDown(a2_jump)) {
    human2 = true;
    humanHasControlled = true;
  }
  if (human2) {
    game.agent2.setAction(p5.keyIsDown(a2_forward), p5.keyIsDown(a2_backward), p5.keyIsDown(a2_jump));
  }

}

function touchControl() {
  let
    paddingY = p5.height / 64,
    paddingX = p5.width / 64,
    dx = 0,
    dy = 0,
    x = 0,
    y = 0,
    agentX = toX(game.agent2.loc.x),
    agentY = toY(game.agent2.loc.y),
    jumpY = toY(ref_wallheight * 2),
    gestureEvent = false;

  if (p5.touchIsDown) {
    x = p5.touchX;
    y = p5.touchY;
    dx = p5.touchX - p5.ptouchX;
    dy = p5.touchY - p5.ptouchY;
    gestureEvent = true;
  }

  if (p5.mouseIsPressed) {
    x = p5.mouseX;
    y = p5.mouseY;
    dx = p5.mouseX - p5.pmouseX;
    dy = p5.mouseY - p5.pmouseY;
    gestureEvent = true;
  }

  if (p5.gestureEvent) {
    human2 = true;
    humanHasControlled = true;
    game.agent2.setAction((x - agentX) < -paddingX, (x - agentX) > paddingX, dy < -paddingY);
  }

}

// between end of this match to the next match.  player wins => jumps :), player loses => sad :(
function betweenGameControl() {
  const agents = [game.agent1, game.agent2];
  if (delayScreen.life > 0) {
    agents.forEach(e => e.action.jump = e.emotion === "happy");
  } else {
    agents[0].emotion = "happy";
    agents[1].emotion = "happy";
  }
}

function getNNDebugString() {
  let result = "";
  result += "agent1:\n";
  result += "input1: " + JSON.stringify(game.agent1.brain.getInputStateString()) + "\n";
  result += "output1: " + JSON.stringify(game.agent1.brain.getOutputStateString()) + "\n";
  result += "agent2:\n";
  result += "input2: " + JSON.stringify(game.agent2.brain.getInputStateString()) + "\n";
  result += "output2: " + JSON.stringify(game.agent2.brain.getOutputStateString()) + "\n";
  return result;
}

function arrayToString(x, precision = 1000) {
  let result = "[";
  for (let i in x) {
    result += Math.round(precision * x[i]) / precision;
    if (i < x.length - 1) {
      result += ",";
    }
  }
  result += "]";

  return result;
}

let
  pNoiseSeed = 0,
  pNoiseSeed2 = 0;

function getNextNoise() {
  let
    pFactor = 1000,
    f = 5;

  pNoiseSeed2 = pNoiseSeed2 || 0;
  pNoiseSeed2 += 1;
  return (p5.noise(pNoiseSeed2 / pFactor) - 0.5) * f;
}

function drawArrowKeyboard(x, y, s1, c, intensity, theColor) {

  let
    rc = p5.red(theColor),
    gc = p5.green(theColor),
    bc = p5.blue(theColor);

  function nextNoise() {
    var pFactor = 10;
    var f = 5;
    pNoiseSeed = pNoiseSeed || 0;
    pNoiseSeed += 1;
    return (p5.noise(pNoiseSeed / pFactor) - 0.5) * f;
  }

  function drawArrowKey(x, y, s, r) {


    var f = 5;
    //console.log(nextNoise());
    p5.stroke(rc, gc, bc, intensity);
    p5.noFill();
    p5.beginShape();
    var x1offset = nextNoise();
    var y1offset = nextNoise();
    var x2offset = nextNoise();
    var y2offset = nextNoise();
    var x3offset = nextNoise();
    var y3offset = nextNoise();
    p5.curveVertex(x - s + x1offset, y + s - r + y1offset);
    p5.curveVertex(x - s + x2offset, y - s + r + y2offset);
    p5.curveVertex(x - s + r + x3offset, y - s + y3offset);
    p5.curveVertex(x + s - r + nextNoise(), y - s + nextNoise());
    p5.curveVertex(x + s + nextNoise(), y - s + r + nextNoise());
    p5.curveVertex(x + s + nextNoise(), y + s - r + nextNoise());
    p5.curveVertex(x + s - r + nextNoise(), y + s + nextNoise());
    p5.curveVertex(x - s + r + nextNoise(), y + s + nextNoise());
    p5.curveVertex(x - s + x1offset, y + s - r + y1offset);
    p5.curveVertex(x - s + x2offset, y - s + r + y2offset);
    p5.curveVertex(x - s + r + x3offset, y - s + y3offset);
    p5.endShape();
    p5.noStroke();
  }

  var s2 = s1 * 0.8;
  var r1 = s1 * 0.2;
  var r2 = s2 * 0.2;
  var fontSize = 32;

  function drawFullKey(x, y, c) {
    drawArrowKey(x, y, s1 / 2, r1);
    drawArrowKey(x, y, s2 / 2, r2);

    p5.stroke(rc, gc, bc, intensity);
    p5.fill(rc, gc, bc, intensity);

    p5.text(c, x + nextNoise() / 1 - fontSize / 2, y + nextNoise() / 1 + fontSize / 4);
  }

  p5.textFont("monospace");
  p5.textSize(fontSize);
  drawFullKey(x - s1, y, c[0]);
  drawFullKey(x, y - s1, c[1]);
  drawFullKey(x + s1, y, c[2]);

}

function drawAgentKeyboard(x, y, s, n, intensity, theColor) {
  let c = n == 2 ? ['◀', '▲', '▶'] : ['ａ', 'ｗ', 'ｄ'];
  drawArrowKeyboard(x, y, s, c, intensity, theColor);
}

new p5(p5 => {
  window.p5 = p5;

  p5.preload = () => {
    bounceSound = p5.loadSound("./sounds/bounce.mp3");
    bounceSound.setVolume(.5);
  }

  p5.setup = () => {

    $('.sound-control').click(function () {
      bounceSound.setVolume($(this).find('i').hasClass('fa-volume-off') ? .5 : 0);
      $(this).find('i').toggleClass('fa-volume-up fa-volume-off');
    });

    // deal with mobile devices
    md = new MobileDetect(window.navigator.userAgent);

    myCanvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    factor = p5.windowWidth / ref_w;
    ref_h = ref_w;
    myCanvas.parent('p5Container');
    p5.frameRate(theFrameRate);

    gravity = p5.createVector(0, theGravity);

    // setup game objects
    game.ground = new Wall(0, 0.75, ref_w, ref_u);
    game.ground.c = p5.color(255, 84, 64, 255);
    game.fence = new Wall(0, 0.75 + ref_wallheight / 2, ref_wallwidth, (ref_wallheight - 1.5));
    game.fence.c = p5.color(240, 210, 130, 255);
    game.fenceStub = new Particle(p5.createVector(0, ref_wallheight), p5.createVector(0, 0), ref_wallwidth / 2, p5.color(240, 210, 130, 255));

    initGame();

    trainer = new Trainer(game.agent1.brain, initGene);
    game.agent1.brain.populate(trainer.getChromosome());
    game.agent2.brain.populate(trainer.getChromosome());
  };

  p5.draw = () => {

    let result = 0;

    p5.background('rgba(0,0,0, 1)');
    p5.background('rgba(0,0,0, 0)');

    // draw box around frame

    result = update(1);

    if (result !== 0 && trainingVersion) { // someone has lost
      let genStep = 50;
      console.log('training generation #' + (generationCounter + genStep));
      for (let i = 0; i < genStep; i++) {
        trainer.train();
      }
      // print results
      for (i = 0; i < 4; i++) {
        console.log('#' + i + ':' + Math.round(100 * trainer.getChromosome(i).fitness) / 100);
      }
      var N = trainer.trainer.population_size;
      for (i = N - 4; i < N; i++) {
        console.log('#' + i + ':' + Math.round(100 * trainer.getChromosome(i).fitness) / 100);
      }
      if (trainingVersion) {
        $("#nn_gene").text(JSON.stringify(trainer.getChromosome()));
        console.log('--- start trained gene ---');
        console.log(JSON.stringify(trainer.getChromosome()));
        console.log('--- end of trained gene---');
      }
      generationCounter += genStep;
      initGame();
      game.agent1.brain.populate(trainer.getChromosome(0)); // best one
      game.agent2.brain.populate(trainer.getChromosome(1)); // second best one
    }

    // draw the game objects
    // drawScenery();
    game.agent1.display();
    game.agent2.display();

    if (!mobileMode && !humanHasControlled) {
      let intensity = 64 * Math.min(16 * (delayScreen.life / initDelayFrames) * (initDelayFrames - delayScreen.life) / initDelayFrames, 64);
      drawAgentKeyboard(p5.width / 4, toY(ref_wallheight * 1), p5.width / 12, 1, intensity, game.agent1.c);
      drawAgentKeyboard(3 * p5.width / 4, toY(ref_wallheight * 1), p5.width / 12, 2, intensity, game.agent2.c);
    }

    game.ball.c = p5.color(255, 200, 20, 255 * Math.max((initDelayFrames - delayScreen.life) / initDelayFrames, 0));
    game.ball.display();
    game.ground.display();
    game.fence.display();
    game.fenceStub.display();

    // prints agent states (used for nn input)
    if (trainingVersion) {
      game.agent1.printState();
      game.agent2.printState();
    }

    // game.agent1.drawState(human1);
    // game.agent2.drawState(human2);

    game.agent1.drawScore();
    game.agent2.drawScore();

    // draw dead ball
    if (game.deadball) {
      game.deadball.life -= 1;
      game.deadball.c = p5.color(250, 0, 0, 128 * (game.deadball.life / initDelayFrames));
      game.deadball.display();
      if (game.deadball.life <= 0) {
        game.deadball = null;
      }
    }

  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    myCanvas.size(p5.windowWidth, p5.windowHeight);
    factor = p5.windowWidth / ref_w;
  }
});