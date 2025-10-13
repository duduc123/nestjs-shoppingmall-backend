import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AdminModule } from './module/admin/admin.module';
import { DefaultModule } from './module/default/default.module';
import { ApiModule } from './module/api/api.module';
import { AdminauthMiddleware } from './middleware/adminauth/adminauth.middleware';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AdminModule,
    DefaultModule,
    ApiModule,
    MongooseModule.forRoot('mongodb+srv://duduc123_db_user:Bx4GBVE5cN4podGf@cluster0.uwdzbyu.mongodb.net/shoppingmall?retryWrites=true&w=majority&appName=Cluster0',{useNewUrlParser: true}),
  ],
  controllers: [],
  providers: [],
})
// mongodb+srv://duduc123_db_user:Bx4GBVE5cN4podGf@cluster0.uwdzbyu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminauthMiddleware).forRoutes('admin/*'); // Apply middleware to specific routes
  }
}
