declare module "gltf-validator" {
  export enum Severity {
    Error = 0,
    Warning = 1,
    Information = 2,
    Hint = 3,
  }

  export interface Message {
    code: string
    message: string
    severity: Severity
    pointer?: string // Optional because not all issues are tied to a specific JSON pointer
    offset?: number // Often present in binary (GLB) validation
  }

  export interface Issues {
    numErrors: number
    numWarnings: number
    numInfos: number
    numHints: number
    messages: Message[]
    truncated: boolean
  }

  export interface Resource {
    pointer: string
    mimeType: string
    storage: string
    uri?: string // Can be undefined if it's internal/embedded data
    byteLength?: number
  }

  export interface Info {
    version: string
    generator: string
    resources: Resource[]
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

  export interface Result {
    uri: string
    mimeType: string
    validatorVersion: string
    validatedAt: string
    issues: Issues
    info: Info
  }

  export interface ValidationOptions {
    uri?: string
    externalResourceFunction?: (uri: string) => Promise<Uint8Array>
    validateAccessorData?: boolean
    maxMessages?: number
    ignoredMessages?: string[]
    severityOverrides?: { [code: string]: Severity }
  }

  /**
   * Validates a GLTF/GLB asset provided as a Uint8Array.
   */
  export function validateBytes(data: Uint8Array, options?: ValidationOptions): Promise<Result>
}
