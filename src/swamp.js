export default class Swamp {
  constructor(id) {
    this.id = id;
    // this.ui = new Ui(id, this);
    this.playing = false;
  }

  play() {
    console.log('start simulation');
  }
}