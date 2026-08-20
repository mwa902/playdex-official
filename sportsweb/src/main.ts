import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
      .setTitle("Sports Management System ")
      .setDescription("### Sport Management Platform\n" +
          "\n" +
          "A modern sport management platform designed to simplify the organization and management of sports events. It allows users to discover, register, and manage sports activities, " +
          "while organizers can create events, manage participants, schedules, venues, and teams from one centralized platform.\n")
      .setVersion("1.0")
      .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('document', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
