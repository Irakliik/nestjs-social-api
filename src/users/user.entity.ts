import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PostModel } from 'src/posts/posts.entity';
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
}
