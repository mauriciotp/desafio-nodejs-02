import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string
      sessionId: string
      name: string
      email: string
      createdAt: Date | null
      updatedAt: Date | null
    }
  }
}
