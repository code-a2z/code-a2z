import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SetPasswordToken,
  SetPasswordTokenSchema,
} from './schemas/set-password-token.schema.js';
import { User, UserSchema } from './schemas/user.schema.js';
import {
  Subscriber,
  SubscriberSchema,
} from './schemas/subscriber.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Subscriber.name,
        schema: SubscriberSchema,
      },
      {
        name: SetPasswordToken.name,
        schema: SetPasswordTokenSchema,
    },
    ]),
  ],
})
export class UsersModule {}