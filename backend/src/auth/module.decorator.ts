import { SetMetadata } from '@nestjs/common';

export const MODULES_KEY = 'required_modules';

/**
 * Require one or more universal ERP modules to be enabled for the tenant.
 * Example: @RequireModule('STUDENTS', 'EDUCATION')
 */
export const RequireModule = (...modules: string[]) => SetMetadata(MODULES_KEY, modules);
