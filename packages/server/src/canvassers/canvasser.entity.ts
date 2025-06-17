import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Voter } from '../voters/voter.entity';

@Entity()
export class Canvasser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Voter, (voter) => voter.canvasser)
  voters?: Voter[];
}
