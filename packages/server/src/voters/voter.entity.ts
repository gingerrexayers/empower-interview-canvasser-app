import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Canvasser } from '../canvassers/canvasser.entity';

@Entity('voter')
export class Voter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  canvasser_id: number;

  @ManyToOne(() => Canvasser, (canvasser) => canvasser.voters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'canvasser_id' })
  canvasser: Canvasser;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
