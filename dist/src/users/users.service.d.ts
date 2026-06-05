import { CurrentUser } from '../common/types/current-user';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly ensuredProfiles;
    constructor(prisma: PrismaService);
    ensureProfile(user: CurrentUser): Promise<{
        id: string;
        username: string | null;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMe(user: CurrentUser): Promise<{
        id: string;
        username: string | null;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    ensureProfileForRequest(user: CurrentUser): Promise<void>;
    updateMe(user: CurrentUser, dto: UpdateProfileDto): Promise<{
        id: string;
        username: string | null;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    search(query: string, currentUserId: string): Promise<{
        id: string;
        username: string | null;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
