import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVoterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty.' })
  name: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message:
        'Please provide a valid email address if you choose to enter one.',
    },
  )
  email?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
