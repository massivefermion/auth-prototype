import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { Access } from './Access'
import { Role } from './Role'

@Unique(['username'])
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  username: string

  @Column()
  password: string

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[]

  @ManyToMany(() => Access)
  @JoinTable()
  accesses: Access[]
}
