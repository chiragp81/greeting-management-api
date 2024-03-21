import { IsBooleanString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PermissionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBooleanString()
    @IsOptional()
    isActive: boolean;

    @IsBooleanString()
    @IsOptional()
    isDeleted: boolean;
}