import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { SubscribeDto, CheckLimitDto } from './dto/subscription.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('current')
  @RequirePermissions('settings.manage')
  getCurrent(@CurrentTenant() orgId: string) {
    return this.subscriptionsService.getCurrentSubscription(orgId);
  }

  @Post('subscribe')
  @RequirePermissions('settings.manage')
  subscribe(@Body() body: SubscribeDto, @CurrentTenant() orgId: string) {
    return this.subscriptionsService.subscribe(body, orgId);
  }

  @Post('cancel')
  @RequirePermissions('settings.manage')
  cancel(@CurrentTenant() orgId: string) {
    return this.subscriptionsService.cancelSubscription(orgId);
  }

  @Post('check-limit')
  @RequirePermissions('settings.manage')
  checkLimit(@Body() body: CheckLimitDto, @CurrentTenant() orgId: string) {
    return this.subscriptionsService.checkLimit(body.limitCode, body.incrementBy || 1, orgId);
  }
}
