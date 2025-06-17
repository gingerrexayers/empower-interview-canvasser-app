import { Injectable } from '@nestjs/common';
import { CreateVoterDto } from './dto/create-voter.dto';
import { Voter } from './voter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CanvasserAlreadyHasVoterWithEmailException } from './exceptions/canvasser-already-has-voter-with-email.exception';
import { UpdateVoterDto } from './dto/update-voter.dto';

@Injectable()
export class VotersService {
  constructor(
    @InjectRepository(Voter)
    private readonly voterRepository: Repository<Voter>,
  ) {}

  async create(
    createVoterDto: CreateVoterDto,
    canvasserId: number,
  ): Promise<Voter> {
    try {
      const voter = this.voterRepository.create({
        ...createVoterDto,
        canvasser_id: canvasserId,
      });
      return await this.voterRepository.save(voter);
    } catch (error) {
      // catch duplicate entry error
      if (error instanceof QueryFailedError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.driverError?.code === 'ER_DUP_ENTRY') {
          throw new CanvasserAlreadyHasVoterWithEmailException(
            createVoterDto.email,
          );
        }
      }
      console.log(error);
      throw error;
    }
  }

  async getVoters(canvasserId: number): Promise<Voter[]> {
    return this.voterRepository.find({ where: { canvasser_id: canvasserId } });
  }

  async updateVoter(
    id: number,
    updateVoterDto: UpdateVoterDto,
    canvasserId: number,
  ): Promise<Voter> {
    const voter = await this.voterRepository.findOne({
      where: { id, canvasser_id: canvasserId },
    });
    if (!voter) {
      throw new Error('Voter not found');
    }
    return this.voterRepository.save({ ...voter, ...updateVoterDto });
  }
}
