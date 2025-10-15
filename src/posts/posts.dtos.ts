import { IsNotEmpty } from 'class-validator';

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

export interface FeedReqQuery {
  page: string;
  limit: string;
  order: 'ASC' | 'DESC';
}
