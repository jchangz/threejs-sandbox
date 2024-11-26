import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import "./style.css"

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

let cube: THREE.Mesh

init()

function init() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  document.querySelector<HTMLDivElement>("#app")!.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)

  const params = {
    color: "#000000",
    showFillLight: true,
    showDirLight: true,
    showLightHelpers: false,
  }

  const geometry = new THREE.SphereGeometry(1, 32, 16)
  const material = new THREE.MeshStandardMaterial({
    color: params.color,
    roughness: 0.6,
    metalness: 0.1,
  })
  cube = new THREE.Mesh(geometry, material)

  scene = new THREE.Scene()
  scene.add(cube)

  const dirLight = new THREE.DirectionalLight(0xffffff, 3)
  dirLight.position.set(2, -5, 0)
  const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1)
  dirLightHelper.visible = false
  scene.add(dirLight)
  scene.add(dirLightHelper)

  const fillLight = new THREE.DirectionalLight(0xffffff, 1)
  fillLight.position.set(-5, 4, 2)
  const fillLightHelper = new THREE.DirectionalLightHelper(fillLight, 1)
  fillLightHelper.visible = false
  scene.add(fillLight)
  scene.add(fillLightHelper)

  const gui = new GUI()
  gui.addColor(params, "color").onChange((value) => material.color.set(value))
  gui.add(material, "roughness", 0, 1)
  gui.add(material, "metalness", 0, 1)
  gui
    .add(params, "showFillLight")
    .name("Fill Light")
    .onChange((value) => (fillLight.visible = value))
  gui
    .add(params, "showDirLight")
    .name("Directional Light")
    .onChange((value) => (dirLight.visible = value))
  gui
    .add(params, "showLightHelpers")
    .name("Light Helper")
    .onChange((value) => {
      dirLightHelper.visible = value
      fillLightHelper.visible = value
    })
  gui.open()

  window.addEventListener("resize", onWindowResize)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  renderer.render(scene, camera)
}
