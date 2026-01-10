import { useCallback, useMemo } from "react"
import "./App.css"
import { useDropzone } from "react-dropzone"

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
    // Do something with the files
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
