import { useState, useCallback, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useDropzone } from "react-dropzone"
import * as validator from "gltf-validator"
import { Canvas } from "@react-three/fiber"
import { CameraControls, Environment, Center, ContactShadows } from "@react-three/drei"
import "./App.css"
import { LoadingManager } from "three"

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

  const handleFiles = useCallback(async (files: File[]) => {
    const manager = new LoadingManager()
    const objectURLs: string[] = []
    const fileMap = new Map<string, File>()

    // 1. Map all files by their name for easy lookup
    files.forEach((file) => fileMap.set(file.name, file))

    // 2. Set up the LoadingManager to intercept requests
    manager.setURLModifier((url) => {
      // Clean up Three.js path prefixes if necessary
      const fileName = url.split("/").pop() || ""
      const file = fileMap.get(fileName)

      if (file) {
        const blobUrl = URL.createObjectURL(file)
        objectURLs.push(blobUrl) // Keep track for cleanup
        return blobUrl
      }
      return url
    })

    try {
      // 3. Find the main scene file (.gltf or .glb)
      const rootFile = files.find((f) => f.name.match(/\.(gltf|glb)$/i))
      if (!rootFile) throw new Error("No .gltf or .glb file found!")

      const rootBuffer = new Uint8Array(await rootFile.arrayBuffer())
      const validationResult = await validator.validateBytes(rootBuffer, {
        // This callback is crucial for multi-file .gltf assets
        externalResourceFunction: (uri: string) => {
          return new Promise((resolve, reject) => {
            const file = fileMap.get(uri)
            console.log({ file })
            if (file) {
              file.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
            } else {
              reject(`External resource ${uri} not found in dropped files.`)
            }
          })
        },
      })

      console.log(validationResult)

      if (validationResult.issues.numErrors > 0) {
        setError(validationResult) // This will show the JSON report in your modal
        return
      }

      console.log("Validation successful!", validationResult.info)

      const loader = new GLTFLoader(manager)

      // We use the root file's actual URL to start the process
      const rootURL = URL.createObjectURL(rootFile)
      objectURLs.push(rootURL)

      loader.load(rootURL, (gltf) => {
        setModel(gltf)
        // Note: Don't revoke URLs immediately as textures load lazily
      })
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    multiple: true,
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
