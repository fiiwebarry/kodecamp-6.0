import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("./user.entity").User[]>;
    profile(req: any): Promise<import("./user.entity").User>;
    findOne(id: string): Promise<import("./user.entity").User | null>;
}
