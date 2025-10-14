import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedDatabaseCorrect1760471660527 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = [
      {
        id: 'uuid1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      {
        id: 'uuid2',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      },
      {
        id: 'uuid3',
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike@example.com',
      },
      {
        id: 'uuid4',
        firstName: 'Anna',
        lastName: 'Taylor',
        email: 'anna@example.com',
      },
      {
        id: 'uuid5',
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bob@example.com',
      },
      {
        id: 'uuid6',
        firstName: 'Alice',
        lastName: 'White',
        email: 'alice@example.com',
      },
      {
        id: 'uuid7',
        firstName: 'Tom',
        lastName: 'Black',
        email: 'tom@example.com',
      },
      {
        id: 'uuid8',
        firstName: 'Mary',
        lastName: 'Green',
        email: 'mary@example.com',
      },
      {
        id: 'uuid9',
        firstName: 'Peter',
        lastName: 'Gray',
        email: 'peter@example.com',
      },
      {
        id: 'uuid10',
        firstName: 'Lucy',
        lastName: 'Blue',
        email: 'lucy@example.com',
      },
    ];

    for (const user of users) {
      const passwordHash = await bcrypt.hash(
        user.firstName.toLowerCase() + '123',
        12,
      );
      await queryRunner.query(`
          INSERT INTO users (id, firstName, lastName, email, passwordHash)
          VALUES ('${user.id}', '${user.firstName}', '${user.lastName}', '${user.email}', '${passwordHash}');
        `);
    }

    // --- POSTS ---
    const posts = [
      {
        id: 'post1',
        authorId: 'uuid1',
        title: 'My First Day at Work',
        description: 'Excited to start a new chapter in my career!',
      },
      {
        id: 'post2',
        authorId: 'uuid3',
        title: 'Learning TypeScript',
        description: 'TypeScript makes JavaScript development so much safer.',
      },
      {
        id: 'post3',
        authorId: 'uuid2',
        title: 'Weekend Getaway',
        description: 'Spent an amazing weekend in the mountains!',
      },
      {
        id: 'post4',
        authorId: 'uuid1',
        title: 'Coffee Experiment',
        description: 'Tried making my own cold brew at home, turned out great!',
      },
      {
        id: 'post5',
        authorId: 'uuid5',
        title: 'Morning Jog',
        description: 'A refreshing run to start the day.',
      },
      {
        id: 'post6',
        authorId: 'uuid3',
        title: 'JavaScript Tips',
        description: 'Shared some useful JS tips with my study group.',
      },
      {
        id: 'post7',
        authorId: 'uuid7',
        title: 'Movie Night',
        description: 'Watched an incredible movie with friends.',
      },
      {
        id: 'post8',
        authorId: 'uuid4',
        title: 'Cooking Adventures',
        description: 'Tried a new recipe today and it turned out delicious!',
      },
      {
        id: 'post9',
        authorId: 'uuid6',
        title: 'Book Recommendations',
        description: 'Just finished a fantastic book, highly recommend it!',
      },
      {
        id: 'post10',
        authorId: 'uuid2',
        title: 'Cycling Challenge',
        description: 'Completed a 50km cycling route today!',
      },
      {
        id: 'post11',
        authorId: 'uuid8',
        title: 'Gardening Tips',
        description:
          'Planted some new flowers today. Gardening is therapeutic.',
      },
      {
        id: 'post12',
        authorId: 'uuid1',
        title: 'Yoga Session',
        description: 'Feeling relaxed after a morning yoga session.',
      },
      {
        id: 'post13',
        authorId: 'uuid9',
        title: 'Tech Conference',
        description: 'Attended an insightful tech conference, learned a lot.',
      },
      {
        id: 'post14',
        authorId: 'uuid10',
        title: 'Art Exhibition',
        description: 'Visited a local art exhibition, very inspiring!',
      },
      {
        id: 'post15',
        authorId: 'uuid5',
        title: 'DIY Project',
        description: 'Built a small bookshelf by myself, proud of it!',
      },
      {
        id: 'post16',
        authorId: 'uuid7',
        title: 'Music Playlist',
        description: 'Created a playlist for relaxing evenings.',
      },
      {
        id: 'post17',
        authorId: 'uuid3',
        title: 'Photography Fun',
        description: 'Captured some stunning sunset photos.',
      },
      {
        id: 'post18',
        authorId: 'uuid6',
        title: 'Travel Planning',
        description: 'Planning a trip to Italy next summer!',
      },
      {
        id: 'post19',
        authorId: 'uuid2',
        title: 'Gaming Marathon',
        description: 'Played my favorite game for hours, so fun!',
      },
      {
        id: 'post20',
        authorId: 'uuid4',
        title: 'Volunteer Work',
        description: 'Spent the day helping at a local shelter.',
      },
    ];

    for (const post of posts) {
      await queryRunner.query(`
          INSERT INTO posts (id, authorId, title, description)
          VALUES ('${post.id}', '${post.authorId}', '${post.title}', '${post.description}');
        `);
    }

    // --- LIKES ---
    const likes = [
      { id: 'like1', userId: 'uuid2', postId: 'post1' },
      { id: 'like2', userId: 'uuid3', postId: 'post1' },
      { id: 'like3', userId: 'uuid1', postId: 'post2' },
      { id: 'like4', userId: 'uuid5', postId: 'post3' },
      { id: 'like5', userId: 'uuid6', postId: 'post4' },
      { id: 'like6', userId: 'uuid2', postId: 'post5' },
      { id: 'like7', userId: 'uuid4', postId: 'post5' },
      { id: 'like8', userId: 'uuid7', postId: 'post6' },
      { id: 'like9', userId: 'uuid3', postId: 'post7' },
      { id: 'like10', userId: 'uuid8', postId: 'post8' },
      { id: 'like11', userId: 'uuid1', postId: 'post9' },
      { id: 'like12', userId: 'uuid5', postId: 'post10' },
      { id: 'like13', userId: 'uuid6', postId: 'post11' },
      { id: 'like14', userId: 'uuid2', postId: 'post12' },
      { id: 'like15', userId: 'uuid9', postId: 'post13' },
      { id: 'like16', userId: 'uuid4', postId: 'post14' },
      { id: 'like17', userId: 'uuid3', postId: 'post15' },
      { id: 'like18', userId: 'uuid1', postId: 'post16' },
      { id: 'like19', userId: 'uuid10', postId: 'post17' },
      { id: 'like20', userId: 'uuid7', postId: 'post18' },
    ];

    for (const like of likes) {
      await queryRunner.query(`
          INSERT INTO likes (id, userId, postId)
          VALUES ('${like.id}', '${like.userId}', '${like.postId}');
        `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
  DELETE FROM likes WHERE id IN (
    'like1','like2','like3','like4','like5','like6','like7','like8','like9','like10',
    'like11','like12','like13','like14','like15','like16','like17','like18','like19','like20'
  );
`);

    await queryRunner.query(`
  DELETE FROM posts WHERE id IN (
    'post1','post2','post3','post4','post5','post6','post7','post8','post9','post10',
    'post11','post12','post13','post14','post15','post16','post17','post18','post19','post20'
  );
`);

    await queryRunner.query(`
    DELETE FROM users WHERE id IN (
      'uuid1','uuid2','uuid3','uuid4','uuid5','uuid6','uuid7','uuid8','uuid9','uuid10'
    );
  `);
  }
}
