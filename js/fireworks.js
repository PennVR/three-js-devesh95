/**
 * Generate fireworks!
 *
 * @author: Devesh Dayal
 */

class FireworksManager {

  constructor(scene, explosionMaxSize = 60, explosionScatter = 200) {
    this.scene = scene;
    this.toExplode = {};
    this.hasExploded = {};
    this.nextID = 0;
    this.explosionMaxSize = explosionMaxSize;
    this.explosionScatter = explosionScatter;
  }

  _getFireworkID() {
    this.nextID++;
    return this.nextID;
  }

  _getRandomColor() {
    const color = new THREE.Color();
    color.setHSL(THREE.Math.randFloat(0.1, 0.9), 1, 0.6);
    return color;
  }

  _getMaterial() {
    return new THREE.PointsMaterial({
      size: 5,
      color: 0xffffff,
      opacity: 1,
      vertexColors: true,
      transparent: true,
      depthTest: false,
    });
  }

  launch(from, to) {
    const fid = this._getFireworkID();
    const color = this._getRandomColor();

    const material = this._getMaterial()

    // firework geometry currently only consists of a single point
    const geometry = new THREE.Geometry();
    geometry.colors = [color];
    geometry.vertices.push(from); // from vector
    const destination = to; // to vector

    // only one particle so far (the ignition)
    const particle = new THREE.Points(geometry, material);

    // keep track of firework to explode
    this.toExplode[fid] = {
      color,
      destination,
      fid,
      geometry,
      particle,
    };

    // actually add to scene
    this.scene.add(particle);
    // return firework ID
    return fid;
  }

  ignite(fid) {
    const exploded = this.toExplode[fid];
    // remove from the scene
    this.scene.remove(exploded.particle);

    // create a new points geometry for the explosion effect
    const material = this._getMaterial();
    const geometry = new THREE.Geometry();
    const particles = new THREE.Points(geometry, material);

    const in_vector = exploded.particle.geometry.vertices[0];

    // create explosion particles
    const colors = [];
    const destinations = [];
    const explosionSize = (Math.random() * (this.explosionMaxSize - 50)) + 50;
    for (let i = 0; i < explosionSize; i++) {
      const color = this._getRandomColor();
      colors.push(color);

      // add starting (from) vector
      geometry.vertices.push(new THREE.Vector3(
        THREE.Math.randInt(in_vector.x - 10, in_vector.x + 10),
        THREE.Math.randInt(in_vector.y - 10, in_vector.y + 10),
        THREE.Math.randInt(in_vector.z - 10, in_vector.z + 10),
      ));

      // add random destination vector
      destinations.push(new THREE.Vector3(
        THREE.Math.randInt(in_vector.x - this.explosionScatter, in_vector.x + this.explosionScatter),
        THREE.Math.randInt(in_vector.y - this.explosionScatter, in_vector.y + this.explosionScatter),
        THREE.Math.randInt(in_vector.z - this.explosionScatter, in_vector.z + this.explosionScatter)
      ));
    }
    geometry.colors = colors;

    // keep track of particles that have exploded
    this.hasExploded[fid] = {
      colors,
      destinations,
      fid,
      geometry,
      material,
      particles,
    };
    delete this.toExplode[fid];

    // add particles to the scene
    this.scene.add(particles);
  }

  update() {
    const toExplodeIDs = Object.keys(this.toExplode);
    const hasExplodedIDs = Object.keys(this.hasExploded);

    // single particles
    if (toExplodeIDs.length) {
      for (let fid of toExplodeIDs) {
        const particle = this.toExplode[fid];
        // update position (only y changes)
        particle.geometry.vertices[0].y += (particle.destination.y - particle.geometry.vertices[0].y) / 20;
        particle.geometry.verticesNeedUpdate = true;

        // check if particle should explode
        if (Math.ceil(particle.geometry.vertices[0].y) > (particle.destination.y - 20)) {
          // ignite!
          this.ignite(fid);
        }
      }
    }

    // exploded particles
    if (hasExplodedIDs.length) {
      for (let fid of hasExplodedIDs) {
        const firework = this.hasExploded[fid];
        // check if needs removing
        if (firework.material.opacity <= 0) {
          this.scene.remove(firework.particles);
          delete this.hasExploded[fid];
          continue;
        } else {
          // linearly interpolate for each of exploding particles
          for (let i = 0; i < firework.geometry.vertices.length; i++) {
            // update position
            firework.geometry.vertices[i].x += (firework.destinations[i].x - firework.geometry.vertices[i].x) / 15;
            firework.geometry.vertices[i].y += (firework.destinations[i].y - firework.geometry.vertices[i].y) / 15;
            firework.geometry.vertices[i].z += (firework.destinations[i].z - firework.geometry.vertices[i].z) / 15;
            firework.geometry.verticesNeedUpdate = true;
          }
          // lower opacity
          firework.material.opacity -= 0.015;
          firework.material.colorsNeedUpdate = true;
        }
      }
    }
  }

}

module.exports = FireworksManager;