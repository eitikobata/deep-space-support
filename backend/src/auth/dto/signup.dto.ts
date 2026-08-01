import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(['CREW', 'OFFICER'])
  role: 'CREW' | 'OFFICER';
}
