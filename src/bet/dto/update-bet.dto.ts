import { PartialType } from '@nestjs/swagger';
import { CreateBetDto } from './create-bet.dto';

export class UpdateBetDto extends PartialType(CreateBetDto) {}
