import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import Permission from './permission.entity'

@Entity({ name: 'roles' })
class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20, comment: '角色名' })
  name: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToMany(() => Permission)
  @JoinTable({ name: 'role_permission' })
  permissions: Permission[]
}

export default Role
