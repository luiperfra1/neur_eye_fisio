import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  scaleId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  patientId!: string;

  @IsOptional()
  @IsString()
  generalComments?: string;
}
