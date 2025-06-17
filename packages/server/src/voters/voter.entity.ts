import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Canvasser } from '../canvassers/canvasser.entity';

@Entity('voter')
@Unique('UQ_voter_email_canvasser', ['email', 'canvasser_id'])
export class Voter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  canvasser_id: number;

  @ManyToOne(() => Canvasser, (canvasser) => canvasser.voters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'canvasser_id' })
  canvasser: Canvasser;
}
