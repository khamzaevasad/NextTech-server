import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV,
      }),
    }),
  ],
  exports: [],
})
export class DatabaseModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    if (connection.readyState === ConnectionStates.connected) {
      console.log(
        `MongoDb connected into ${
          process.env.NODE_ENV === 'production' ? 'production' : 'development'
        } DB`,
      );
    } else {
      console.log('DB is not connected!');
    }
  }
}
