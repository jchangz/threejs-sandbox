import { useState, useCallback, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useDropzone } from "react-dropzone"
import * as validator from "gltf-validator"
import { Canvas } from "@react-three/fiber"
import { CameraControls, Environment, Center, ContactShadows } from "@react-three/drei"
import "./App.css"

// --- Types ---

type AppError = string | object | null

// --- Components ---

const Modal = ({ content, onClose }: { content: AppError; onClose: () => void }) => {
  if (!content) return null

  const displayContent = typeof content === "object" ? JSON.stringify(content, null, 2) : content

  return createPortal(
    <div className="modal" style={{ whiteSpace: "pre-wrap", overflow: "auto", maxHeight: "80vh" }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <pre>{displayContent}</pre>
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body,
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
  const [model, setModel] = useState<GLTF | null>(null)
  const [error, setError] = useState<AppError>(null)

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (model) {
        model.scenes.forEach((scene) =>
          scene.traverse((obj: any) => {
            if (obj.isMesh) {
              obj.geometry.dispose()
              obj.material.dispose()
            }
          }),
        )
      }
    }
  }, [model])

  const handleFile = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()

      // 1. Validate
      const validationResult = await validator.validateBytes(new Uint8Array(arrayBuffer))
      if (validationResult.issues.numErrors > 0) {
        throw validationResult
      }

      // 2. Load
      const url = URL.createObjectURL(file)
      const loader = new GLTFLoader()

      loader.load(
        url,
        (gltf) => {
          setModel(gltf)
          URL.revokeObjectURL(url) // Clean up
        },
        undefined,
        (err) => {
          throw err
        },
      )
    } catch (err: any) {
      setError(err?.message || err || "Unknown Error")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleFile(files[0]),
    multiple: false,
    // accept: { "model/gltf-binary": [".glb"], "model/gltf+json": [".gltf"] },
  })

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(model ? activeStyle : {}),
    }),
    [model],
  )

  return (
    <div className="app-container flex">
      <Modal content={error} onClose={() => setError(null)} />
      <div className="dropzone-container">
        <div className="dropzone" {...getRootProps({ style })}>
          {model ? (
            <Canvas camera={{ position: [4, 1, 2], fov: 35 }}>
              <color attach="background" args={["skyblue"]} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} />
              <Environment preset="studio" />
              <Center>
                <primitive object={model.scene} dispose={null} />
              </Center>
              <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
              <CameraControls makeDefault />
            </Canvas>
          ) : (
            <>
              <input {...getInputProps()} />
              <p>{isDragActive ? "Drop it!" : "Drag a GLB/GLTF file here"}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
