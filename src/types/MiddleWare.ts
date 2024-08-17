import { User } from '@prisma/client';

export interface MiddleWareType {
    user: User | null;
}
