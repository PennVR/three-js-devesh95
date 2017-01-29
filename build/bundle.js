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

	var scene, camera, renderer, effect, controls;
	var light;
	var lastTime;
	var artificial_vr;

	const night_sky = 0x003366;

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
	  scene.fog = new THREE.FogExp2(night_sky, 0.0025);

	  // add lighting to model the sun above the scene
	  light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1);
	  light.position.set(0.75, 1, 0.25);
	  scene.add(light);

	  // add the ground/base of the city
	  let plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial({
	    color: 0x101018
	  }));
	  plane.position.set(0, -100, 0);
	  plane.rotation.x = -90 * Math.PI / 180;
	  scene.add(plane);

	  // add the procedurally generated city to the scene
	  const city_mesh = new City(15000, renderer.getMaxAnisotropy()).mesh;
	  city_mesh.position.set(0, -90, 0);
	  scene.add(city_mesh);

	  // add centered building below viewer
	  let anchor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({
	    color: 0xcccccc
	  }));
	  anchor.position.set(0, -10, 0);
	  anchor.rotation.x = -90 * Math.PI / 180;
	  scene.add(anchor);

	  lastTime = performance.now();

	  // Camera should be anchored on top of the central building
	  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);

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
	      const noise = this.simplex.noise(i, i + 2); // simplex noise
	      building.position.x = Math.floor(Math.random() * 200 - 100) * 10;
	      building.position.z = Math.floor(Math.random() * 200 - 100) * 10;
	      building.rotation.y = Math.random();
	      building.scale.x = building.scale.z = Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
	      building.scale.y = noise * 100 + 10; // building height noise map

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

	    return canvas2;
	  }
	}

	module.exports = City;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Implementation of Perlin noise generator using the simplex generator
	 */

	class SimplexNoise {

	  constructor(r = Math) {
	    this.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
	    this.p = [];
	    for (var i = 0; i < 256; i++) {
	      this.p[i] = Math.floor(r.random() * 256);
	    }
	    this.perm = [];
	    for (var i = 0; i < 512; i++) {
	      this.perm[i] = this.p[i & 255];
	    }
	  }

	  dot(g, x, y) {
	    return g[0] * x + g[1] * y;
	  }

	  noise(xin, yin) {
	    let n0 = 0.0;
	    let n1 = 0.0;
	    let n2 = 0.0;
	    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
	    const s = (xin + yin) * F2;
	    const i = Math.floor(xin + s);
	    const j = Math.floor(yin + s);
	    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
	    const t = (i + j) * G2;
	    const x0 = xin - (i - t);
	    const y0 = yin - (j - t);

	    let i1 = 0;
	    let j1 = 1;
	    if (x0 > y0) {
	      i1 = 1;
	      j1 = 0;
	    }

	    const x1 = x0 - i1 + G2;
	    const y1 = y0 - j1 + G2;
	    const x2 = x0 - 1.0 + 2.0 * G2;
	    const y2 = y0 - 1.0 + 2.0 * G2;

	    const ii = i & 255;
	    const jj = j & 255;
	    const gi0 = this.perm[ii + this.perm[jj]] % 12;
	    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
	    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

	    let t0 = 0.5 - x0 * x0 - y0 * y0;
	    if (t0 > 0) {
	      t0 *= t0;
	      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
	    }
	    let t1 = 0.5 - x1 * x1 - y1 * y1;
	    if (t1 > 0) {
	      t1 *= t1;
	      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
	    }
	    let t2 = 0.5 - x2 * x2 - y2 * y2;
	    if (t2 > 0) {
	      t2 *= t2;
	      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
	    }

	    return 70.0 * (n0 + n1 + n2);
	  }

	};

	module.exports = SimplexNoise;

/***/ }
/******/ ]);