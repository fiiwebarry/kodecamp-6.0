import { TodoStatus } from "src/enums/todos-status.enum";


export class CreateTodoDto {
    
 title?: string;
 description?: string;
 status?: TodoStatus;

}