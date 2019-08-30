export default class Particle {

  loc;
  prevLoc;
  v;
  r;
  c;

  constructor(loc, v, r, c) {
    this.loc = loc || p5.createVector(p5.random(-ref_w * 1 / 4, ref_w * 1 / 4), p5.random(ref_w / 4, ref_w * 3 / 4));
    this.prevLoc = this.loc.copy();
    this.v = v || p5.createVector(p5.random(-20, 20), p5.random(10, 25));
    this.r = r || p5.random(0.5, 1.5);
    this.c = c || getRandomColor(128);
  }

  move() {
    this.prevLoc = this.loc.copy();

    this.loc.add(p5Vector.mult(this.v, timeStep));
    this.v.mult(1 - (1 - windDrag) * timeStep);
  }
  applyAcceleration(acceleration) {
    this.v.add(p5Vector.mult(acceleration, timeStep));
  }
  checkEdges() {
    if (this.loc.x <= this.r - ref_w / 2) {
      this.v.x *= -friction;
      this.loc.x = this.r - ref_w / 2 + nudge * timeStep;
    }
    if (this.loc.x >= (ref_w / 2 - this.r)) {
      this.v.x *= -friction;
      this.loc.x = ref_w / 2 - this.r - nudge * timeStep;
    }
    if (this.loc.y <= this.r + ref_u) {
      this.v.y *= -friction;
      this.loc.y = this.r + ref_u + nudge * timeStep;
      if (this.loc.x <= 0) {
        return -1;
      } else {
        return 1;
      }
    }
    if (this.loc.y >= (ref_h - this.r)) {
      this.v.y *= -friction;
      this.loc.y = ref_h - this.r - nudge * timeStep;
    }
    // fence:
    if ((this.loc.x <= (ref_wallwidth / 2 + this.r)) && (this.prevLoc.x > (ref_wallwidth / 2 + this.r)) && (this.loc.y <= ref_wallheight)) {
      this.v.x *= -friction;
      this.loc.x = ref_wallwidth / 2 + this.r + nudge * timeStep;
    }
    if ((this.loc.x >= (-ref_wallwidth / 2 - this.r)) && (this.prevLoc.x < (-ref_wallwidth / 2 - this.r)) && (this.loc.y <= ref_wallheight)) {
      this.v.x *= -friction;
      this.loc.x = -ref_wallwidth / 2 - this.r - nudge * timeStep;
    }
    return 0;
  }

  getDist2(p) { // returns distance squared from p
    let
      dy = p.loc.y - this.loc.y,
      dx = p.loc.x - this.loc.x;

    return (dx * dx + dy * dy);
  }

  isColliding(p) { // returns true if it is colliding
    let r = this.r + p.r;
    return (r * r > this.getDist2(p)); // if distance is less than total radius, then colliding.
  }

  bounce(p) { // bounce two that have collided
    bounceSound.play();
    let ab = p5.createVector();
    ab.set(this.loc);
    ab.sub(p.loc);
    ab.normalize();
    ab.mult(nudge);

    while (this.isColliding(p)) {
      this.loc.add(ab);
    }

    let n = p5Vector.sub(this.loc, p.loc);
    n.normalize();

    let u =
      p5Vector.sub(this.v, p.v),
      un = p5Vector.mult(n, u.dot(n) * 2);

    u.sub(un);
    this.v = p5Vector.add(u, p.v);
  }

  limitSpeed(minSpeed, maxSpeed) {
    let mag2 = this.v.magSq();
    if (mag2 > (maxSpeed * maxSpeed)) {
      this.v.normalize();
      this.v.mult(maxSpeed);
    }
    if (mag2 < (minSpeed * minSpeed)) {
      this.v.normalize();
      this.v.mult(minSpeed);
    }
    return;
  }

  display() {
    p5.noStroke();
    p5.fill(this.c);
    p5.ellipse(toX(this.loc.x), toY(this.loc.y), toP(this.r) * 2, toP(this.r) * 2);
  };
};