import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import {
  IsSemicolonList,
  IsSemicolonListAligned,
  IsSemicolonNumericList,
} from '../../common/validators/semicolon-list.validator';

export class CreateScaleTestDto {
  @IsUUID()
  sectionId!: string;

  @IsString()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsSemicolonNumericList()
  scoreValues!: string;

  @IsString()
  @IsSemicolonList()
  @IsSemicolonListAligned('scoreValues')
  scoreLabels!: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;
}
