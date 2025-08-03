import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import "./style.css"

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

const group = new THREE.Group()
const centerVector = new THREE.Vector3()
const centerBox = new THREE.Box3()

let roomEnv: THREE.Texture

const images = import.meta.glob("./assets/*")
const imagesMap: string[] = []
for (const path in images) {
  imagesMap.push(path)
}

const params = {
  file: "",
  environment: "Room",
  color: "#000000",
  showBoxHelper: false,
  showFillLight: true,
  showDirLight: true,
  showLightHelpers: false,
}

init()

function init() {
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  document.querySelector<HTMLDivElement>("#app")!.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)

  const manager = new THREE.LoadingManager()
  const dracoLoader = new DRACOLoader(manager)
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")
  const loader = new GLTFLoader(manager).setDRACOLoader(dracoLoader).setMeshoptDecoder(MeshoptDecoder)

  const material = new THREE.MeshStandardMaterial({
    color: params.color,
    roughness: 0.6,
    metalness: 0.1,
  })

  setGroupToCenter()

  // Room Environment
  const environment = new RoomEnvironment()
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  roomEnv = pmremGenerator.fromScene(environment).texture

  scene = new THREE.Scene()
  scene.add(group)

  const box = new THREE.BoxHelper(group, 0xffff00)
  box.visible = params.showBoxHelper
  scene.add(box)

  const dirLight = new THREE.DirectionalLight(0xffffff, 3)
  dirLight.position.set(2, -5, 0)
  const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1)
  dirLightHelper.visible = params.showLightHelpers
  scene.add(dirLight)
  scene.add(dirLightHelper)

  const fillLight = new THREE.DirectionalLight(0xffffff, 1)
  fillLight.position.set(-5, 4, 2)
  const fillLightHelper = new THREE.DirectionalLightHelper(fillLight, 1)
  fillLightHelper.visible = params.showLightHelpers
  scene.add(fillLight)
  scene.add(fillLightHelper)

  const gui = new GUI()
  gui
    .add(params, "file", [""].concat(imagesMap))
    .name("File")
    .onChange((value) => {
      const filesToDispose: THREE.Object3D[] = []
      if (group.children.length) {
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            filesToDispose.push(child)
            child.geometry.dispose()
          }
        })
        if (filesToDispose.length) {
          console.log(filesToDispose)
          for (let i = 0; i < filesToDispose.length; i++) {
            group.remove(filesToDispose[i])
          }
        }
      }

      loader.load(`./src/${value}`, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) child.material = material
          group.add(child)
          setGroupToCenter()
        })
      })
    })
  gui.add(params, "environment", ["Room", "Dramatic"]).name("Environment")
  gui.addColor(params, "color").onChange((value) => material.color.set(value))
  gui.add(material, "roughness", 0, 1)
  gui.add(material, "metalness", 0, 1)
  gui
    .add(params, "showBoxHelper")
    .name("Box Helper")
    .onChange((value) => (box.visible = value))
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

function setGroupToCenter() {
  centerBox.setFromObject(group)
  centerBox.getCenter(centerVector)
  group.position.x -= centerVector.x
  group.position.y -= centerVector.y
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  switch (params.environment) {
    case "Room":
      scene.environment = roomEnv
      break
    case "Dramatic":
      scene.environment = null
      break
  }

  renderer.render(scene, camera)
}
