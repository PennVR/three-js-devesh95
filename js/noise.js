/**
 * Implementation of Perlin noise generator using the simplex generator
 *
 * Sources referenced: http://flafla2.github.io/2014/08/09/perlinnoise.html
 */

class SimplexNoise {

  constructor(r = Math) {
    // construct the cube vertex locations
    this.cube_grid = [];
    for (let i = 0; i < 3; i++) {
      let zero_idx = 2 - i;
      for (let j = 0; j < 4; j++) {
        let mat = [];
        switch (j) {
          case 0:
            mat = mat.concat([1, 1])
            break;
          case 1:
            mat = mat.concat([-1, 1])
            break;
          case 2:
            mat = mat.concat([1, -1])
            break;
          case 3:
            mat = mat.concat([-1, -1])
            break;
        }
        mat.splice(zero_idx, 0, 0);
        this.cube_grid.push(mat);
      }
    }

    // create the permutation table (256 random values)
    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(r.random() * 256);
    }
    // doubled, to prevent underflow
    this.permutation_table = [];
    for (let i = 0; i < 512; i++) {
      this.permutation_table[i] = this.p[i & 255];
    }
  }

  dot(g, x, y) {
    return g[0] * x + g[1] * y;
  }

  fade(grid_idx, x, y) {
    const intercept = 0.5;
    let fade = intercept - x * x - y * y;
    if (fade > 0) {
      return fade * fade * fade * this.dot(this.cube_grid[grid_idx], x, y);
    } else {
      return 0;
    }
  }

  noise(x, y) {
    // snap to the cubes used to smooth promixity vectors
    const s = (x + y) * (0.5 * (Math.sqrt(3.0) - 1.0));
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * ((3.0 - Math.sqrt(3.0)) / 6.0);
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    let i1 = 0;
    let j1 = 1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    }

    // get snapped coords based on the first snap
    const offset = (3.0 - Math.sqrt(3.0)) / 6.0;
    const x1 = x0 - i1 + offset;
    const y1 = y0 - j1 + offset;
    const x2 = x0 - 1.0 + 2.0 * offset;
    const y2 = y0 - 1.0 + 2.0 * offset;

    // choose a random permutation for each axis
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permutation_table[ii + this.permutation_table[jj]] % 12;
    const gi1 = this.permutation_table[ii + i1 + this.permutation_table[jj + j1]] % 12;
    const gi2 = this.permutation_table[ii + 1 + this.permutation_table[jj + 1]] % 12;

    // apply fades and return!
    return this.fade(gi0, x0, y0) + this.fade(gi1, x1, y1) + this.fade(gi2, x2, y2);
  }

};

module.exports = SimplexNoise;