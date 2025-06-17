import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CreateVoterDto } from './dto/create-voter.dto';
import { Voter } from './voter.entity';
import { VotersService } from './voters.service';
import type { RequestWithUser } from '../common/request-with-user';
import { UpdateVoterDto } from './dto/update-voter.dto';

@Controller('voters')
@UseGuards(AuthGuard)
export class VotersController {
  constructor(private readonly votersService: VotersService) {}

  @Get()
  async allVoters(
    @Request() req: RequestWithUser,
    @Query('search') search?: string,
  ) {
    return await this.votersService.getVoters(req.user.id, search);
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
    return await this.votersService.create(createVoterDto, req.user.id);
  }

  @Get('export/csv')
  async exportVotersAsCsv(
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const csvData = await this.votersService.getVotersAsCsv(req.user.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="voters.csv"');
    res.send(csvData);
  }
}
