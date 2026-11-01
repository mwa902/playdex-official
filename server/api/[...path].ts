import type { Application, Request, Response } from 'express';
import { createApp } from '../dist/app-factory';

let application: Promise<Application> | undefined;

export default async function handler(
  request: Request,
  response: Response,
): Promise<void> {
  application ??= createApp().then((nestApp) =>
    nestApp.getHttpAdapter().getInstance() as Application,
  );

  const expressApp = await application;
  expressApp(request, response);
}