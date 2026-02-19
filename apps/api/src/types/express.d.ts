import { AuthUser, SessionData } from './index.js';

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            session?: SessionData;
        }
    }
}
