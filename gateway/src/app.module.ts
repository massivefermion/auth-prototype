import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoleculerModule } from './moleculer/moleculer.module';

@Module({
  imports: [
    MoleculerModule.forRoot({
      brokerOptions: { transporter: 'redis://localhost' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
