import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { registerHandlebarsHelpers } from './utils/handlebars-helpers';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    })
  );

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  // registerHandlebarsHelpers();

  const viewsPath = join(process.cwd(), 'views');
  const publicPath = join(process.cwd(), 'public');
  console.log('=== VIEWS CONFIGURATION ===');
  console.log('Views path:', viewsPath);
  console.log('Public path:', publicPath);
  console.log('Current directory:', process.cwd());
  // console.log(`[DEBUG] Fastify View Path: ${viewsPath}`);
  // console.log(`[DEBUG] Current working directory: ${process.cwd()}`);

  // Konfigurasi View Engine yang SEDERHANA
  await app.register(require('@fastify/view'), {
    engine: {
      handlebars: require('handlebars'),
    },
    root: viewsPath,
    // layout: 'layouts/main', // COMMENT DULU layout untuk test
    viewExt: 'hbs',
    options: {
      partials: {
        header: 'partials/header',
        footer: 'partials/footer',
      }
    }
  });


  // 1. Konfigurasi Handlebars view engine
  // app.setViewEngine({
  //   engine: {
  //     handlebars: require('handlebars'),
  //   },
  //   root: viewsPath,
  //   layout: 'layouts/main',
  //   viewExt: 'hbs',
  //   options: {
  //     partials: {
  //       header: 'partials/header',
  //       footer: 'partials/footer',
  //       // tambahkan partials lainnya di sini
  //     }
  //   }
  // });

  // 2. Serve static files (PENTING untuk CSS/JS)
  app.useStaticAssets({
    root: join(process.cwd(), 'public'), // Folder 'public' akan berisi file statis Anda
    prefix: '/public/', // Prefix URL untuk mengakses file-file ini
  });

  
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // await app.listen(port, '0.0.0.0');
  // console.log(`Application is running on: ${await app.getUrl()}`);
  
  // Untuk melihat routes di Fastify (opsional)
  await app.init();
  const server = app.getHttpAdapter().getInstance();
  server.ready(() => {
    console.log('Available routes:');
    // console.log(server.printRoutes());
    console.log(server.printRoutes());
  });

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
