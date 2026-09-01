import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from './delivery.entity';
export declare class DeliveriesService {
    private readonly deliveriesRepository;
    constructor(deliveriesRepository: Repository<Delivery>);
    create(data: {
        customerId: string;
        pickupLocation: string;
        dropoffLocation: string;
        packageDetails: string;
        cost: number;
    }): Promise<Delivery>;
    findAll(): Promise<Delivery[]>;
    findByCustomer(customerId: string): Promise<Delivery[]>;
    findAvailable(): Promise<Delivery[]>;
    accept(id: string, riderId: string): Promise<Delivery>;
    updateStatus(id: string, status: DeliveryStatus): Promise<Delivery>;
    updateLocation(id: string, latitude: number, longitude: number): Promise<Delivery>;
    markPaid(id: string): Promise<Delivery>;
    getAnalytics(): Promise<{
        totalDeliveries: number;
        completedDeliveries: number;
        revenue: number;
    }>;
}
