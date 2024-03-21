import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission, PermissionSchema } from './schema/permissions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Permission.name,
        schema: PermissionSchema
      }
    ]),
    UsersModule,
    RolesModule
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, AuthService]
})
export class PermissionsModule { }
