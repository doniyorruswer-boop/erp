import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { SetupService } from './setup.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InitializeSetupDto, UpdateConfigDto } from './dto/setup.dto';

@ApiTags('Setup & Multi-Tenancy')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @ApiOperation({ summary: "Tizim o'rnatilganlik holatini tekshirish" })
  @Get('status')
  getStatus() {
    return this.setupService.getStatus();
  }

  @ApiOperation({ summary: "Barcha ro'yxatdan o'tgan tashkilotlar / filiallar ro'yxati" })
  @Get('organizations')
  getOrganizations() {
    return this.setupService.getOrganizations();
  }

  @ApiOperation({ summary: 'Aktiv tashkilot / filialni almashtirish' })
  @Post('switch/:id')
  switchOrganization(@Param('id') id: string) {
    return this.setupService.switchOrganization(id);
  }

  @ApiOperation({ summary: "Setup Wizard orqali tizimni ilk bor o'rnatish" })
  @Post('initialize')
  initialize(@Body() body: InitializeSetupDto) {
    return this.setupService.initialize(body);
  }

  @ApiOperation({ summary: 'Tizim konfiguratsiyasini olish' })
  @Get('config')
  getConfig() {
    return this.setupService.getConfig();
  }

  @ApiOperation({ summary: 'Tizim modullari va parametrlarini yangilash' })
  @Put('config')
  updateConfig(@Body() body: UpdateConfigDto) {
    return this.setupService.updateConfig(body);
  }

  @ApiOperation({ summary: "Mavjud universal modullar va aktiv holati ro'yxati" })
  @Get('modules')
  getModules() {
    return this.setupService.getModules();
  }
}
