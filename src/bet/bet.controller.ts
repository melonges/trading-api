import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RequestUser } from 'src/types/user';
import { FindOneParams } from 'src/utils/findOneParams.entity';
import { BetService } from './bet.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { Bet } from './entities/bet.entity';

@UseGuards(JwtGuard)

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Bet')
@Controller('bet')
export class BetController {
  constructor(private readonly betService: BetService) { }

  @ApiResponse({ type: Bet })
  @Post()
  create(@Body() createBetDto: CreateBetDto, @Req() req: RequestUser) {
    return this.betService.create(createBetDto, req.user.id);
  }

  @ApiResponse({ type: [Bet] })
  @Get('all')
  findAll(@Req() req: RequestUser) {
    return this.betService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: FindOneParams) {
    return this.betService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: FindOneParams, @Body() updateBetDto: UpdateBetDto) {
    return this.betService.update(+id, updateBetDto);
  }

  @Delete(':id')
  close(@Param('id') id: FindOneParams, @Req() req: RequestUser) {
    return this.betService.close(+id, req.user.id);
  }
}
