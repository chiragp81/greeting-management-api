import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { VALIDATION_MESSAGES } from "src/core/constants/messages";

@Schema({ timestamps: true, collection: 'permissions' })
export class Permission {
    _id: Types.ObjectId;

    @Prop({
        type: SchemaTypes.String,
        required: [true, VALIDATION_MESSAGES.PERMISSION_REQUIRED],
        unique: [true, VALIDATION_MESSAGES.PERMISSION_SHOULD_BE_UNIQUE]
    })
    name: string;

    @Prop({ type: SchemaTypes.Boolean, default: true })
    isActive: boolean;

    @Prop({ type: SchemaTypes.Boolean, default: false })
    isDeleted: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
export type PermissionDocument = HydratedDocument<Permission>;