declare module "gltf-validator" {
  /**
   * Validates a GLTF/GLB asset provided as a Uint8Array.
   * @param data - The glTF/GLB file content as bytes.
   * @param options - Optional configuration for validation.
   * @returns A promise that resolves to the validation report.
   */
  export function validateBytes(
    data: Uint8Array,
    options?: {
      maxSeverity?: number
      uri?: string
    },
  ): Promise<any> // Replace 'any' with specific report interface if needed

  // Add other exports if necessary
}
