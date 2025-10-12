import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
} from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: false })
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT.UNSIGNED)
  declare id: number;

  @Column
  @AllowNull(false)
  firstName: string;

  @Column
  @AllowNull(false)
  lastName: string;

  @Column
  @AllowNull(false)
  email: string;

  @Column
  @AllowNull(false)
  passwordHash: string;
}
