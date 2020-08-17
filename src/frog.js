import LivingBeing from './livingBeing'

export default class Frog extends LivingBeing {
  constructor (ui) {
    super(ui)
    this.target = null
    this.targetangle = 300
    this.path = []
    this.minSize = 2
    this.size = 4
    this.maxSize = 5
    this.speed = 10
    this.fullHealth = 1500
    this.health = this.fullHealth

    this.defaultColors = [
      [0, 100, 50],
      [120, 100, 50],
      [240, 100, 50],
      [60, 100, 50]
    ]
  }

  save () {
    const obj = super.save()
    delete obj.target
    delete obj.path
    return obj
  }

  draw () {
    if (this.ui.debug) {
      // for(var pi in this.path){
      // var p=this.path[pi];
      // this.ui.ctx.fillStyle = "lime";
      // this.ui.ctx.fillRect(p[0],p[1],1,1);
      // }
      if (this.target && this.path.length > 2) {
        this.ui.ctx.strokeStyle = 'lime' // set color
        this.ui.ctx.lineWidth = 1
        this.ui.ctx.beginPath()
        this.ui.ctx.moveTo(this.path[0][0], this.path[0][1])
        this.ui.ctx.lineTo(this.path[this.path.length - 1][0], this.path[this.path.length - 1][1])
        this.ui.ctx.stroke()
      }
    }
    this.ui.ctx.setLineDash([]) // disable dashing
    this.ui.ctx.beginPath() // start new path
    this.ui.ctx.lineWidth = 1
    this.ui.ctx.strokeStyle = this.convertColor(this.color) // set color
    this.ui.ctx.ellipse(
      this.x, // x
      this.y, // y
      this.size, // radiusX
      this.size * 1.6, // radiusY
      this.angle * Math.PI / 180, // rotation
      0, // startAngle
      2 * Math.PI // endAngle
    )
    this.ui.ctx.stroke() // actually draw
    this.ui.ctx.lineWidth = 3
    this.ui.ctx.strokeStyle = this.convertColor(this.color, 0.5) // set color
    this.ui.ctx.ellipse(
      this.x, // x
      this.y, // y
      this.size + 1, // radiusX
      this.size * 1.6 + 1, // radiusY
      this.angle * Math.PI / 180, // rotation
      0, // startAngle
      2 * Math.PI // endAngle
    )
    this.ui.ctx.stroke() // actually draw
    this.ui.ctx.strokeStyle = this.convertColor(this.color, 0.2) // set color
    this.ui.ctx.ellipse(
      this.x, // x
      this.y, // y
      this.size + 2, // radiusX
      this.size * 1.6 + 2, // radiusY
      this.angle * Math.PI / 180, // rotation
      0, // startAngle
      2 * Math.PI // endAngle
    )
    this.ui.ctx.stroke() // actually draw
    this.ui.ctx.fillStyle = 'yellow'
    const p = this.rotatepoint(this.x, this.y - this.size, this.angle, this.x, this.y)
    this.ui.ctx.fillRect(p[0], p[1], 1, 1)
    super.draw()
  }

  rotatepoint (x, y, angle, cx, cy) {
    const radians = (Math.PI / 180) * angle
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    const nx = (cos * (x - cx)) - (sin * (y - cy)) + cx
    const ny = (cos * (y - cy)) + (sin * (x - cx)) + cy
    return [nx, ny]
  }

  searchpath () {
    this.path = this.line(this.x, this.y, this.target.x, this.target.y)

    this.targetangle = Math.atan2(this.y - this.target.y, this.x - this.target.x) * 180 / Math.PI
    this.targetangle = Math.round(this.positiveAngle(this.targetangle - 90))
  }

  travel () {
    if (!this.path.length) {
      this.searchpath()
    }
    if (this.targetangle !== this.angle) {
      if ((this.targetangle - this.angle + 360) % 360 < 180) {
        this.ui.debugvar = 81
        this.rotate(this.speed / (this.rotatebreak / 100))
        if ((this.targetangle - this.angle + 360) % 360 > 180) {
          this.angle = this.targetangle
        }
      } else {
        this.rotate(-this.speed / (this.rotatebreak / 100))
        if ((this.targetangle - this.angle + 360) % 360 < 180) {
          this.angle = this.targetangle
        }
      }
    } else {
      let distance = this.speed / this.ui.speedmod
      distance = distance * Math.pow(this.size, -0.1)
      this.traveledlast = distance
      this.traveled += distance
      this.health -= distance
      let step = Math.floor(this.traveled)
      if (step >= this.path.length - 1) {
        step = this.path.length - 1
        this.x = this.path[step][0]
        this.y = this.path[step][1]
        this.eat(this.target)
      } else {
        if (this.path[step]) {
          this.x = this.path[step][0]
          this.y = this.path[step][1]
        } else {
          console.log('Target has disappeared')
          this.looseTarget()
        }
      }
    }
  }

  tick () {
    if (this.dying) {
      this.dying--
      this.color = [0, 0, 33]
      if (this.dying % 5 === 0) {
        this.y++
      }
      if (this.dying <= 0) {
        return false
      }
      return true
    }
    this.health--
    if (this.health <= 0) {
      // if(random(1,0,this.badluck)==0&&this.size>this.minsize){
      if (this.size > this.minsize) {
        this.size--
        this.health = Math.floor(this.fullhealth / 2)
      } else {
        this.die()
      }
    }
    if (this.wait > 0) {
      this.wait--
      return true
    }
    if (this.target) {
      if (this.target.health > 0) {
        this.travel()
      } else {
        this.looseTarget()
      }
    } else {
      this.searchfood()
    }
    return true
  }
}
