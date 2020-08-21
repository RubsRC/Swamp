import Frog from './frog'

export default class Ui {
  constructor (id, controller, dontload = false) {
    this.id = id
    this.controller = controller
    this.debug = true
    this.numFrogs = 4
    this.width = 0
    this.height = 0
    this.mouseDown = false
    this.stats = {}
    this.stats.deaths = 0
    this.stats.counter = 0
    this.stats.manualfed = 0
    this.stats.autofed = 0

    const ui = this

    this.container = document.getElementById(id)
    const html = `
    <div class="swamp-menu">
      <div class="swamp-menu-container">
        <div class="swamp-button swamp-pausegame">Pause Game</div>
        <div class="swamp-button swamp-playgame swamp-button-hidden">Play Game</div>
      </div>
      <div class="swamp-stats"></div>
    </div>
    <canvas>your browser does not support the canvas element</canvas>`
    this.container.innerHTML = html

    // const pauseButton = this.container.querySelector('.swamp-pausegame')
    // pauseButton.addEventListener('click', function (e) {
    //   ui.controller.stop()
    //   pauseButton.classList.add('swamp-button-hidden')
    //   const playButton = this.container.querySelector('swamp-playgame')
    //   playButton.classList.remove('swamp-button-hidden')
    // })

    // const playButton = this.container.querySelector('.swamp-playgame')
    // playButton.addEventListener('click', function (e) {
    //   ui.controller.play()
    //   playButton.classList.add('swamp-button-hidden')
    //   const pauseButton = this.container.querySelector('swamp-pausegame')
    //   pauseButton.classList.remove('swamp-button-hidden')
    // })

    let elements = this.container.querySelectorAll('.swamp-pausegame')
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      element.addEventListener('click', function (e) {
        ui.controller.stop()
        let buttons = ui.container.querySelectorAll('.swamp-pausegame')
        for (let l = 0; l < buttons.length; l++) {
          buttons[l].classList.add('swamp-button-hidden')
        }
        buttons = ui.container.querySelectorAll('.swamp-playgame')
        for (let l = 0; l < buttons.length; l++) {
          buttons[l].classList.remove('swamp-button-hidden')
        }
      })
    }
    elements = this.container.querySelectorAll('.swamp-playgame')
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      element.addEventListener('click', function (e) {
        ui.controller.play()
        let buttons = ui.container.querySelectorAll('.swamp-pausegame')
        for (let l = 0; l < buttons.length; l++) {
          buttons[l].classList.remove('swamp-button-hidden')
        }
        buttons = ui.container.querySelectorAll('.swamp-playgame')
        for (let l = 0; l < buttons.length; l++) {
          buttons[l].classList.add('swamp-button-hidden')
        }
      })
    }

    this.container.classList.add('swamp-container')
    this.canvas = this.container.querySelector('canvas')
    this.menustats = this.container.querySelector('.swamp-stats')
    this.ctx = this.canvas.getContext('2d')

    this.frogs = []
    this.stats.counter = 0

    this.updateCanvas()
    this.draw()
    if (!dontload) {
      this.load()
    } else {
      this.defaultSwamp()
      this.save(true)
    }
  }

  draw () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const e in this.frogs) {
      this.frogs[e].draw()
    }
  }

  updateCanvas () {
    const newWidth = this.container.offsetWidth
    const newHeight = this.container.offsetHeight
    if (this.width !== newWidth || this.height !== newHeight) {
      this.canvas.width = newWidth
      this.canvas.height = newHeight
      this.width = newWidth
      this.height = newHeight
    }
  }

  load () {
    // buscar partidas guardadas en localStorage
    if (typeof (Storage) !== 'undefined') {
      const obj = JSON.parse(localStorage.getItem(`swampSave_${this.id}`))
      if (!obj) {
        this.defaultSwamp()
        return
      }
      // pendiente: cargar el estado de juego guardado
      console.log('aquí debió de cargar la partida guardada')
    } else {
      console.log('Ypur browser does not support save/load')
    }
  }

  save () {
    // guardar la partida actual en localStorage
    console.log('pendiente: guardar la partida actual en localStorage')
  }

  defaultSwamp () {
    // crear los seres vivos del pantano
    for (let i = 0; i < this.numFrogs; i++) {
      const frog = new Frog(this)
      if (frog.defaultColors[i]) {
        frog.color = frog.defaultColors[i]
        frog.health = 9999
        frog.setRandomPos(this.width / 2, this.height / 2, 50)
      }
      this.frogs.push(frog)
    }
  }

  drawstats (fps, ticks) {
    let html = ''
    html += this.statline('Alive', this.frogs.length)
    html += this.statlineMinMax(this.frogs, 'generation', 'Generations')
    html += this.statline('Fps', fps)
    html += this.statline('Ticks', this.stats.counter)
    html += this.statline('Ticks/second', ticks)
    if (this.debug) {
      if (this.debugvar !== null) {
        html += this.statline('debugvar', this.debugvar)
      }
      // html += this.statline('Food Chance', this.foodchance())
      html += this.statlineMinMax(this.frogs, 'traveledlast')
    }
    this.menustats.innerHTML = html
  }

  statline (key, val) {
    return `${key}: ${val}<br>`
  }

  statlineMinMax (obj, key, title = null) {
    let min = 0
    let max = 0
    const sorted = obj.sort(function (a, b) {
      const av = a[key]
      const bv = b[key]
      if (av < bv) return -1
      if (av > bv) return 1
      return 0
    })
    if (sorted[0]) {
      min = sorted[0][key]
      max = sorted[sorted.length - 1][key]
    }
    if (!title) {
      title = key
    }
    min = Math.floor(min)
    max = Math.floor(max)
    let text = `${title}: ${min} - ${max}<br>`
    if (min === max) {
      text = `${title}: ${min}<br>`
    }
    return text
  }

  tick () {
    for (const e in this.frogs) {
      if (!this.frogs[e].tick()) {
        this.stats.deaths += 1
        this.frogs.splice(e, 1)
      }
    }
  }

  play () {
    let fps = 0
    const start = new Date().getTime()
    let od = start
    let osec = start
    let atps = this.tps // actual tps
    let ticks = 0
    let savetimer = start
    let work = 0
    const ui = this
    loop()
    graphicsloop()
    function loop () {
      const d = new Date().getTime()
      let target = (d - od) * (atps / 1000)
      work += target % 1

      target = Math.floor(target)
      if (target > atps) {
        target = atps
      }
      if (work >= 1) {
        target = target + work
        target = Math.floor(target)
        work -= 1
      }
      for (let i = 0; i < target; i++) {
        ui.stats.counter++
        ticks++
        ui.tick(ui.stats.counter)
        if (i > atps) {
          work += target - i
          console.log('target overflow')
          break
        }
      }
      od = d

      if (savetimer + 10000 <= d) {
        savetimer = d
        ui.save()
      }
      if (osec + 1000 <= d) {
        atps = ui.tps
        osec = d
        ui.drawstats(fps, ticks)
        fps = 0
        ticks = 0
        // ui.displayAchievements()
        ui.updateCanvas()
        // ui.hidewelcometext()
        // ui.showDeathMenu()
      }
      if (!ui.stop) {
        setTimeout(loop, 10)
      }
    }
    function graphicsloop () {
      ui.draw()
      fps += 1
      if (!ui.stop) {
        requestAnimationFrame(graphicsloop)
      }
    }
  }
}
