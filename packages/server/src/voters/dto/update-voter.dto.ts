import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class UpdateVoterDto {
  @IsOptional()
  @IsString()
  @Length(1, 255) // Example: Enforce a reasonable length for name
  name?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  // Add @Length or other constraints if needed for notes
  notes?: string;
}
