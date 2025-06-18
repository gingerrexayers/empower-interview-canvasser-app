import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateVoterDto } from './dto/create-voter.dto';
import { Voter } from './voter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { UpdateVoterDto } from './dto/update-voter.dto';

@Injectable()
export class VotersService {
  private readonly logger = new Logger(VotersService.name);
  constructor(
    @InjectRepository(Voter)
    private readonly voterRepository: Repository<Voter>,
  ) {}

  async create(
    createVoterDto: CreateVoterDto,
    canvasserId: number,
  ): Promise<Voter> {
    this.logger.log(
      `Attempting to create voter for canvasser ID: ${canvasserId} with data: ${JSON.stringify(
        createVoterDto,
      )}`,
    );
    try {
      const voter = this.voterRepository.create({
        ...createVoterDto,
        canvasser_id: canvasserId,
      });
      const savedVoter = await this.voterRepository.save(voter);
      this.logger.log(
        `Voter created successfully with ID: ${savedVoter.id} for canvasser ID: ${canvasserId}`,
      );
      return savedVoter;
    } catch (error) {
      this.logger.error(
        `Error creating voter for canvasser ID: ${canvasserId}. Data: ${JSON.stringify(
          createVoterDto,
        )}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error;
    }
  }

  async getVoters(canvasserId: number, searchTerm?: string): Promise<Voter[]> {
    this.logger.log(
      `Fetching voters for canvasser ID: ${canvasserId}. Search term: "${searchTerm || 'None'}"`,
    );
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
    this.logger.log(
      `Attempting to update voter ID: ${id} for canvasser ID: ${canvasserId} with data: ${JSON.stringify(
        updateVoterDto,
      )}`,
    );
    const voter = await this.voterRepository.findOne({
      where: { id, canvasser_id: canvasserId },
    });
    if (!voter) {
      this.logger.warn(
        `Voter ID: ${id} not found for canvasser ID: ${canvasserId}. Update failed.`,
      );
      throw new NotFoundException(
        `Voter with ID: ${id} not found for canvasser ID: ${canvasserId}.`,
      );
    }
    const updatedVoter = await this.voterRepository.save({
      ...voter,
      ...updateVoterDto,
    });
    this.logger.log(
      `Voter ID: ${id} updated successfully for canvasser ID: ${canvasserId}.`,
    );
    return updatedVoter;
  }

  async getVotersAsCsv(canvasserId: number): Promise<string> {
    this.logger.log(
      `Exporting voters to CSV for canvasser ID: ${canvasserId}.`,
    );
    const voters = await this.voterRepository.find({
      where: { canvasser_id: canvasserId },
      order: {
        name: 'ASC',
      },
    });

    if (!voters.length) {
      this.logger.log(
        `No voters found for CSV export for canvasser ID: ${canvasserId}.`,
      );
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

    const csvData = header + csvRows.join('\n');
    this.logger.log(
      `Successfully generated CSV for ${voters.length} voters for canvasser ID: ${canvasserId}.`,
    );
    return csvData;
  }
}
