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

@Unique(['name'])
@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToMany(() => Access)
  @JoinTable()
  accesses: Access[]
}
