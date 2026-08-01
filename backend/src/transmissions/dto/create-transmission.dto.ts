import { IsString, MinLength, IsOptional, IsEmail } from 'class-validator';

export class CreateTransmissionDto {
  @IsString()
  @MinLength(3)
  subject: string;

  @IsString()
  @MinLength(3)
  description: string;

  @IsOptional()
  @IsEmail()
  notifyEmail?: string;
}
