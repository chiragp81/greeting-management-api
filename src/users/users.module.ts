import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { RolesService } from 'src/roles/roles.service';
import { RoleSchema } from 'src/roles/schema/roles.schema';
import { AuthService } from '../auth/auth.service';
import { MailModule } from './../shared/mail/mail.module';
import { UserSchema } from './models/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'Role', schema: RoleSchema }]),
		MailModule
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		AuthService,
		JwtService,
		RolesService
	],
	exports: [UsersService],
})
export class UsersModule { }
