import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { PostModel } from 'src/posts/posts.entity';
import * as bcrypt from 'bcrypt';
import { Like } from 'src/likes/likes.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @BeforeInsert()
  async hashPassword() {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
}
