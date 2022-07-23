import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('import-database')
  @ApiOperation({
    summary:
      'Get resturants and users data from api and store it into database.',
  })
  @ApiResponse({ status: 200, description: 'return true' })
  async importDatabase(): Promise<boolean> {
    await this.appService.importDatabase();
    return true;
  }
}
