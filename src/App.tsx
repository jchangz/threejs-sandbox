import { useCallback, useMemo } from "react"
import "./App.css"
import { useDropzone } from "react-dropzone"
import * as validator from "gltf-validator"

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "transparent",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
}

const focusedStyle = {
  backgroundColor: "#2196f3",
}

const acceptStyle = {
  backgroundColor: "#00e676",
}

const rejectStyle = {
  backgroundColor: "#ff1744",
}

function App() {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onabort = () => console.log("file reading was aborted")
      reader.onerror = () => console.log("file reading has failed")
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        validator.validateBytes(new Uint8Array(binaryStr)).then(
          (result) => {
            // [result] will contain validation report in object form.
            // You can convert it to JSON to see its internal structure.
            console.log(JSON.stringify(result, null, "  "))
          },
          (result) => {
            // Promise rejection means that arguments were invalid or validator was unable
            // to detect file format (glTF or GLB).
            // [result] will contain exception string.
            console.error(result)
          }
        )
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept, isDragReject } = useDropzone({ onDrop })

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  )

  return (
    <div className="app-container flex">
      <div className="dropzone-container">
        <div className={`dropzone`} {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </div>
    </div>
  )
}

export default App
