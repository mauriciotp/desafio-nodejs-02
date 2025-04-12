import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error(
    'Invalid environment variables!',
    parsedEnv.error.flatten().fieldErrors
  )
  throw new Error('Invalid environment variables!')
}

export const env = parsedEnv.data
