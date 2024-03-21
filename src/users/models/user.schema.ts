import * as argon from 'argon2';
import mongoose, { Schema as MongooseSchema } from 'mongoose';

import { Role } from "../../auth/enum/role.enum";
import { User } from '../types/user';

export const UserSchema: MongooseSchema<User> = new MongooseSchema<User>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpiration: {
        type: Date,
        default: null,
    },
    role: {
        type: String,
        default: Role.USER
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

UserSchema.pre('save', async function (next: any) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        this.password = await argon.hash(this.password);

        return next();
    } catch (err) {
        return next(err);
    }
});

export const UserModel = mongoose.model<User>('User', UserSchema);
