"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const delivery_entity_1 = require("./delivery.entity");
let DeliveriesService = class DeliveriesService {
    deliveriesRepository;
    constructor(deliveriesRepository) {
        this.deliveriesRepository = deliveriesRepository;
    }
    async create(data) {
        const delivery = this.deliveriesRepository.create({
            ...data,
            status: 'pending',
            paymentCompleted: false,
        });
        return this.deliveriesRepository.save(delivery);
    }
    async findAll() {
        return this.deliveriesRepository.find({ order: { createdAt: 'DESC' } });
    }
    async findByCustomer(customerId) {
        return this.deliveriesRepository.find({ where: { customerId } });
    }
    async findAvailable() {
        return this.deliveriesRepository.find({ where: { status: 'pending' } });
    }
    async accept(id, riderId) {
        const delivery = await this.deliveriesRepository.findOne({ where: { id } });
        if (!delivery) {
            throw new common_1.NotFoundException('Delivery request not found');
        }
        if (delivery.status !== 'pending') {
            throw new Error('Only pending requests can be accepted');
        }
        delivery.riderId = riderId;
        delivery.status = 'accepted';
        return this.deliveriesRepository.save(delivery);
    }
    async updateStatus(id, status) {
        const delivery = await this.deliveriesRepository.findOne({ where: { id } });
        if (!delivery) {
            throw new common_1.NotFoundException('Delivery request not found');
        }
        delivery.status = status;
        return this.deliveriesRepository.save(delivery);
    }
    async updateLocation(id, latitude, longitude) {
        const delivery = await this.deliveriesRepository.findOne({ where: { id } });
        if (!delivery) {
            throw new common_1.NotFoundException('Delivery request not found');
        }
        delivery.riderLatitude = latitude;
        delivery.riderLongitude = longitude;
        return this.deliveriesRepository.save(delivery);
    }
    async markPaid(id) {
        const delivery = await this.deliveriesRepository.findOne({ where: { id } });
        if (!delivery) {
            throw new common_1.NotFoundException('Delivery request not found');
        }
        delivery.paymentCompleted = true;
        return this.deliveriesRepository.save(delivery);
    }
    async getAnalytics() {
        const deliveries = await this.deliveriesRepository.find();
        const completed = deliveries.filter((item) => item.status === 'completed').length;
        const revenue = deliveries
            .filter((item) => item.paymentCompleted)
            .reduce((sum, item) => sum + item.cost, 0);
        return {
            totalDeliveries: deliveries.length,
            completedDeliveries: completed,
            revenue,
        };
    }
};
exports.DeliveriesService = DeliveriesService;
exports.DeliveriesService = DeliveriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(delivery_entity_1.Delivery)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DeliveriesService);
//# sourceMappingURL=deliveries.service.js.map