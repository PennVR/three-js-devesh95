var City = require('./city');

var scene, camera, renderer, effect, controls;
var light;
var lastTime;
var artificial_vr;

const night_sky = 0x003366;

init();
animate();

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

  // Camera should be anchored on top of the central building
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
  // camera.position.y = 100;
  // scene.add(camera);

  // fog effect for distant buildings
  scene.fog = new THREE.FogExp2(night_sky, 0.0025);

  // add lighting to model the sun above the scene
  light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1);
  light.position.set(0.75, 1, 0.25);
  scene.add(light);

  // add the ground/base of the city
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial({
    color: 0x101018
  }));
  plane.rotation.x = -90 * Math.PI / 180;
  scene.add(plane);


  // add the procedurally generated city to the scene
  const city_mesh = new City(20000, renderer.getMaxAnisotropy()).mesh;
  scene.add(city_mesh);

  var info = document.createElement('div');
  info.style.position = 'absolute';
  info.style.left = '0';
  info.style.top = '15px';
  info.style.width = '100%';
  info.style.color = 'rgba(250,250,250,0.5)';
  info.style.textAlign = 'center';
  info.textContent = 'Look around to explore the city and enjoy the fireworks';
  document.body.appendChild(info);

  lastTime = performance.now();


  // allow for VR headset navigation and viewing
  controls = new THREE.VRControls(camera);
  effect = new THREE.VREffect(renderer);

  if (navigator.getVRDisplays) {
    artificial_vr = false;
    navigator.getVRDisplays()
      .then((displays) => {
        effect.setVRDisplay(displays[0]);
        controls.setVRDisplay(displays[0]);
      })
      .catch(() => {
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

  var time = performance.now() / 1000;
  
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