import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Param,
} from '@nestjs/common';

import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
  ) {}

  @Post()
  createTodo(
    @Body() createTodoDto: CreateTodoDto,
  ) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  getTodos() {
    return this.todosService.findAll();
  }

  @Get(':id')
  getTodo(
    @Param('id') id: string,
  ) {
    return this.todosService.findOne(Number(id));
  }

  @Put(':id')
  updateTodo(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(
      Number(id),
      updateTodoDto,
    );
  }

  @Delete(':id')
  deleteTodo(
    @Param('id') id: string,
  ) {
    return this.todosService.remove(Number(id));
  }
}