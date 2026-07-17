import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim())
    app.enableCors({ origin: origins, credentials: true })
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001)
}

bootstrap()
