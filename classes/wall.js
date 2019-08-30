export default class Wall {

  x;
  y;
  w;
  h;
  c = p5.color(0, 230, 50, 128);

  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  display() {
    p5.noStroke();
    p5.fill(255);
    p5.rect(toX(this.x - this.w / 2), toY(this.y + this.h / 2), toP(this.w), toP(this.h));
    p5.fill(this.c);
    p5.rect(toX(this.x - this.w / 2), toY(this.y + this.h / 2), toP(this.w), toP(this.h));
  }
};