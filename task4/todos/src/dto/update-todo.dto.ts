import { TodoStatus } from "src/enums/todos-status.enum";


export class UpdateTodoDto {
    
 title?: string;
 description?: string;
 status?: TodoStatus;

}