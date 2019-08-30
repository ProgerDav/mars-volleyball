export default class Brain {
  constructor() {
    this.nGameInput = 12; // 8 states for agent, plus 4 state for opponent
    this.nGameOutput = 3; // 3 buttons (forward, backward, jump)
    this.nRecurrentState = 4; // extra recurrent states for feedback.
    this.nOutput = this.nGameOutput + this.nRecurrentState;
    this.nInput = this.nGameInput + this.nOutput;

    // store current inputs and outputs
    this.inputState = convnetjs.zeros(this.nInput);
    this.convInputState = new convnetjs.Vol(1, 1, this.nInput); // compatible with convnetjs lib input.
    this.outputState = convnetjs.zeros(this.nOutput);
    this.prevOutputState = convnetjs.zeros(this.nOutput);

    // setup neural network:
    this.layer_defs = [];
    this.layer_defs.push({
      type: 'input',
      out_sx: 1,
      out_sy: 1,
      out_depth: this.nInput
    });
    this.layer_defs.push({
      type: 'fc',
      num_neurons: this.nOutput,
      activation: 'tanh'
    });

    this.net = new convnetjs.Net();
    this.net.makeLayers(this.layer_defs);

    var chromosome = new convnetjs.Chromosome(initGene);

    chromosome.pushToNetwork(this.net);
  }

  populate(chromosome) {
    chromosome.pushToNetwork(this.net);
  }

  arrayToString(x, precision) {
    let result = "[";
    for (let i in x) {
      result += Math.round(precision * x[i]) / precision;
      if (i < x.length - 1) {
        result += ",";
      }
    }
    result += "]";

    return result;
  };

  getInputStateString() {
    return this.arrayToString(this.inputState, 100);
  };

  getOutputStateString() {
    return this.arrayToString(this.outputState, 100);
  };

  setCurrentInputState(agent, opponent) {
    let
      i,
      scaleFactor = 10, // scale inputs to be in the order of magnitude of 10.
      scaleFeedback = 1; // to scale back up the feedback.

    this.inputState[0] = agent.state.x / scaleFactor;
    this.inputState[1] = agent.state.y / scaleFactor;
    this.inputState[2] = agent.state.vx / scaleFactor;
    this.inputState[3] = agent.state.vy / scaleFactor;
    this.inputState[4] = agent.state.bx / scaleFactor;
    this.inputState[5] = agent.state.by / scaleFactor;
    this.inputState[6] = agent.state.bvx / scaleFactor;
    this.inputState[7] = agent.state.bvy / scaleFactor;
    this.inputState[8] = 0 * opponent.state.x / scaleFactor;
    this.inputState[9] = 0 * opponent.state.y / scaleFactor;
    this.inputState[10] = 0 * opponent.state.vx / scaleFactor;
    this.inputState[11] = 0 * opponent.state.vy / scaleFactor;

    for (i = 0; i < this.nOutput; i++) { // feeds back output to input
      this.inputState[i + this.nGameInput] = this.outputState[i] * scaleFeedback * 1;
    }

    for (i = 0; i < this.nInput; i++) { // copies input state into convnet cube object format to be used later.
      this.convInputState.w[i] = this.inputState[i];
    }

  };

  forward() { // get output from neural network
    let a = this.net.forward(this.convInputState);
    for (let i = 0; i < this.nOutput; i++) {
      this.prevOutputState[i] = this.outputState[i]; // copy previous value
      this.outputState[i] = a.w[i];
    }
  };

};