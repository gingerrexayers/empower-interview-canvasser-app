import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateVoterDto } from './dto/create-voter.dto';
import { Voter } from './voter.entity';
import { VotersService } from './voters.service';
import { RequestWithUser } from '../common/request-with-user';
import { UpdateVoterDto } from './dto/update-voter.dto';

@Controller('voters')
@UseGuards(AuthGuard)
export class VotersController {
  constructor(private readonly votersService: VotersService) {}

  @Get()
  async allVoters(@Request() req: RequestWithUser) {
    return await this.votersService.getVoters(req.user.id);
  }

  @Patch(':id')
  async updateVoter(
    @Param('id') id: string,
    @Body() updateVoterDto: UpdateVoterDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.votersService.updateVoter(
      Number(id),
      updateVoterDto,
      req.user.id,
    );
  }

  @Post()
  async create(
    @Body() createVoterDto: CreateVoterDto,
    @Request() req: RequestWithUser,
  ): Promise<Voter> {
    console.log(req.user);
    return await this.votersService.create(createVoterDto, req.user.id);
  }
}
