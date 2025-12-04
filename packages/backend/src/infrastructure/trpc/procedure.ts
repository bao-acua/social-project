import { procedure } from './trpc';
import { isAuthenticated } from './middleware';


export const publicProcedure = procedure;
export const authenticatedProcedure = procedure.use(isAuthenticated);