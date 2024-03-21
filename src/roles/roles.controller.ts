import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import mongoose from 'mongoose';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { GetUserDto } from 'src/users/dto/get-user.dto';
import { CreateRoleDto } from './dto/roles.dto';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(Role.ADMIN)
export class RolesController {

    constructor(
        private roleService: RolesService
    ) { }

    @Get()
    async getRoles(@Query() query: GetUserDto) {
        return this.roleService.getRoles(query);
    }

    @Post()
    async saveRoles(@Body() createRole: CreateRoleDto) {
        return this.roleService.saveRoles(createRole);
    }

    @Get(':id')
    async getRole(@Param('id') id: mongoose.Types.ObjectId) {
        return this.roleService.getRole(id);
    }

    @Put(':id')
    async updateRole(@Param('id') id: mongoose.Types.ObjectId, @Body() updateRole: CreateRoleDto) {
        return this.roleService.updateRole(id, updateRole)
    }

    @Delete(':id')
    async deleteRole(@Param('id') id: mongoose.Types.ObjectId) {
        return this.roleService.deleteRole(id);
    }
}
