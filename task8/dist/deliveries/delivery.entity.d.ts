export type DeliveryStatus = 'pending' | 'accepted' | 'in-progress' | 'completed';
export declare class Delivery {
    id: string;
    customerId: string;
    riderId?: string;
    pickupLocation: string;
    dropoffLocation: string;
    packageDetails: string;
    cost: number;
    status: DeliveryStatus;
    riderLatitude?: number;
    riderLongitude?: number;
    paymentCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
