import { Inject, Injectable } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import { BROKER_PROVIDER_NAME } from './moleculer/moleculer.constants';

@Injectable()
export class AppService {
  constructor(
    @Inject(BROKER_PROVIDER_NAME) private readonly broker: ServiceBroker,
  ) {}

  getBook(): string {
    return 'book';
  }

  getMagazine(): string {
    return 'magazine';
  }

  getReport(): string {
    return 'report';
  }

  register(body) {
    return this.broker.call('auth.register', body);
  }

  login(body) {
    return this.broker.call('auth.login', body);
  }
}
