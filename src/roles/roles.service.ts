import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { MESSAGES } from 'src/core/constants/messages';
import { GetUserDto, SortBy } from 'src/users/dto/get-user.dto';
import { CreateRoleDto } from './dto/roles.dto';
import { Role, RoleDocument } from './schema/roles.schema';

@Injectable()
export class RolesService {

    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>
    ) { }

    async getRoles(query: GetUserDto) {
        try {
            if (query.isDropdown) {
                const roleList = await this.roleModel.find({}).lean();
                return {
                    data: roleList.length ? roleList : [],
                    message: MESSAGES.ROLE_FETCHED_SUCCESSFUL,
                    status: true,
                    error: []
                }
            } else {
                const skip = (query.page - 1) * query.limit || 0;
                const limit = query.limit || 10;
                const sortBy = query.sortBy || 'createdAt';
                const sortValue = query.sortValue === SortBy.ASC ? 1 : -1;

                let searchObject;
                if (query.searchText) {
                    searchObject = {
                        name: { $regex: query.searchText, $options: 'i' }
                    };
                } else {
                    searchObject = {
                        isActive: true,
                        isDeleted: false
                    }
                }

                const data = await this.roleModel.find(searchObject)
                    .sort({ [sortBy]: sortValue })
                    .skip(skip)
                    .limit(limit)
                    .lean()
                const total = await this.roleModel.find().countDocuments();

                return {
                    data: {
                        list: data.length ? data : [],
                        total: data.length ? total : 0
                    },
                    message: MESSAGES.ROLE_FETCHED_SUCCESSFUL,
                    status: true,
                    error: []
                }
            }
        } catch (err) {
            throw new HttpException({
                status: false,
                message: err.message,
                error: err.error,
            }, err.status)
        }
    }

    async saveRoles(createRole: CreateRoleDto) {
        try {
            const newRole = new this.roleModel(createRole);
            const roleList = await newRole.save();
            return {
                data: roleList,
                error: [],
                message: MESSAGES.ROLE_CREATED_SUCCESSFUL,
                status: true
            }
        } catch (err) {
            throw new HttpException({
                status: false,
                message: err.message,
                error: err.error,
            }, err.status)
        }
    }

    async getRole(roleId: mongoose.Types.ObjectId) {
        try {
            const role = await this.roleModel.findOne({ _id: roleId })
                .populate({
                    path: 'permissions',
                    model: 'Permission',
                    select: 'name -_id',
                })
                .lean()
                .exec();
            role.permissions = role.permissions.map(item => item.name);
            if (!role) {
                throw new BadRequestException(MESSAGES.ROLE_DOES_NOT_EXIST);
            }
            return {
                data: role,
                error: [],
                message: MESSAGES.ROLE_FETCHED_SUCCESSFUL,
                status: true
            }
        } catch (err) {
            throw new HttpException({
                status: false,
                message: err.message,
                error: err.error,
            }, err.status)
        }
    }

    async updateRole(roleId: mongoose.Types.ObjectId, updateRole: CreateRoleDto) {
        try {
            const role = await this.roleModel.findOne({ _id: new Types.ObjectId(roleId) });
            if (!role) {
                throw new BadRequestException(MESSAGES.ROLE_DOES_NOT_EXIST);
            }

            const updatedRole = await this.roleModel.findByIdAndUpdate(
                roleId,
                updateRole,
                { new: true },
            ).exec();

            return {
                data: updatedRole,
                message: MESSAGES.ROLE_UPDATED_SUCCESSFUL,
                error: [],
                status: true
            }
        } catch (err) {
            throw new HttpException({
                status: false,
                message: err.message,
                error: err.error,
            }, err.status)
        }
    }

    async deleteRole(roleId: mongoose.Types.ObjectId) {
        try {
            const role = await this.roleModel.findOne({ _id: new Types.ObjectId(roleId) });
            if (!role) {
                throw new BadRequestException(MESSAGES.ROLE_DOES_NOT_EXIST);
            }
            await this.roleModel.findByIdAndDelete(roleId).exec();

            return {
                data: null,
                message: MESSAGES.ROLE_DELETED_SUCCESSFUL,
                error: [],
                status: true
            }
        } catch (err) {
            throw new HttpException({
                status: false,
                message: err.message,
                error: err.error,
            }, err.status)
        }
    }

    async getRoleByName(name: string) {
        const role = await this.roleModel.findOne({ name })
            .populate({
                path: 'permissions',
                model: 'Permission',
                select: 'name -_id',
            })
            .lean()
            .exec();
        return role;
    }
}

