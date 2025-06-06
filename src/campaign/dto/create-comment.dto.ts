import { IsString, IsMongoId, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text: string;

  @IsMongoId()
  author: string; // Investor ID
}
