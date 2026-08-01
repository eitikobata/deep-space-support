import { IsIn, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateTransmissionDto {
  @IsOptional()
  @IsIn(['BLUE_ALERT', 'YELLOW_ALERT', 'RED_ALERT'])
  alertLevel?: 'BLUE_ALERT' | 'YELLOW_ALERT' | 'RED_ALERT';

  @IsOptional()
  @IsIn(['ACTIVE', 'UNDER_REVIEW', 'RESOLVED'])
  status?: 'ACTIVE' | 'UNDER_REVIEW' | 'RESOLVED';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];
}
