import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import mongoose from 'mongoose';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enum/role.enum';
import { PermissionDto } from './dto/permission.dto';
import { PermissionsService } from './permissions.service';

@Controller('permission')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(Role.ADMIN)
export class PermissionsController {

    constructor(
        private permissionService: PermissionsService
    ) { }

    @Get()
    async getPermissions() {
        return this.permissionService.getPermissions();
    }

    @Post()
    async savePermission(@Body() permission: PermissionDto) {
        return this.permissionService.savePermission(permission);
    }

    @Get(':id')
    async getPermission(@Param('id') id: mongoose.Types.ObjectId) {
        return this.permissionService.getPermission(id);
    }

    @Put(':id')
    async updatePermission(@Param('id') id: mongoose.Types.ObjectId, @Body() permission: PermissionDto) {
        return this.permissionService.updatePermission(id, permission);
    }

    @Delete(':id')
    async deletePermission(@Param('id') id: mongoose.Types.ObjectId) {
        return this.permissionService.deletePermission(id);
    }
}
