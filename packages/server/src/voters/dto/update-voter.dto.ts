import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  IsNotEmpty,
} from 'class-validator';

export class UpdateVoterDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters.' })
  name?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  // Add @Length or other constraints if needed for notes
  notes?: string;
}
