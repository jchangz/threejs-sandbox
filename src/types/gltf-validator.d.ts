declare module "gltf-validator" {
  const enum Severity {
    Error = 0,
    Warning = 1,
    Information = 2,
    Hint = 3,
  }

  interface Messages {
    code: string
    message: string
    severity: Severity
    pointer: string
  }

  interface Issues {
    numErrors: number
    numWarnings: number
    numInfos: number
    numHints: number
    messages: Messages[]
    truncated: boolean
  }

  interface Resources {
    pointer: string
    mimeType: string
    storage: string
    uri: string
  }

  interface Info {
    version: string
    generator: string
    resources: Resources[]
    animationCount: number
    materialCount: number
    hasMorphTargets: boolean
    hasSkins: boolean
    hasTextures: boolean
    hasDefaultScene: boolean
    drawCallCount: number
    totalVertexCount: number
    totalTriangleCount: number
    maxUVs: number
    maxInfluences: number
    maxAttributes: number
  }

  interface Result {
    uri: string
    mimeType: string
    validatorVersion: string
    validatedAt: string
    issues: Issues
    info: Info
  }

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
  ): Promise<Result>
}
