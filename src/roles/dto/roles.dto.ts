import { IsArray, IsBooleanString, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsMongoId({ each: true })
    permissions: string[];

    @IsBooleanString()
    @IsOptional()
    isActive: boolean;

    @IsBooleanString()
    @IsOptional()
    isDeleted: boolean;
}