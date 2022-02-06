import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { Action } from './Action'
import { Subject } from './Subject'

@Unique(['name'])
@Unique(['action', 'subject'])
@Entity({ name: 'accesses' })
export class Access extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToOne(() => Action, action => action.accesses)
  action: Action

  @ManyToOne(() => Subject, subject => subject.accesses)
  subject: Subject
}
