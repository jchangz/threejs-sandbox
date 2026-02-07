## fix types

1. **State Typing:** Changed useState(null) to useState<GLTF | null>(null). I imported GLTF from the Three.js loader types so the compiler knows exactly what properties (like .scene) are available on your model.

2. **tyles:** Explicitly typed baseStyle and activeStyle as React.CSSProperties. This prevents TypeScript from complaining when you spread them into the style object.

3. **FileReader Guard:** Added a check if (!(binaryStr instanceof ArrayBuffer)) return. FileReader.result can be a string or an ArrayBuffer; since your logic depends on a buffer, we need to ensure that's what we have.

4. **Error Handling:** In the loader.parse error callback, I added a check for err instanceof Error to safely access .message, which is much safer than passing a raw event object to your Modal.

5. **Modal Prettification:** Inside ModalContent, I changed .toString() to JSON.stringify(content, null, 2). If the validator returns a report object, you'll actually be able to read it now instead of seeing [object Object].