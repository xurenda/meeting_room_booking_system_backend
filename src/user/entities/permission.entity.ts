import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'permissions' })
class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20, comment: '权限代码' })
  code: string

  @Column({ length: 100, comment: '描述' })
  description: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}

export default Permission
