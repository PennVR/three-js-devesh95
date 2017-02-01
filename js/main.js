const City = require('./city');
const FireworksManager = require('./fireworks');
const Mountains = require('./mountains');

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
    starsGeometry.vertices.push(star)
  }
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xeeeeee
  })
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
  city_mesh.position.set(0, 0- HMD_OFFSET, 0);
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
  anchor.position.set(0, 80 - HMD_OFFSET, 0);
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
  if (Math.random() < 0.10) {
    const x = Math.floor(Math.random() * 200 - 100) * 10;
    const z = (Math.floor(Math.random() * 200 - 100) * 10) + 60;
    const from = new THREE.Vector3(x, 10, z);
    const fireworks_height = 250 + (Math.random() * 150);
    const to = new THREE.Vector3(x, fireworks_height - HMD_OFFSET), z);
    fireworksManager.launch(from, to);
  }
  fireworksManager.update();


  effect.render(scene, camera);
}