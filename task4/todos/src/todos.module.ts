import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { Todo } from './todo.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'your_password',
      database: 'todo_db',
      entities: [Todo],
      synchronize: true, // only for dev
    }),
    TodosModule,
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
