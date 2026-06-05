import { IsArray, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @Length(1, 4000)
  content!: string;

  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  mentionUserIds?: string[];
}
