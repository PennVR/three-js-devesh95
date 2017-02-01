/**
 * Procedurally generated ring of mountains around a scene
 *
 * @author: Devesh Dayal
 */

const SimplexNoise = require('./noise');

class Mountains {

  constructor(radius = 100, numPeaks = 50) {
    this.radius = radius;
    this.numPeaks = numPeaks;
    this.simplex = new SimplexNoise();
  }

  get mesh() {
    this._constructMesh();
    return this.mountain_mesh;
  }

  _constructMesh() {
    // create a thin ring (for the mountain horizon)
    this.mountain_geometry = new THREE.RingGeometry(this.radius, this.radius + 10, this.numPeaks);
    this._generateHorizon();
    // create a simple material
    const ring_material = new THREE.MeshLambertMaterial({color: 0x968D99});
    this.mountain_mesh = new THREE.Mesh(this.mountain_geometry, ring_material);
  }

  _generateHorizon() {
    this.mountain_geometry.dynamic = true;
    // distort vertices using noise
    for (let i = (this.mountain_geometry.vertices.length / 2) + 1; i < this.mountain_geometry.vertices.length; i++) {
      const vertex = this.mountain_geometry.vertices[i];
      const noise = Math.abs(this.simplex.noise(vertex.x, vertex.y) * 70);
      this.mountain_geometry.vertices[i].z += (80 * noise) + 60;
    }
    this.mountain_geometry.verticesNeedUpdate = true;
    this.mountain_geometry.colorsNeedUpdate = true;
  }

}

module.exports = Mountains;