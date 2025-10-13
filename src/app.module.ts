import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AdminModule } from './module/admin/admin.module';
import { DefaultModule } from './module/default/default.module';
import { ApiModule } from './module/api/api.module';
import { AdminauthMiddleware } from './middleware/adminauth/adminauth.middleware';

@Module({
  imports: [AdminModule, DefaultModule, ApiModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminauthMiddleware).forRoutes('admin/*'); // Apply middleware to specific routes
  }
}
