import 'server-only';
 
import { cookies } from 'next/headers';
import {cache} from 'react';
 
export type User = {
    userId: number,
    username: string,
}

/**
 * Gets user data from current session (from token cookie)
 * 
 * TODO: implement actual logic (currently just placeholder return value)
 * @returns `userId` and `username` or `undefined` if there's no valid and active session token
 */
export const getSession = cache(async (): Promise<User | null> => {
    const cookie = (await cookies()).get('token')?.value;
    console.log('token:', cookie);
    if (cookie) {
        return { userId: 42, username: 'john_42' };
    } else {
        return null;
    }
});