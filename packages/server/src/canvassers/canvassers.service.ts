import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Canvasser } from './canvasser.entity';

@Injectable()
export class CanvassersService {
  constructor(
    @InjectRepository(Canvasser)
    private canvassersRepository: Repository<Canvasser>,
  ) {}

  findAll(): Promise<Canvasser[]> {
    return this.canvassersRepository.find();
  }

  findOne(id: number): Promise<Canvasser | null> {
    return this.canvassersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.canvassersRepository.delete(id);
  }
}
