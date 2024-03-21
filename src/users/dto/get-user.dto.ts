import { IsBooleanString, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";
import { Role } from "../../auth/enum/role.enum";

export enum SortBy {
    ASC = 'asc',
    DEC = 'desc',
}

export enum SortFields {
    FIRST_NAME = 'firstName',
    CREATED_AT = 'createdAt',
}

export class GetUserDto {

    @IsNumberString()
    @IsOptional()
    page: number;

    @IsNumberString()
    @IsOptional()
    limit: number;

    @IsEnum(Role)
    @IsOptional()
    role: string;

    @IsString()
    @IsEnum(SortBy)
    @IsOptional()
    sortValue: string;

    @IsString()
    @IsEnum(SortFields)
    @IsOptional()
    sortBy: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    searchText: string;

    @IsOptional()
    @IsBooleanString()
    isActive: boolean;

    @IsOptional()
    @IsBooleanString()
    isDropdown: boolean;
}