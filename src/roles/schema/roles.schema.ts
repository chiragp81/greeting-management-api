import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Permission } from "src/permissions/schema/permissions.schema";

@Schema({ timestamps: true, collection: 'roles' })
export class Role {
    _id: Types.ObjectId;

    @Prop({
        type: SchemaTypes.String,
        required: true,
        unique: true
    })
    name: string;

    @Prop({
        type: [SchemaTypes.ObjectId], ref: 'Permission',
        required: true,
    })
    permissions: Permission[] | string[]

    @Prop({ type: SchemaTypes.Boolean, default: true })
    isActive: boolean;

    @Prop({ type: SchemaTypes.Boolean, default: false })
    isDeleted: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
export type RoleDocument = HydratedDocument<Role>;