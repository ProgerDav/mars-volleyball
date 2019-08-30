export default class Trainer {

  net; //network
  trainer;

  constructor(brain, initGene) {
    this.net = new convnetjs.Net();
    this.net.makeLayers(brain.layer_defs); // set the depth layers of the network

    this.trainer = new convnetjs.GATrainer(this.net, {
      population_size: 100,
      mutation_size: .3,
      mutation_rate: .05,
      num_match: 8,
      elite_percentage: .2
    }, initGene);
  }

  train() {
    this.trainer.matchTrain(matchFunction);
  }

  getChromosome(n = 0) {
    // returns a copy of the n-th best chromosome (if not provided, returns first one, which is the best one)
    return this.trainer.chromosomes[n].clone();
  };
}
