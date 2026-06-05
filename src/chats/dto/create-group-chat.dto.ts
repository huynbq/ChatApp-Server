import { ArrayNotEmpty, IsArray, IsString, IsUUID, Length } from 'class-validator';

export class CreateGroupChatDto {
  @IsString()
  @Length(1, 80)
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  memberIds!: string[];
}
