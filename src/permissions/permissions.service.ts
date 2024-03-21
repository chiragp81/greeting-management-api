import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { DUPLICATE_ENTITY } from '../core/constants/general.constants';
import { MESSAGES } from '../core/constants/messages';
import { PermissionDto } from './dto/permission.dto';
import { Permission, PermissionDocument } from './schema/permissions.schema';

@Injectable()
export class PermissionsService {

    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>
    ) { }

    async getPermissions() {
        try {
            const permissionList = await this.permissionModel.find();

            return {
                data: permissionList,
                message: MESSAGES.PERMISSION_FETCHED_SUCCESSFUL,
                error: [],
                status: true
            }
        } catch (err) {
            throw new HttpException({
                error: err.error,
                message: err.message,
                status: false,
            }, err.status)
        }
    }

    async savePermission(createPermissionDto: PermissionDto) {
        try {
            const newPermission = new this.permissionModel(createPermissionDto);
            const permission = await newPermission.save();
            return {
                data: permission,
                message: MESSAGES.PERMISSION_CREATED_SUCCESSFUL,
                error: [],
                status: true
            }
        } catch (err) {
            if (err instanceof MongoError && err.code === DUPLICATE_ENTITY) {
                throw new BadRequestException(MESSAGES.PERMISSION_ALREADY_EXIST);
            }
            throw new HttpException({
                error: err.error,
                message: err.message,
                status: false,
            }, err.status)
        }
    }

    async getPermission(permissionId: mongoose.Types.ObjectId) {
        try {
            const permission = await this.permissionModel.findOne({ _id: new Types.ObjectId(permissionId) });
            if (!permission) {
                throw new BadRequestException(MESSAGES.PERMISSION_DOES_NOT_EXIST);
            }
            return {
                data: permission,
                error: [],
                message: MESSAGES.PERMISSION_FETCHED_SUCCESSFUL,
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

    async updatePermission(permissionId: mongoose.Types.ObjectId, updateRole: PermissionDto) {
        try {
            const permission = await this.permissionModel.findOne({ _id: new Types.ObjectId(permissionId) });
            if (!permission) {
                throw new BadRequestException(MESSAGES.PERMISSION_DOES_NOT_EXIST);
            }

            const updatedPermission = await this.permissionModel.findByIdAndUpdate(
                permissionId,
                updateRole,
                { new: true },
            ).exec();

            return {
                data: updatedPermission,
                message: MESSAGES.PERMISSION_UPDATED_SUCCESSFUL,
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

    async deletePermission(permissionId: mongoose.Types.ObjectId) {
        try {
            const role = await this.permissionModel.findOne({ _id: new Types.ObjectId(permissionId) });
            if (!role) {
                throw new BadRequestException(MESSAGES.PERMISSION_DOES_NOT_EXIST);
            }
            await this.permissionModel.findByIdAndDelete(permissionId).exec();

            return {
                data: null,
                message: MESSAGES.PERMISSION_DELETED_SUCCESSFUL,
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

}
