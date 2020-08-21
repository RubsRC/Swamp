import Ui from './ui'
export default class Swamp {
  constructor (id) {
    this.id = id
    this.ui = new Ui(id, this)
    this.playing = false
  }

  play () {
    this.ui.stop = false
    if (!this.playing) {
      this.ui.play()
    }
    this.playing = true
    console.log('play!!')
  }

  stop () {
    this.ui.stop = true
    this.ui.playing = false
    console.log('stop!!')
  }

  reset () {
    this.stop()
    this.ui = new Ui(this.id, true)
    this.play()
  }
}
