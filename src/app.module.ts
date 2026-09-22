import { Module } from '@nestjs/common'; // Modul
import { APP_GUARD } from '@nestjs/core'; // Global guard
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'; // Chastota cheklovi
import { PrismaModule } from './config/database/prisma.module'; // Baza
import { AuthModule } from './modules/auth/auth.module'; // Auth
import { UserModule } from './modules/user/user.module'; // Foydalanuvchilar
import { AuthGuard } from './common/guard/jwt-auth.guard'; // Global auth guard
import { RolesGuard } from './common/guard/roles.guard'; // Global rol guard
import { GroupsModule } from './modules/groups/groups.module';

@Module({
  imports: [
    PrismaModule, // Baza (global)
    // Throttler — umumiy limit yuqori, login/refresh da @Throttle bilan pasaytiriladi
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
      errorMessage: "Juda ko'p so'rov. Birozdan keyin urinib ko'ring",
    }),
    AuthModule, // Auth
    UserModule, // Foydalanuvchilar
    GroupsModule,
  ],
  providers: [
    // Global guardlar — TARTIB MUHIM (TZ 4.5): Throttler → Auth → Roles
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
