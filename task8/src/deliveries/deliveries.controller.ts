import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: any) {
    return this.deliveriesService.create({
      customerId: req.user.id,
      pickupLocation: dto.pickupLocation,
      dropoffLocation: dto.dropoffLocation,
      packageDetails: dto.packageDetails,
      cost: Number(dto.cost ?? 0),
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('rider')
  @Get('available')
  async available() {
    return this.deliveriesService.findAvailable();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('rider')
  @Patch(':id/accept')
  async accept(@Param('id') id: string, @Request() req: any) {
    return this.deliveriesService.accept(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.deliveriesService.updateStatus(id, status as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('rider')
  @Patch(':id/location')
  async updateLocation(@Param('id') id: string, @Body() dto: { latitude: number; longitude: number }) {
    return this.deliveriesService.updateLocation(id, dto.latitude, dto.longitude);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/pay')
  async pay(@Param('id') id: string) {
    return this.deliveriesService.markPaid(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('analytics')
  async analytics() {
    return this.deliveriesService.getAnalytics();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.deliveriesService.findAll();
  }
}
