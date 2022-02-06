import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Abilities } from './ability.decorator';
import { AbilityGuard } from './ability.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('book')
  @Abilities({ action: 'read', subject: 'book' })
  @UseGuards(AbilityGuard)
  async getBook() {
    return { value: await this.appService.getBook() };
  }

  @Get('magazine')
  @Abilities({ action: 'read', subject: 'magazine' })
  @UseGuards(AbilityGuard)
  async getMagazine() {
    return { value: await this.appService.getMagazine() };
  }

  @Get('report')
  @Abilities({ action: 'read', subject: 'report' })
  @UseGuards(AbilityGuard)
  async getReport() {
    return { value: await this.appService.getReport() };
  }

  @Post('register')
  register(
    @Body()
    body: {
      username: string;
      password: string;
      roles?: number[];
      accesses?: number[];
    },
  ) {
    return this.appService.register(body);
  }

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.appService.login(body);
  }
}
