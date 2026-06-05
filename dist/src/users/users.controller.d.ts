import type { CurrentUser } from '../common/types/current-user';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    getMe(user: CurrentUser): Promise<{
        id: string;
        username: string | null;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMe(user: CurrentUser, dto: UpdateProfileDto): Promise<{
        id: string;
        username: string | null;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    search(user: CurrentUser, query?: string): Promise<{
        id: string;
        username: string | null;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
