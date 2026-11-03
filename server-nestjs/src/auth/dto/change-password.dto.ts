import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { PASSWORD_PATTERN, PASSWORD_REQUIREMENTS } from '../auth.constants.js';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  current_password!: string;

  @IsString()
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_REQUIREMENTS })
  new_password!: string;
}
