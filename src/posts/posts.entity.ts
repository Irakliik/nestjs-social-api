import { Like } from 'src/likes/likes.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('posts')
export class PostModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @CreateDateColumn()
  dateCreated: Date;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];
}
