import { Module } from '@nestjs/common';
import { SetPasswordTokensRepository } from './set-password-tokens.repository.js';
import { SubscribersRepository } from './subscribers.repository.js';
import { UsersRepository } from './users.repository.js';

@Module({
  providers: [
    UsersRepository,
    SubscribersRepository,
    SetPasswordTokensRepository,
  ],
  exports: [
    UsersRepository,
    SubscribersRepository,
    SetPasswordTokensRepository,
  ],
})
export class UsersModule {}
