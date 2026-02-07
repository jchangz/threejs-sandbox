import { useState, useCallback, useMemo } from "react"
import type { Dispatch, SetStateAction } from "react"
import { createPortal } from "react-dom"
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useDropzone } from "react-dropzone"
import * as validator from "gltf-validator"
import { Canvas } from "@react-three/fiber"
import { CameraControls, Environment, Center } from "@react-three/drei"
import "./App.css"

// --- Types ---

interface ModalContentProps {
  onClose: () => void
  content: string | object
}

interface PortalExampleProps {
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
  error: string | object
}

// --- Components ---

function ModalContent({ onClose, content }: ModalContentProps) {
  // Better handling for object errors (like validation reports)
  const contentFormat = typeof content === "object" 
    ? JSON.stringify(content, null, 2) 
    : content

  return (
    <div className="modal" style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '80vh' }}>
      <div>{contentFormat}</div>
      <button onClick={onClose}>Close</button>
    </div>
  )
}

function PortalExample({ showModal, setShowModal, error }: PortalExampleProps) {
  if (!showModal) return null

  return createPortal(
    <ModalContent content={error} onClose={() => setShowModal(false)} />,
    document.body
  )
}

const baseStyle: React.CSSProperties = {
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

const activeStyle: React.CSSProperties = {
  borderStyle: "none",
}

function App() {
  // Typed the model state as GLTF or null
  const [model, setModel] = useState<GLTF | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | object>("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onabort = () => console.log("file reading was aborted")
      reader.onerror = () => console.log("file reading has failed")
      
      reader.onload = () => {
        const binaryStr = reader.result
        if (!(binaryStr instanceof ArrayBuffer)) return

        // gltf-validator expects a Uint8Array
        validator.validateBytes(new Uint8Array(binaryStr)).then(
          (result) => {
            const loader = new GLTFLoader()
            // Loader.parse takes the buffer directly
            loader.parse(
              binaryStr,
              "",
              (gltf) => {
                setModel(gltf)
              },
              (err) => {
                setError(err instanceof Error ? err.message : "Load Error")
                setShowModal(true)
              },
            )
            console.log("Validation Result:", result)
          },
          (rejectReason) => {
            setError(rejectReason)
            setShowModal(true)
          },
        )
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

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
                {/* primitive object expects the scene from the GLTF result */}
                <primitive object={model.scene} dispose={null} />
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
