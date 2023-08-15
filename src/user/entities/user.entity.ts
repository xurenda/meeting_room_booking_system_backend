import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import Role from './role.entity'

@Entity({ name: 'users' })
class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50, comment: '用户名' })
  username: string

  @Column({ length: 50, comment: '密码' })
  password: string

  @Column({ name: 'nick_name', length: 50, comment: '昵称' })
  nickName: string

  @Column({ length: 50, comment: '邮箱' })
  email: string

  @Column({ length: 100, comment: '头像', nullable: true })
  pic: string

  @Column({ name: 'phone_number', length: 20, comment: '手机号', nullable: true })
  phoneNumber: string

  @Column({ name: 'is_frozen', comment: '是否被冻结', default: false })
  isFrozen: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_role' })
  roles: Role[]
}

export default User
