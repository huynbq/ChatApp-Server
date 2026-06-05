import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser as CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/types/current-user';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  getMe(@CurrentUserDecorator() user: CurrentUser) {
    return this.users.getMe(user);
  }

  @Patch('me')
  updateMe(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.updateMe(user, dto);
  }

  @Get('search')
  search(
    @CurrentUserDecorator() user: CurrentUser,
    @Query('q') query = '',
  ) {
    return this.users.search(query, user.id);
  }
}
