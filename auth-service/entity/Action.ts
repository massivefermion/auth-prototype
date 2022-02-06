import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { Access } from './Access'

@Unique(['name'])
@Entity({ name: 'actions' })
export class Action extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToMany(() => Access, access => access.action)
  accesses: Access[]
}
