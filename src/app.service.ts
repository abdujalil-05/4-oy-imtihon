import { NestFactory } from '@nestjs/core'; // Ilova
import { ValidationPipe } from '@nestjs/common'; // Validatsiya
import { NestExpressApplication } from '@nestjs/platform-express'; // Express tipi
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Swagger
import helmet from 'helmet'; // Xavfsizlik sarlavhalari
import { AppModule } from './app.module'; // Asosiy modul
import { env } from './config'; // Sozlamalar
import { AllExceptionsFilter } from './common/filter/all-exception.filter'; // Xato formati

// Ilovani ishga tushiruvchi klass
export class App {
  static async main() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule); // Ilova
    const PORT = env.PORT; // Port
    const url = '/api'; // Global prefiks (TZ 10)

    // Validatsiya: ortiqcha maydon → 400, tiplarni o'girish (TZ 11.6)
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter()); // Xatolar bir xil formatda
    app.use(helmet()); // Xavfsizlik sarlavhalari
    app.enableCors({ origin: '*' }); // Hozircha ochiq; frontend qo'shilganda domen
    app.set('trust proxy', 1); // Nginx ortida haqiqiy IP (TZ 6.3)
    app.setGlobalPrefix(url); // /api/...

    // Swagger — /api/docs, Bearer auth bilan (TZ 10.3)
    const config = new DocumentBuilder()
      .setTitle('Mini ERP — Auth')
      .setDescription('JWT + Guardlar + Qurilmalar moduli')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${url}/docs`, app, documentFactory);

    await app.listen(PORT, () => console.log('Server running on port', PORT)); // Start
  }
}
