import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Todo } from './todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepo: Repository<Todo>,
  ) {}

  findAll() {
    return this.todoRepo.find();
  }

  async findOne(id: number) {
    const todo = await this.todoRepo.findOneBy({ id });

    if (!todo) {
      throw new NotFoundException(
        `Todo with ID ${id} not found`,
      );
    }

    return todo;
  }

  async create(createTodoDto: CreateTodoDto) {
    const todo = this.todoRepo.create(createTodoDto);

    return await this.todoRepo.save(todo);
  }

  async update(
    id: number,
    updateTodoDto: UpdateTodoDto,
  ) {
    const todo = await this.findOne(id);

    Object.assign(todo, updateTodoDto);

    return await this.todoRepo.save(todo);
  }

  async remove(id: number) {
    const todo = await this.findOne(id);

    await this.todoRepo.remove(todo);

    return {
      message: 'Todo deleted successfully',
    };
  }
}