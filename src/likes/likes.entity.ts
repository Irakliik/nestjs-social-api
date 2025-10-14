import { PostModel } from 'src/posts/posts.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn()
  dateCreated: Date;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => PostModel, (post) => post.likes, { onDelete: 'CASCADE' })
  post: PostModel;
}
