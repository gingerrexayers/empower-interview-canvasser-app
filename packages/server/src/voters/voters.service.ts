import { Injectable } from '@nestjs/common';
import { CreateVoterDto } from './dto/create-voter.dto';
import { Voter } from './voter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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
      console.error(error);
      throw error;
    }
  }

  async getVoters(canvasserId: number, searchTerm?: string): Promise<Voter[]> {
    if (searchTerm) {
      return this.voterRepository.find({
        where: [
          { canvasser_id: canvasserId, name: Like(`%${searchTerm}%`) },
          { canvasser_id: canvasserId, notes: Like(`%${searchTerm}%`) },
        ],
        order: {
          updated_at: 'DESC',
        },
      });
    }
    return this.voterRepository.find({
      where: { canvasser_id: canvasserId },
      order: {
        updated_at: 'DESC',
      },
    });
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

  async getVotersAsCsv(canvasserId: number): Promise<string> {
    const voters = await this.voterRepository.find({
      where: { canvasser_id: canvasserId },
      order: {
        name: 'ASC',
      },
    });

    if (!voters.length) {
      return 'No voters found';
    }

    const header = 'ID,Name,Email,Notes,CreatedAt,UpdatedAt\n';
    const csvRows = voters.map((voter) => {
      const id = voter.id;
      // Escape commas and newlines in string fields to prevent CSV corruption
      const name = `"${voter.name.replace(/"/g, '""')}"`;
      const email = voter.email ? `"${voter.email.replace(/"/g, '""')}"` : '';
      const notes = voter.notes ? `"${voter.notes.replace(/"/g, '""')}"` : '';
      const createdAt = voter.created_at.toISOString();
      const updatedAt = voter.updated_at.toISOString();
      return `${id},${name},${email},${notes},${createdAt},${updatedAt}`;
    });

    return header + csvRows.join('\n');
  }
}
