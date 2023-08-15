import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Like, Repository } from 'typeorm'
import User from './entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import RegisterUserDto from './dto/register-user.dto'
import { RedisService } from 'src/redis/redis.service'
import { md5 } from 'src/utils/md5'
import { EmailService } from 'src/email/email.service'
import Role from './entities/role.entity'
import Permission from './entities/permission.entity'
import LoginUserDto from './dto/login-user.dto'
import UserWithTokensVo from './vo/user-with-tokens.vo'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JwtAccessToken, JwtRefreshToken } from 'src/guards/login.guard'
import UserInfoVo from './vo/user-info'
import UpdateUserPasswordDto from './dto/update-user-password.dto'
import UpdateUserDto from './dto/update-user.dto'
import TokensVo from './vo/tokens.vo'
import UserListVo from './vo/user-list.vo'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>

  @Inject(RedisService)
  private readonly redisService: RedisService

  @Inject(EmailService)
  private readonly emailService: EmailService

  @Inject(JwtService)
  private readonly jwtService: JwtService

  @Inject(ConfigService)
  private readonly configService: ConfigService

  async register(user: RegisterUserDto) {
    await this.validateEmailCaptcha(user.email, user.captcha)

    const foundUser = await this.userRepository.findOneBy({ username: user.username })

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST)
    }

    const newUser = new User()
    newUser.username = user.username
    newUser.nickName = user.nickName
    newUser.email = user.email
    newUser.password = md5(user.password)

    try {
      await this.userRepository.save(newUser)
      return '注册成功'
    } catch (e) {
      this.logger.error('注册失败', e)
      return '注册失败'
    }
  }

  async login(user: LoginUserDto) {
    const foundUser = await this.userRepository.findOne({
      where: { username: user.username },
      relations: ['roles', 'roles.permissions'],
    })

    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)
    }

    if (md5(user.password) !== foundUser.password) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST)
    }

    const userWithTokensVo = this.generateUserWithTokensVo(foundUser)

    return userWithTokensVo
  }

  async refreshToken(token: string) {
    let tokenInfo: JwtRefreshToken
    try {
      tokenInfo = this.jwtService.verify(token)
    } catch (e) {
      throw new HttpException('token已过期', HttpStatus.BAD_REQUEST)
    }

    if (!tokenInfo?.i) {
      throw new HttpException('token已过期', HttpStatus.BAD_REQUEST)
    }

    const foundUser = await this.userRepository.findOne({
      where: { id: tokenInfo.i },
      relations: ['roles', 'roles.permissions'],
    })

    const userWithTokensVo = this.generateUserWithTokensVo(foundUser)
    const tokensVo = new TokensVo()
    tokensVo.accessToken = userWithTokensVo.accessToken
    tokensVo.refreshToken = userWithTokensVo.refreshToken

    return tokensVo
  }

  async info(id: number) {
    const foundUser = await this.findUserById(id)

    const userInfoVo = new UserInfoVo()
    userInfoVo.id = foundUser.id
    userInfoVo.username = foundUser.username
    userInfoVo.nickName = foundUser.nickName
    userInfoVo.email = foundUser.email
    userInfoVo.pic = foundUser.pic
    userInfoVo.phoneNumber = foundUser.phoneNumber
    userInfoVo.isFrozen = foundUser.isFrozen
    userInfoVo.createdAt = foundUser.createdAt
    return userInfoVo
  }

  async updatePassword(id: number, data: UpdateUserPasswordDto) {
    const foundUser = await this.findUserById(id)

    await this.validateEmailCaptcha(foundUser.email, data.captcha)

    foundUser.password = md5(data.password)
    try {
      await this.userRepository.save(foundUser)
      return '密码修改成功'
    } catch (e) {
      this.logger.error('密码修改失败', e)
      return '密码修改失败'
    }
  }

  async update(id: number, user: UpdateUserDto) {
    const foundUser = await this.findUserById(id)

    if (user.email) {
      await this.validateEmailCaptcha(user.email, user.captcha)
      foundUser.email = user.email
    }
    if (user.nickName) {
      foundUser.nickName = user.nickName
    }
    if (user.phoneNumber) {
      foundUser.phoneNumber = user.phoneNumber
    }
    if (user.pic) {
      foundUser.pic = user.pic
    }

    try {
      await this.userRepository.save(foundUser)
      return '修改成功'
    } catch (e) {
      this.logger.error('userInfo修改失败', e)
      return '修改失败'
    }
  }

  async sendCaptcha(email: string, subject: string) {
    const code = Math.random().toString(36).slice(2, 8)

    await this.redisService.set(`captcha_${email}`, code, 5 * 60)

    await this.emailService.send({
      to: email,
      subject,
      html: `<p>你的验证码是: <span style="color:red;font-weight:bold;font-size:20px;">${code}</span></p>`,
    })
  }

  async freezeUserById(id: number) {
    const foundUser = await this.findUserById(id)

    foundUser.isFrozen = true
    await this.userRepository.save(foundUser)
  }

  async findUsersByPage(
    pageNo: number,
    pageSize: number,
    username?: string,
    nickName?: string,
    email?: string,
  ) {
    const skipCount = (pageNo - 1) * pageSize

    const where: Record<string, any> = {}

    if (username) {
      where.username = Like(`%${username}%`)
    }
    if (nickName) {
      where.nickName = Like(`%${nickName}%`)
    }
    if (email) {
      where.email = Like(`%${email}%`)
    }

    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'phoneNumber',
        'isFrozen',
        'pic',
        'createdAt',
      ],
      skip: skipCount,
      take: pageSize,
      where,
    })

    const userListVo = new UserListVo()
    userListVo.users = users
    userListVo.pageNo = pageNo
    userListVo.pageSize = pageSize
    userListVo.totalCount = totalCount
    userListVo.totalPage = Math.ceil(totalCount / pageSize)

    return userListVo
  }

  private async findUserById(id: number) {
    const foundUser = await this.userRepository.findOneBy({
      id,
    })

    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)
    }

    return foundUser
  }

  private generateUserWithTokensVo(user: User) {
    const userVo = new UserWithTokensVo()
    const permissionsMap = new Map<string, number>()
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissionsMap.set(permission.code, permission.id)
      })
    })
    userVo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      pic: user.pic,
      phoneNumber: user.phoneNumber,
      isFrozen: user.isFrozen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map(role => role.name),
      permissions: Object.fromEntries(permissionsMap),
    }

    userVo.accessToken = this.jwtService.sign(
      {
        i: userVo.userInfo.id,
        n: userVo.userInfo.username,
        r: userVo.userInfo.roles,
        p: userVo.userInfo.permissions,
      } as JwtAccessToken,
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    )
    userVo.refreshToken = this.jwtService.sign(
      {
        i: userVo.userInfo.id,
      } as JwtRefreshToken,
      {
        expiresIn: this.configService.get('jwt_refresh_token_expires_time') || '7d',
      },
    )

    return userVo
  }

  private async validateEmailCaptcha(email: string, captcha: string) {
    const _captcha = await this.redisService.get(`captcha_${email}`)

    if (!_captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)
    }

    if (_captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST)
    }
  }

  async init() {
    const user1 = new User()
    user1.username = 'zhangsan'
    user1.password = md5('zhangsan')
    user1.nickName = '张三'
    user1.email = 'zhangsan@qq.com'

    const user2 = new User()
    user2.username = 'lisi'
    user2.password = md5('lisi')
    user2.nickName = '李四'
    user2.email = 'lisi@qq.com'

    const role1 = new Role()
    role1.name = '管理员'

    const role2 = new Role()
    role2.name = '普通用户'

    const list = new Permission()
    list.code = 'user/list'
    list.description = 'user/list'

    const freeze = new Permission()
    freeze.code = 'user/freeze'
    freeze.description = 'user/freeze'

    user1.roles = [role1]
    user2.roles = [role2]
    role1.permissions = [list, freeze]
    role2.permissions = []

    await this.permissionRepository.save([list, freeze])
    await this.roleRepository.save([role1, role2])
    await this.userRepository.save([user1, user2])
  }
}
