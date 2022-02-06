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
@Entity({ name: 'subjects' })
export class Subject extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToMany(() => Access, access => access.subject)
  accesses: Access[]
}
