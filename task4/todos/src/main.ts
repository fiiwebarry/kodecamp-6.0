import { NestFactory } from '@nestjs/core';
import { TodosModule } from './todos.module';


async function bootstrap() {
  const app = await NestFactory.create(TodosModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
