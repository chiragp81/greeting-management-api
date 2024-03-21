import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../../core/constants/general.constants';

export const Permissions = (args: string) => SetMetadata(PERMISSIONS_KEY, args);