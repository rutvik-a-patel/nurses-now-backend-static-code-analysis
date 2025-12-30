// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

type RoleType = 'admin' | 'facility' | 'provider' | 'facility_user';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);
