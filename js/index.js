var scene, camera, renderer, controls
const width = window.innerWidth
const height = window.innerHeight
const ratio = width / height
var xsectiontypeselect = document.getElementById("xsectiontype")
var xsectionselectrange = document.getElementById("xsectionselect")
var tsliceselectrange = document.getElementById("tsliceselect")
var showallinput = document.getElementById("showallinput")

var board = {}
const boardSize = 10 //The width of the board
var xsectiontype = "x"
var xsection
var tslice

const init = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, ratio, 1, 1000)
  camera.position.z = 7
  camera.position.y = 7
  camera.position.x = 3

  controls = new THREE.OrbitControls(camera, document.getElementById("viewport"))
  axis = new THREE.AxisHelper(300)
  scene.add(axis)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor("#e3e3e3")
  renderer.setSize(width, height)

  document.getElementById("viewport").append(renderer.domElement)

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  const animate = () => {
    //sphere.position.y += 0.1
  }

  const render = () => {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    controls.update()
    animate()
  }
  render()
}

const getPointLight = (color, intensity, distance) => {
  let light = new THREE.PointLight(color, intensity, distance)
  return light
}

function initBoard() {
  board.meshes = [[], [], []] //Each array represents 1 z slice
}

function drawBoard() {
  let cbColors = []
  console.log(board)
  cbColors.push(0xababab)
  cbColors.push(0x454545)
  let lastColorIndex = 0;
  for(let z = 0; z < 3; z++) {
    for(let x = 0; x < 3; x++) {
      for(let y = 0; y < 3; y++) {
        let geometry = new THREE.BoxGeometry(1, 1, 1)
        let material = new THREE.MeshBasicMaterial({color: cbColors[lastColorIndex==0 ? 1 : 0]})
        lastColorIndex = lastColorIndex==0 ? 1 : 0
        let cube = new THREE.Mesh(geometry, material)
        cube.position.set(x-1, y-1, z-1)
        cube.removed = false
        let alreadyExists = false
        for(var i of board.meshes[z]) {
          if(i.position.x == cube.position.x && i.position.y == cube.position.y && i.position.z == cube.position.z) {
            if(!i.removed) {
              alreadyExists = true
            }
            if(i.removed) {
              i.removed = false
              scene.add(i)
            }
          }
        }
        if(!alreadyExists) {
          board.meshes[z].push(cube)
          scene.add(cube)
        }
      }
    }
  }
  console.log(board)
}

function resetBoardColors() {
  let cbColors = []
  cbColors.push(0xababab)
  cbColors.push(0x454545)
  let lastColorIndex = 0;
  for(let zSlice of board.meshes) {
    for(let mesh of zSlice) {
      let material = new THREE.MeshBasicMaterial({color: cbColors[lastColorIndex==0 ? 1 : 0]})
      lastColorIndex = lastColorIndex==0 ? 1 : 0
      mesh.material = material
    }
  }
}

function getCrossSection(type, xsection) {
  let meshes = []
  for(let zSlice of board.meshes) {
    for(let mesh of zSlice) {
      if(mesh.position[type] +1 == xsection) {
        meshes.push(mesh)
      }
    }
  }
  return meshes
}

function highlightSelection(xsection, slice) {
  let cbColors = []
  cbColors.push(0xf4ff5e)
  cbColors.push(0x929939)
  let lastColorIndex = slice==1 ? 1 : 0
  xsection.forEach(mesh => {
    let material = new THREE.MeshBasicMaterial({color: cbColors[lastColorIndex==0 ? 1 : 0]})
    mesh.material = material
    lastColorIndex = lastColorIndex==0 ? 1 : 0
  })
}

init()

function updateBoardDisplay() {
  xsection = xsectionselectrange.value
  xsectiontype = xsectiontypeselect.value
  let slice = getCrossSection(xsectiontype, xsection - 1)
  console.log(slice.length)
  drawBoard()
  resetBoardColors()
  highlightSelection(slice, xsection - 1)
  let showall = showallinput.checked
  if(!showall) {
    for(let i of board.meshes) {
      for(let mesh of i) {
        if(!slice.includes(mesh)) {
          let x = mesh.position.x
          let y = mesh.position.y
          let z = mesh.position.z
          for(var child of scene.children) {
            if(child.type == "Mesh" && child.position.x == x && child.position.y == y && child.position.z == z ) {
              mesh.removed = true
              scene.remove(child)
            }
          }
        }
      }
    }
  }
}

xsectiontypeselect.onchange = (event) => {
  updateBoardDisplay()
}
xsectionselectrange.oninput = (event) => {
  updateBoardDisplay()
}

initBoard()
drawBoard()
xsection = xsectionselectrange.value
let slice = getCrossSection(xsectiontype, xsection - 1)
highlightSelection(slice, xsection - 1)