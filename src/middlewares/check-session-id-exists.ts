import { eq } from 'drizzle-orm'
import { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../db'
import { users } from '../db/schema'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.code(401).send({ message: 'Unauthorized' })
  }

  const [userOnDatabase] = await db
    .select()
    .from(users)
    .where(eq(users.sessionId, sessionId))

  if (!userOnDatabase) {
    reply.code(401).send({ message: 'Unauthorized' })
  }

  request.user = userOnDatabase
}
