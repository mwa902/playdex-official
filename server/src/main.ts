import { createApp } from './app-factory';

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 5000);
  await app.listen(port);
  app.enableShutdownHooks();
  console.log(`Playdex API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

void bootstrap();
