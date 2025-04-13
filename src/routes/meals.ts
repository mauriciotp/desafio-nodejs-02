import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db'
import { meals } from '../db/schema'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z
          .string()
          .datetime({ offset: true })
          .transform(value => new Date(value)),
        isOnDiet: z.boolean(),
      })

      const { name, description, date, isOnDiet } = createMealBodySchema.parse(
        request.body
      )

      if (!request.user?.id) {
        return reply.code(400).send({ message: 'User ID is required' })
      }

      await db.insert(meals).values({
        name,
        description,
        date,
        isOnDiet,
        userId: request.user.id,
      })

      return reply.code(201).send()
    }
  )
}
