import { useState, useCallback, useMemo } from "react"
import type { Dispatch, SetStateAction } from "react"
import { createPortal } from "react-dom"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useDropzone } from "react-dropzone"
import * as validator from "gltf-validator"
import { Canvas } from "@react-three/fiber"
import { CameraControls, Environment, Center } from "@react-three/drei"
import "./App.css"

function ModalContent({ onClose, content }: { onClose: () => void; content: string | object }) {
  const contentFormat = typeof content === "object" ? content.toString() : content
  return (
    <div className="modal">
      <div>{contentFormat}</div>
      <button onClick={onClose}>Close</button>
    </div>
  )
}

function PortalExample({
  showModal,
  setShowModal,
  error,
}: {
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
  error: string | object
}) {
  return (
    <>
      {showModal && createPortal(<ModalContent content={error} onClose={() => setShowModal(false)} />, document.body)}
    </>
  )
}

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
}

const activeStyle = {
  borderStyle: "none",
}

// const acceptStyle = {
//   backgroundColor: "#00e676",
// }

// const rejectStyle = {
//   backgroundColor: "#ff1744",
// }

function App() {
  const [model, setModel] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onabort = () => console.log("file reading was aborted")
      reader.onerror = () => console.log("file reading has failed")
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        validator.validateBytes(new Uint8Array(binaryStr)).then(
          (result) => {
            const loader = new GLTFLoader()
            loader.parse(
              binaryStr,
              "",
              (gltf) => {
                setModel(gltf)
              },
              (error) => {
                setError(error)
                setShowModal(true)
                console.error("Error loading GLTF from buffer:", error)
              },
            )

            // [result] will contain validation report in object form.
            // You can convert it to JSON to see its internal structure.
            console.log(JSON.stringify(result, null, "  "))
          },
          (result) => {
            // Promise rejection means that arguments were invalid or validator was unable
            // to detect file format (glTF or GLB).
            // [result] will contain exception string.
            setError(result)
            setShowModal(true)
            console.error(result)
          },
        )
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept, isDragReject } = useDropzone({ onDrop })

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(model ? activeStyle : {}),
    }),
    [model],
  )

  return (
    <div className="app-container flex">
      <PortalExample showModal={showModal} setShowModal={setShowModal} error={error} />
      <div className="dropzone-container">
        <div className="dropzone" {...getRootProps({ style })}>
          {model ? (
            <Canvas camera={{ position: [4, 1, 2], fov: 35 }}>
              <color attach="background" args={["skyblue"]} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} />
              <Environment preset="studio" />
              <Center>
                <mesh>
                  <primitive object={model.scene} dispose={null} />
                </mesh>
              </Center>
              <CameraControls />
            </Canvas>
          ) : (
            <>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
