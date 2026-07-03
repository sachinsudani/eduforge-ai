import * as Joi from 'joi'

export const envValidationSchema = Joi.object({
    PORT: Joi.number().default(3001),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('1d'),
    MONGO_URI: Joi.string().uri({ scheme: [/mongodb(\+srv)?/] }).required(),
    MONGO_DB: Joi.string().default('eduforge'),
    REDIS_HOST: Joi.string().default('127.0.0.1'),
    REDIS_PORT: Joi.number().default(6379),
    OPENAI_API_KEY: Joi.string().optional(),
    PINECONE_API_KEY: Joi.string().optional(),
    PINECONE_INDEX: Joi.string().optional()
})
