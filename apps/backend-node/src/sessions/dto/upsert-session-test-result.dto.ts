import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertSessionTestResultDto {
  @IsOptional()
  @IsNumber()
  scoreValue?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  transcriptText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  audioUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationSec?: number;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'completed', 'skipped'])
  status?: 'pending' | 'completed' | 'skipped';
}
