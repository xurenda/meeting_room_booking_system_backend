import { Body, Controller, DefaultValuePipe, Get, HttpStatus, Post, Query } from '@nestjs/common'
import { UserService } from './user.service'
import RegisterUserDto from './dto/register-user.dto'
import LoginUserDto from './dto/login-user.dto'
import UserInfo, { TUserInfo } from 'src/decorators/user-info.decorator'
import RequireLogin from 'src/decorators/require-login.decorator'
import UpdateUserPasswordDto from './dto/update-user-password.dto'
import UpdateUserDto from './dto/update-user.dto'
import RequirePermissions from 'src/decorators/require-permissions.decorator'
import generateParseIntPipe from 'src/utils/generateParseIntPipe'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import UserWithTokensVo from './vo/user-with-tokens.vo'
import TokensVo from './vo/tokens.vo'
import UserInfoVo from './vo/user-info.vo'
import userListVo from './vo/user-list.vo'

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码错误/验证码已失效/用户名已存在',
    type: String,
  })
  @Post('register')
  async register(@Body() user: RegisterUserDto) {
    return await this.userService.register(user)
  }

  @ApiOperation({ summary: '发送注册验证码' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱',
    required: true,
    example: 'xxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('register/captcha')
  async registerCaptcha(@Query('email') email: string) {
    await this.userService.sendCaptcha(email, '注册验证码')
    return '发送成功'
  }

  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和令牌',
    type: UserWithTokensVo,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户名或密码错误',
    type: String,
  })
  @Post('login')
  async login(@Body() user: LoginUserDto) {
    const userVo = await this.userService.login(user)
    return userVo
  }

  @ApiOperation({ summary: '刷新令牌', description: '使用refresh_token，刷新access_token' })
  @ApiQuery({
    name: 'token',
    type: String,
    description: '刷新令牌',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: TokensVo,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '无效的令牌/过期的令牌',
    type: String,
  })
  @Get('refresh-token')
  async refresh_token(@Query('token') token: string) {
    return await this.userService.refreshToken(token)
  }

  @ApiOperation({ summary: '获取用户信息' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息',
    type: UserInfoVo,
  })
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('id') id: TUserInfo['id']) {
    return await this.userService.info(id)
  }

  @ApiOperation({ summary: '修改用户密码' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '修改密码',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码错误/验证码已失效',
    type: String,
  })
  @Post('update-password')
  @RequireLogin()
  async updatePassword(@UserInfo('id') id: TUserInfo['id'], @Body() data: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(id, data)
  }

  @ApiOperation({ summary: '发送修改密码验证码' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱',
    required: true,
    example: 'xxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('update-password/captcha')
  @RequireLogin()
  async updatePasswordCaptcha(@Query('email') email: string) {
    await this.userService.sendCaptcha(email, '修改密码验证码')
    return '发送成功'
  }

  @ApiOperation({ summary: '发送修改邮箱验证码' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱',
    required: true,
    example: 'xxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('update-email/captcha')
  @RequireLogin()
  async updateEmailCaptcha(@Query('email') email: string) {
    await this.userService.sendCaptcha(email, '修改邮箱验证码')
    return '发送成功'
  }

  @ApiOperation({ summary: '修改用户信息' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '修改成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码错误/验证码已失效',
    type: String,
  })
  @Post('update')
  @RequireLogin()
  async update(@UserInfo('id') id: TUserInfo['id'], @Body() user: UpdateUserDto) {
    return await this.userService.update(id, user)
  }

  @ApiOperation({ summary: '冻结用户' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    type: Number,
    description: '要冻结用户的id',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '冻结成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '权限不足',
    type: String,
  })
  @Get('freeze')
  @RequireLogin()
  @RequirePermissions('user/freeze')
  async freeze(@Query('id') id: number) {
    await this.userService.freezeUserById(id)
    return '冻结成功'
  }

  @ApiOperation({ summary: '获取用户列表' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'username',
    type: String,
    description: '用户名',
    required: false,
  })
  @ApiQuery({
    name: 'nickName',
    type: String,
    description: '昵称',
    required: false,
  })
  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱',
    required: false,
  })
  @ApiQuery({
    name: 'pageNo',
    type: Number,
    description: '页码',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: '每页条数',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: userListVo,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '权限不足',
    type: String,
  })
  @Get('list')
  @RequireLogin()
  @RequirePermissions('user/list')
  async list(
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(10), generateParseIntPipe('pageSize')) pageSize: number,
  ) {
    return await this.userService.findUsersByPage(pageNo, pageSize, username, nickName, email)
  }

  @ApiOperation({ summary: '初始化用户（勿用）', deprecated: true })
  @Get('init')
  async init() {
    await this.userService.init()
    return 'done'
  }
}
