import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db'
import { users } from '../db/schema'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    const [userOnDatabase] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    if (userOnDatabase) {
      return reply.code(409).send({ message: 'User already exists' })
    }

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await db.insert(users).values({ name, email, sessionId })

    return reply.status(201).send()
  })
}
