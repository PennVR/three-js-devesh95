/**
 * Procedurally generated city of buildings exported as a single mesh for a 
 * ThreeJS scene.
 *
 * @author: Devesh Dayal
 */

const SimplexNoise = require('./noise');

class City {

  constructor(numBuildings = 20000, anisotropy) {
    this.numBuildings = numBuildings;
    this.anisotropy = anisotropy;
    this.simplex = new SimplexNoise();
  }

  get mesh() {
    this._constructGeometry();
    this._buildCity();
    return this._cityMesh();
  }

  _constructGeometry() {
    // create a box geometry to represent each building
    this.cube_geometry = new THREE.BoxGeometry(1, 1, 1);
    // center the pivot point to the middle of the base
    this.cube_geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
    // the top face, represented as two triangles, should be the same color as
    // the floor face (black)
    this.cube_geometry.uvsNeedUpdate = true;
    this.cube_geometry.faceVertexUvs[0][4][0].set(0, 0);
    this.cube_geometry.faceVertexUvs[0][4][1].set(0, 0);
    this.cube_geometry.faceVertexUvs[0][4][2].set(0, 0);
    this.cube_geometry.faceVertexUvs[0][5][0].set(0, 0);
    this.cube_geometry.faceVertexUvs[0][5][1].set(0, 0);
    this.cube_geometry.faceVertexUvs[0][5][2].set(0, 0);
  }

  _buildCity() {
    // create building and city meshes
    let building = new THREE.Mesh(this.cube_geometry);
    this.city = new THREE.Geometry();

    // generate randomized buildings within the city
    for (let i = 0; i < this.numBuildings; i++) {
      const scaleFactor = 40;
      building.position.x = Math.floor(Math.random() * 200 - 100) * 10;
      building.position.z = Math.floor(Math.random() * 200 - 100) * 10;
      const noise = scaleFactor * this.simplex.noise(building.position.x, building.position.z); // simplex noise
      building.rotation.y = Math.random();
      building.scale.x = building.scale.z = Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
      building.scale.y = (noise * 80) + 10; // building height noise map

      // merge each building to the city mesh
      building.updateMatrix();
      this.city.merge(building.geometry, building.matrix);
    }
  }

  _cityMesh() {
    // create a shared texture for each building
    let texture = new THREE.CanvasTexture(this._generateTexture());
    // for smooth scaling
    texture.anisotropy = this.anisotropy;
    // apply the texture to every building
    return new THREE.Mesh(this.city, new THREE.MeshLambertMaterial({
      map: texture,
      vertexColors: THREE.VertexColors
    }));
  }

  /**
   * Generates a canvas texture to model a building with multiple floors, 
   * each with multiple rooms that may have lights on. This is a canvas element 
   * that is drawn and then scaled up (removing smoothing effects to create a )
   * sharper resolution in the larger upscaled canvas.
   * 
   * @return {canvas} Texture to applied on every building as a canvas element
   */
  _generateTexture() {
    let canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 64;

    let context = canvas.getContext('2d');
    let gr = context.createLinearGradient(0, 0, 0, 100);

    // Add the color stops
    gr.addColorStop(1, 'rgb(20,20,20)');
    gr.addColorStop(0, 'rgb(118,118,118)');

    context.fillStyle = gr;
    context.fillRect(0, 0, 32, 64);

    for (let y = 2; y < 64; y += 2) {
      for (let x = 0; x < 32; x += 2) {
        const isOn = Math.random();
        if (isOn < 0.15) {
          const isYellow = Math.random();
          let colors = [251, 238, 20];
          if (isYellow < 0.5) {
            colors = Array(3).fill(250);
          }
          context.fillStyle = 'rgb(' + colors.join(',') + ')';
          context.fillRect(x, y, 2, 1);
        }
      }
    }

    let canvas2 = document.createElement('canvas');
    canvas2.width = 512;
    canvas2.height = 1024;

    let context2 = canvas2.getContext('2d');
    context2.imageSmoothingEnabled = false;
    context2.webkitImageSmoothingEnabled = false;
    context2.mozImageSmoothingEnabled = false;
    context2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);

    return canvas2; // needed to ensure that there is no blurry light effect
  }
}

module.exports = City;