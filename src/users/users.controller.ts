import { Controller, Get, Param } from '@nestjs/common';
import { Body, Delete, Put, Query, UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import mongoose from 'mongoose';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from "../auth/enum/role.enum";
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  /**
   * Retrieves the user profile for the specified ID.
   * Requires authentication using JWT.
   * @param {string} id - The ID of the user.
   * @returns The user profile obtained from the userService.getUserProfile method.
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async getUserProfile(@Param('id') id: string) {
    return this.userService.getUserProfile(id);
  }

  /**
   * Updates the user information for the specified ID.
   * Requires authentication using JWT.
   * @param {string} id - The ID of the user.
   * @param {UpdateUserDTO} updateUserDto - The data to update the user.
   * @returns The updated user obtained from the userService.updateUser method.
   */
  @Put(':id')
  @Roles(Role.ADMIN, Role.USER)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  /**
   * Deletes the user for the specified ID.
   * Requires authentication using JWT.
   * @param {string} id - The ID of the user.
   * @returns The result of the userService.deleteUser method.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: mongoose.Types.ObjectId) {
    return await this.userService.deleteUser(id);
  }

  @Get()
  @Roles(Role.ADMIN)
  async getUserList(@Query() query: GetUserDto) {
    return await this.userService.getUsers(query);
  }

}
