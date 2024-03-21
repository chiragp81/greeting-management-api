import { Controller } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { ForgotPasswordDTO } from './../users/dto/forgot-password.dto';
import { RegisterDTO } from './../users/dto/register.dto';
import { ResetPasswordDTO } from './../users/dto/reset-password.dto';
import { VerifyEmailDTO } from './../users/dto/verify-email.dto';
import { UsersService } from './../users/users.service';

import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(
		private usersService: UsersService,
		private authService: AuthService
	) { }

	// sign up
	@Post('register')
	async register(@Body() dto: RegisterDTO) {
		return await this.usersService.createUser(dto);
	}

	// sign in
	// @UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Body() dto: LoginDTO) {
		const user = await this.usersService.getUser(dto);

		const payload = {
			email: user.data.email
		};

		const token = await this.authService.signPayload(payload);
		user.data['token'] = token;
		return user;
	}

	// forgot password
	@Post('forgot-password')
	async forgotPassword(@Body() dto: ForgotPasswordDTO) {
		return await this.usersService.forgotPassword(dto);
	}

	// reset password
	@Post('reset-password')
	async resetPassword(@Body() dto: ResetPasswordDTO) {
		return await this.usersService.resetPassword(dto);
	}

	// verify email
	@Post('verify-email')
	async verifyEmail(@Body() dto: VerifyEmailDTO) {
		return await this.usersService.verifyEmail(dto);
	}
}
