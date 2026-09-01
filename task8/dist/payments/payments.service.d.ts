import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
export declare class PaymentsService {
    private readonly paymentsRepository;
    constructor(paymentsRepository: Repository<Payment>);
    createPayment(data: {
        deliveryId: string;
        customerId: string;
        amount: number;
    }): Promise<Payment>;
    findAll(): Promise<Payment[]>;
    findByDelivery(deliveryId: string): Promise<Payment[]>;
    verifyPayment(id: string): Promise<Payment>;
}
