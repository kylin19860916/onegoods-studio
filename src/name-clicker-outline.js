import { Shape } from 'three';

export function nameClickerOutline(lettering) {
  // Keep enough room for the switch even when the name contains one narrow letter.
  const unique = new Map();
  const points = lettering?.getAttribute('position');
  for (let i = 0; i < (points?.count ?? 0); i++) {
    const x = points.getX(i);
    const y = points.getY(i);
    unique.set(`${x},${y}`, [x, y]);
  }
  const sorted = [...unique.values(), [-8.2, -8.2], [8.2, -8.2], [8.2, 8.2], [-8.2, 8.2]];
  sorted.sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
  const turn = ([ax, ay], [bx, by], [cx, cy]) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  function half(points) {
    const hull = [];
    for (const point of points) {
      while (hull.length > 1 && turn(hull.at(-2), hull.at(-1), point) <= 0) hull.pop();
      hull.push(point);
    }
    return hull.slice(0, -1);
  }
  const hull = [...half(sorted), ...half(sorted.reverse())];
  function profile(margin) {
    const shape = new Shape();
    for (const [i, [x, y]] of hull.entries()) {
      const previous = hull[(i + hull.length - 1) % hull.length];
      const next = hull[(i + 1) % hull.length];
      const from = Math.atan2(previous[0] - x, y - previous[1]);
      let to = Math.atan2(x - next[0], next[1] - y);
      if (to < from) to += 2 * Math.PI;
      shape.absarc(x, y, margin, from, to, false);
    }
    shape.closePath();
    return shape;
  }
  const left = hull.reduce((a, b) => b[0] < a[0] ? b : a);
  return { profile, left };
}
