import { and, eq } from 'drizzle-orm'
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

  app.get('/', { preHandler: checkSessionIdExists }, async (request, reply) => {
    if (!request.user?.id) {
      return reply.code(400).send({ message: 'User ID is required' })
    }

    const userMeals = await db
      .select()
      .from(meals)
      .where(eq(meals.userId, request.user.id))

    return reply.code(200).send(JSON.stringify(userMeals))
  })

  app.get(
    '/:mealId',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const getMealByIdParamsSchema = z.object({
        mealId: z.string(),
      })

      const { mealId } = getMealByIdParamsSchema.parse(request.params)

      if (!request.user?.id) {
        return reply.code(400).send({ message: 'User ID is required' })
      }

      const [meal] = await db
        .select()
        .from(meals)
        .where(and(eq(meals.id, mealId), eq(meals.userId, request.user.id)))

      if (!meal) {
        return reply.code(404).send({ message: 'Resource not found' })
      }

      return reply.code(200).send(JSON.stringify(meal))
    }
  )

  app.patch(
    '/:mealId',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const editMealParamsSchema = z.object({
        mealId: z.string(),
      })

      const editMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z
          .string()
          .datetime({ offset: true })
          .transform(value => new Date(value))
          .optional(),
        isOnDiet: z.boolean().optional(),
      })

      if (!request.user?.id) {
        return reply.code(400).send({ message: 'User ID is required' })
      }

      const { mealId } = editMealParamsSchema.parse(request.params)

      const { name, description, date, isOnDiet } = editMealBodySchema.parse(
        request.body
      )

      const [meal] = await db
        .select()
        .from(meals)
        .where(and(eq(meals.id, mealId), eq(meals.userId, request.user.id)))

      if (!meal) {
        return reply.code(404).send({ message: 'Resource not found' })
      }

      await db
        .update(meals)
        .set({ name, description, date, isOnDiet })
        .where(and(eq(meals.id, mealId), eq(meals.userId, request.user.id)))

      return reply.code(200).send()
    }
  )

  app.delete(
    '/:mealId',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        mealId: z.string(),
      })

      const { mealId } = deleteMealParamsSchema.parse(request.params)

      if (!request.user?.id) {
        return reply.code(400).send({ message: 'User ID is required' })
      }

      const [meal] = await db
        .select()
        .from(meals)
        .where(and(eq(meals.id, mealId), eq(meals.userId, request.user.id)))

      if (!meal) {
        return reply.code(404).send({ message: 'Resource not found' })
      }

      await db
        .delete(meals)
        .where(and(eq(meals.id, mealId), eq(meals.userId, request.user.id)))

      return reply.code(204).send()
    }
  )
}
