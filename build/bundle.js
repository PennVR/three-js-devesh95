/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const City = __webpack_require__(1);
	const FireworksManager = __webpack_require__(3);
	const Mountains = __webpack_require__(4);

	var scene, camera, renderer, effect, controls;
	var fireworksManager;
	var light;
	var lastTime;
	var artificial_vr;

	const night_sky = 0x003366;
	const HMD_OFFSET = 100;

	init(); // procedurally generate the scene
	animate(); // begin animations / vr feedback loop

	function init() {
	  // create the WebGL renderer
	  renderer = new THREE.WebGLRenderer({
	    antialias: false,
	    alpha: false
	  });
	  renderer.setPixelRatio(window.devicePixelRatio);
	  renderer.setClearColor(night_sky);
	  renderer.setSize(window.innerWidth, window.innerHeight);
	  document.body.appendChild(renderer.domElement);

	  // create a new scene
	  scene = new THREE.Scene();

	  // fog effect for distant buildings
	  scene.fog = new THREE.FogExp2(night_sky, 0.0010);

	  // add lighting to model the sun above the scene
	  light = new THREE.HemisphereLight(0xffffff, 0x101018, 1);
	  light.position.set(0.75, 1, 0.25);
	  scene.add(light);

	  // add stars to the sky
	  const starsGeometry = new THREE.Geometry();

	  for (let i = 0; i < 10000; i++) {
	    const star = new THREE.Vector3();
	    star.x = THREE.Math.randFloatSpread(2000);
	    star.y = THREE.Math.randFloat(150 - HMD_OFFSET, 2000 - HMD_OFFSET);
	    star.z = THREE.Math.randFloatSpread(2000);
	    starsGeometry.vertices.push(star);
	  }
	  const starsMaterial = new THREE.PointsMaterial({
	    color: 0xeeeeee
	  });
	  const starField = new THREE.Points(starsGeometry, starsMaterial);
	  scene.add(starField);

	  // add the ground/base of the city
	  let plane = new THREE.Mesh(new THREE.PlaneGeometry(2500, 2500), new THREE.MeshBasicMaterial({
	    color: 0x101018
	  }));
	  plane.position.set(0, 0 - HMD_OFFSET, 0);
	  plane.rotation.x = -90 * Math.PI / 180;
	  scene.add(plane);

	  // add the procedurally generated city to the scene (made with perlin noise!)
	  const city_mesh = new City(5000, renderer.getMaxAnisotropy()).mesh;
	  city_mesh.position.set(0, 0 - HMD_OFFSET, 0);
	  scene.add(city_mesh);

	  // add background mountain ring (made with perlin noise!)
	  const mountain_mesh = new Mountains(1400, 100).mesh;
	  mountain_mesh.position.set(0, -10 - HMD_OFFSET, 0);
	  mountain_mesh.rotation.x = -90 * Math.PI / 180;
	  scene.add(mountain_mesh);

	  // add centered building below viewer
	  let anchor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({
	    color: 0xcccccc
	  }));
	  anchor.position.set(0, 100 - HMD_OFFSET, 0);
	  anchor.rotation.x = -90 * Math.PI / 180;
	  scene.add(anchor);

	  // init fireworks manager!
	  fireworksManager = new FireworksManager(scene);

	  lastTime = performance.now();

	  // Camera should be anchored on top of the central building
	  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
	  camera.position.y = 120 - HMD_OFFSET;

	  // allow for VR headset navigation and viewing
	  controls = new THREE.VRControls(camera);
	  effect = new THREE.VREffect(renderer);

	  if (navigator.getVRDisplays) {
	    artificial_vr = false;
	    navigator.getVRDisplays().then(displays => {
	      effect.setVRDisplay(displays[0]);
	      controls.setVRDisplay(displays[0]);
	    }).catch(() => {
	      // no displays
	      artificial_vr = true;
	    });

	    document.body.appendChild(WEBVR.getButton(effect));
	  } else {
	    artificial_vr = true;
	  }

	  window.addEventListener('resize', () => {
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();

	    effect.setSize(window.innerWidth, window.innerHeight);
	  });
	}

	function animate() {
	  effect.requestAnimationFrame(animate);
	  const time = performance.now() / 1000;
	  render();
	  lastTime = time;
	}

	function render() {
	  if (artificial_vr) {
	    camera.rotation.y += 0.001; // slow pan around the scene
	  }
	  controls.update();

	  // fireworks!
	  if (Math.random() < 0.05) {
	    const x = Math.floor(Math.random() * 200 - 100) * 10;
	    const z = Math.floor(Math.random() * 200 - 100) * 10 + 60;
	    const from = new THREE.Vector3(x, 10, z);
	    const to = new THREE.Vector3(x, 250 + Math.random() * 100 - HMD_OFFSET, z);
	    fireworksManager.launch(from, to);
	  }
	  fireworksManager.update();

	  effect.render(scene, camera);
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Procedurally generated city of buildings exported as a single mesh for a 
	 * ThreeJS scene.
	 *
	 * @author: Devesh Dayal
	 */

	const SimplexNoise = __webpack_require__(2);

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
	      building.scale.y = noise * 80 + 10; // building height noise map

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

/***/ },
/* 2 */
/***/ function(module, exports) {

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
	            mat = mat.concat([1, 1]);
	            break;
	          case 1:
	            mat = mat.concat([-1, 1]);
	            break;
	          case 2:
	            mat = mat.concat([1, -1]);
	            break;
	          case 3:
	            mat = mat.concat([-1, -1]);
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

/***/ },
/* 3 */
/***/ function(module, exports) {

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
	      depthTest: false
	    });
	  }

	  launch(from, to) {
	    const fid = this._getFireworkID();
	    const color = this._getRandomColor();

	    const material = this._getMaterial();

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
	      particle
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
	    const explosionSize = Math.random() * (this.explosionMaxSize - 50) + 50;
	    for (let i = 0; i < explosionSize; i++) {
	      const color = this._getRandomColor();
	      colors.push(color);

	      // add starting (from) vector
	      geometry.vertices.push(new THREE.Vector3(THREE.Math.randInt(in_vector.x - 10, in_vector.x + 10), THREE.Math.randInt(in_vector.y - 10, in_vector.y + 10), THREE.Math.randInt(in_vector.z - 10, in_vector.z + 10)));

	      // add random destination vector
	      destinations.push(new THREE.Vector3(THREE.Math.randInt(in_vector.x - this.explosionScatter, in_vector.x + this.explosionScatter), THREE.Math.randInt(in_vector.y - this.explosionScatter, in_vector.y + this.explosionScatter), THREE.Math.randInt(in_vector.z - this.explosionScatter, in_vector.z + this.explosionScatter)));
	    }
	    geometry.colors = colors;

	    // keep track of particles that have exploded
	    this.hasExploded[fid] = {
	      colors,
	      destinations,
	      fid,
	      geometry,
	      material,
	      particles
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
	        if (Math.ceil(particle.geometry.vertices[0].y) > particle.destination.y - 20) {
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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Procedurally generated ring of mountains around a scene
	 *
	 * @author: Devesh Dayal
	 */

	const SimplexNoise = __webpack_require__(2);

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
	    const ring_material = new THREE.MeshLambertMaterial({ color: 0x968D99 });
	    this.mountain_mesh = new THREE.Mesh(this.mountain_geometry, ring_material);
	  }

	  _generateHorizon() {
	    this.mountain_geometry.dynamic = true;
	    // distort vertices using noise
	    for (let i = this.mountain_geometry.vertices.length / 2 + 1; i < this.mountain_geometry.vertices.length; i++) {
	      const vertex = this.mountain_geometry.vertices[i];
	      const noise = Math.abs(this.simplex.noise(vertex.x, vertex.y) * 70);
	      this.mountain_geometry.vertices[i].z += 80 * noise + 60;
	    }
	    this.mountain_geometry.verticesNeedUpdate = true;
	    this.mountain_geometry.colorsNeedUpdate = true;
	  }

	}

	module.exports = Mountains;

/***/ }
/******/ ]);