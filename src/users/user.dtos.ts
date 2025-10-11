import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
}

export class CreatePostBody {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
}

export class UpdatePostBody {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
}
