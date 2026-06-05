import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(3, 40)
  username?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  displayName?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
