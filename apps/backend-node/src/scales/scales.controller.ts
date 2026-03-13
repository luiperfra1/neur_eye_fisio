import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateScaleDto } from './dto/create-scale.dto';
import { CreateScaleSectionDto } from './dto/create-scale-section.dto';
import { CreateScaleTestDto } from './dto/create-scale-test.dto';
import { ScalesService } from './scales.service';

@Controller('scales')
export class ScalesController {
  constructor(private readonly scalesService: ScalesService) {}

  @Get()
  listScales() {
    return this.scalesService.listScales();
  }

  @Get(':scaleId')
  getScale(@Param('scaleId') scaleId: string) {
    return this.scalesService.getScaleById(scaleId);
  }

  @Post()
  createScale(@Body() dto: CreateScaleDto) {
    return this.scalesService.createScale(dto);
  }

  @Post(':scaleId/sections')
  createSection(
    @Param('scaleId') scaleId: string,
    @Body() dto: CreateScaleSectionDto,
  ) {
    return this.scalesService.createSection(scaleId, dto);
  }

  @Post(':scaleId/tests')
  createTest(@Param('scaleId') scaleId: string, @Body() dto: CreateScaleTestDto) {
    return this.scalesService.createTest(scaleId, dto);
  }
}
