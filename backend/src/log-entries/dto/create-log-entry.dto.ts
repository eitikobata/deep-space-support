import { IsString, MinLength, IsUUID } from 'class-validator';

export class CreateLogEntryDto {
  @IsUUID()
  transmissionId: string;

  @IsString()
  @MinLength(1)
  body: string;
}
