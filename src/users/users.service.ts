import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon from 'argon2';
import { randomBytes } from 'crypto';
import mongoose, { Model, Types } from 'mongoose';

import { Role, RoleDocument } from 'src/roles/schema/roles.schema';
import { LoginDTO } from './../auth/dto/login.dto';
import { PayloadDTO } from './../auth/dto/payload.dto';
import { TOKEN_EXPIRATION_DURATION } from './../core/constants/general.constants';
import { MESSAGES } from './../core/constants/messages';
import { MailService } from './../shared/mail/mail.service';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { GetUserDto, SortBy } from './dto/get-user.dto';
import { RegisterDTO } from './dto/register.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { VerifyEmailDTO } from './dto/verify-email.dto';
import { User } from './types/user';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel('User') private userModel: Model<User>,
		@InjectModel(Role.name) private roleModel: Model<RoleDocument>,
		private mailService: MailService
	) { }

	// create new user
	async createUser(dto: RegisterDTO) {
		try {
			const { email } = dto;
			const user = await this.userModel.findOne({ email }).exec();

			if (user) {
				throw new ConflictException(MESSAGES.USER_EMAIL_ALREADY_EXISTS.replace('{{email}}', email));
			}

			const createdUser = new this.userModel(dto);
			const resetToken = this.generateResetToken();

			createdUser.resetToken = resetToken;

			// send user a welcome mail
			await this.mailService.sendUserConfirmationMail(createdUser, resetToken);

			await createdUser.save();

			return {
				data: this.sanitizeUser(createdUser),
				message: MESSAGES.SIGNUP_SUCCESSFUL,
				code: HttpStatus.CREATED,
				error: ''
			};
		} catch (error) {
			throw new HttpException({
				status: error?.status,
				error: error?.response?.error,
				message: error?.response?.message
			},
				error?.status);
		}
	}

	// update user
	async updateUser(userId: string, updateUserDto: UpdateUserDTO) {
		try {
			const user = await this.userModel.findOne({ _id: new Types.ObjectId(userId) }).exec();

			if (!user) {
				throw new NotFoundException(MESSAGES.USER_DOES_NOT_EXIST);
			}

			const updatedUser = await this.userModel.findByIdAndUpdate(
				userId,
				updateUserDto,
				{ new: true },
			).exec();

			return {
				data: this.sanitizeUser(updatedUser),
				message: MESSAGES.USER_UPDATE_SUCCESSFUL,
				code: HttpStatus.ACCEPTED,
				error: ''
			};
		} catch (error) {
			throw new HttpException({
				status: error?.status,
				error: error?.response?.error,
				message: error?.response?.message
			},
				error?.status);
		}
	}

	// get user
	async getUser(dto: LoginDTO) {
		try {
			const { email, password } = dto;
			const user = await this.userModel.findOne({ email })
				.lean();

			if (!user) {
				throw new NotFoundException(MESSAGES.USER_EMAIL_DOES_NOT_EXIST.replace('{{email}}', email));
			}

			if (!user.isVerified) {
				throw new UnauthorizedException(MESSAGES.VERIFY_YOUR_EMAIL);
			}

			const matchPsw = await argon.verify(user.password, password);

			if (!matchPsw) {
				throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
			}

			const permissions = await this.gerPermissions(user.role);
			const result = {
				...user,
				permissions
			}
			return {
				data: result,
				message: MESSAGES.USER_LOGIN_SUCCESSFUL,
				code: HttpStatus.OK,
				error: ''
			};
		} catch (error) {
			throw new HttpException({
				status: error?.status,
				error: error?.response?.error,
				message: error?.response?.message
			}, error?.status);
		}
	}

	// get user profile
	async getUserProfile(userId: string) {
		try {
			const user = await this.userModel.findOne({ _id: new Types.ObjectId(userId) });

			if (!user) throw new NotFoundException(MESSAGES.USER_DOES_NOT_EXIST);

			return {
				data: this.sanitizeUser(user),
				message: MESSAGES.USER_PROFILE_RECEIVED_SUCCESSFUL,
				code: HttpStatus.OK,
				error: ''
			};

		} catch (error) {
			throw new HttpException({
				status: error?.status,
				error: error?.response?.error,
				message: error?.response?.message
			}, error?.status);
		}
	}

	async deleteUser(id: mongoose.Types.ObjectId) {
		try {
			const user = await this.userModel.findOne({ _id: new Types.ObjectId(id) });

			if (!user) {
				throw new NotFoundException(MESSAGES.USER_DOES_NOT_EXIST);
			}

			const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

			return {
				data: this.sanitizeUser(deletedUser),
				message: MESSAGES.USER_DELETED_SUCCESSFUL,
				code: HttpStatus.ACCEPTED,
				error: ''
			};

		} catch (error) {
			throw new HttpException({
				status: error?.status,
				error: error?.response?.error,
				message: error?.response?.message
			}, error?.status);
		}
	}

	// return user without sensitive information
	sanitizeUser(user: User) {
		const sanitized = user.toObject();

		delete sanitized?.password;
		delete sanitized?.resetToken;
		delete sanitized?.resetTokenExpiration;

		return sanitized;
	}

	// find user by payload
	async findByPayload(payload: PayloadDTO) {
		const { email } = payload;
		return await this.userModel.findOne({ email });
	}

	// find user by email, then add reset token, and send mail
	async forgotPassword(fpPayload: ForgotPasswordDTO) {
		try {
			const { email } = fpPayload;
			const user = await this.userModel.findOne({ email });

			if (!user) {
				throw new NotFoundException(MESSAGES.USER_EMAIL_DOES_NOT_EXIST.replace('{{email}}', email));
			}

			if (!user.isVerified) {
				throw new UnauthorizedException(MESSAGES.VERIFY_YOUR_EMAIL);
			}

			const resetToken = this.generateResetToken();
			const resetTokenExpiration = new Date(Date.now() + TOKEN_EXPIRATION_DURATION);

			user.resetToken = resetToken;
			user.resetTokenExpiration = resetTokenExpiration;

			await user.save();

			// send reset password mail
			await this.mailService.sendResetPasswordMail(user, resetToken);

			return {
				message: MESSAGES.PASSWORD_RESET_REQUEST_SENT_SUCCESSFUL,
				code: HttpStatus.OK,
				error: ''
			};

		} catch (error) {
			throw new HttpException({
				status: error?.status,
				error: error?.response?.error,
				message: error?.response?.message
			},
				error?.status);
		}
	}

	// Generate a random password reset token
	generateResetToken(): string {
		const token = randomBytes(32).toString('hex');
		return token;
	}

	// reset password
	async resetPassword(rpPayload: ResetPasswordDTO) {
		try {
			const { resetToken, password } = rpPayload;
			const user = await this.userModel.findOne({ resetToken });

			if (!user) {
				throw new NotFoundException(MESSAGES.USER_DOES_NOT_EXIST);
			}

			const tokenExpired = new Date() > user.resetTokenExpiration;

			if (tokenExpired) {
				user.resetToken = null;
				user.resetTokenExpiration = null;

				user.save();

				throw new NotFoundException(MESSAGES.RESET_TOKEN_EXPIRED_TRY_AGAIN);
			}

			const matchPsw = await argon.verify(user.password, password);

			if (matchPsw) {
				throw new ConflictException(MESSAGES.NEW_PASSWORD_CANNOT_BE_SAME_AS_OLD);
			}

			user.password = password;
			user.resetToken = null;
			user.resetTokenExpiration = null;

			user.save();

			return {
				data: this.sanitizeUser(user),
				message: MESSAGES.PASSWORD_RESET_SUCCESSFUL,
				code: HttpStatus.CREATED,
				error: ''
			};

		} catch (error) {
			throw new HttpException({
				status: error?.status,
				error: error?.response?.error,
				message: error?.response?.message
			},
				error?.status);
		}
	}

	// reset password
	async verifyEmail(rpPayload: VerifyEmailDTO) {
		try {
			const { resetToken } = rpPayload;
			const user = await this.userModel.findOne({ resetToken });

			if (!user) {
				throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
			}

			user.isVerified = true;
			user.resetToken = null;
			user.save();

			return {
				data: {},
				message: MESSAGES.EMAIL_VERIFIED_SUCCESSFUL,
				code: HttpStatus.OK,
				error: ''
			};

		} catch (error) {
			throw new HttpException({
				status: error?.status,
				error: error?.response?.error,
				message: error?.response?.message
			},
				error?.status);
		}
	}


	async getUsers(query: GetUserDto) {
		try {

			const skip = (query.page - 1) * query.limit || 0;
			const limit = query.limit || 10;
			const sortBy = query.sortBy || 'createdAt';
			const sortValue = query.sortValue === SortBy.ASC ? 1 : -1;

			let searchObject;
			if (query.searchText) {
				searchObject = {
					firstName: { $regex: query.searchText, $options: 'i' }
				};
			} else if (query.role) {
				searchObject = {
					role: query.role,
				};
			} else {
				searchObject = {
					isActive: true,
					isDeleted: false
				}
			}

			const data = await this.userModel.find(searchObject)
				.sort({ [sortBy]: sortValue })
				.skip(skip)
				.limit(limit)
				.select('-password -resetToken -resetTokenExpiration -isVerified');
			const total = await this.userModel.find().countDocuments();

			if (!data.length) {
				return {
					status: true,
					statusCode: HttpStatus.OK,
					message: MESSAGES.USER_LIST_FETCHED_SUCCESSFUL,
					data: {
						list: [],
						total: 0
					},
					error: [],
				};
			}
			return {
				status: true,
				statusCode: HttpStatus.OK,
				message: MESSAGES.USER_LIST_FETCHED_SUCCESSFUL,
				data: {
					list: data,
					total
				},
				error: []
			}

		} catch (err) {
			throw new HttpException({
				status: err?.status,
				error: err?.response?.error,
				message: err?.response?.message
			},
				err?.status);
		}
	}

	async gerPermissions(roleName: string) {
		try {
			const role = await this.roleModel.findOne({ name: roleName })
				.populate({
					path: 'permissions',
					model: 'Permission',
					select: 'name -_id',
				})
				.lean()
				.exec();
			role.permissions = role.permissions.map(item => item.name);


			return role.permissions;

		} catch (err) {
			throw new HttpException({
				status: false,
				message: err.message,
				error: err.error,
			}, err.status)
		}
	}
}
