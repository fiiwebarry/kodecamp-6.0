import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(req: any, dto: {
        deliveryId: string;
        amount: number;
    }): Promise<import("./payment.entity").Payment>;
    findAll(): Promise<import("./payment.entity").Payment[]>;
    verify(id: string): Promise<import("./payment.entity").Payment>;
}
