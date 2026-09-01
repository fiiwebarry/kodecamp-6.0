import { DeliveriesService } from './deliveries.service';
export declare class DeliveriesController {
    private readonly deliveriesService;
    constructor(deliveriesService: DeliveriesService);
    create(req: any, dto: any): Promise<import("./delivery.entity").Delivery>;
    available(): Promise<import("./delivery.entity").Delivery[]>;
    accept(id: string, req: any): Promise<import("./delivery.entity").Delivery>;
    updateStatus(id: string, status: string): Promise<import("./delivery.entity").Delivery>;
    updateLocation(id: string, dto: {
        latitude: number;
        longitude: number;
    }): Promise<import("./delivery.entity").Delivery>;
    pay(id: string): Promise<import("./delivery.entity").Delivery>;
    analytics(): Promise<{
        totalDeliveries: number;
        completedDeliveries: number;
        revenue: number;
    }>;
    findAll(): Promise<import("./delivery.entity").Delivery[]>;
}
