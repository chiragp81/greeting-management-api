import { SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from '../../core/constants/general.constants';
import { Role } from '../enum/role.enum';

export const Roles = (...args: Role[]) => SetMetadata(ROLES_KEY, args);
