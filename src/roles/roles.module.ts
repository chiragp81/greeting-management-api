import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { UsersModule } from 'src/users/users.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role, RoleSchema } from './schema/roles.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Role.name,
        schema: RoleSchema
      }
    ]),
    UsersModule
  ],
  providers: [
    RolesService,
    AuthService
  ],
  controllers: [RolesController],
  exports: [RolesService]
})
export class RolesModule { }
