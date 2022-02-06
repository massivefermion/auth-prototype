import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { BROKER_PROVIDER_NAME } from './moleculer/moleculer.constants';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(BROKER_PROVIDER_NAME) private readonly broker: ServiceBroker,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const abilities = this.reflector.get<{ action: string; subject: string }[]>(
      'abilities',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const {
      headers: { authorization },
    } = request;
    if (!authorization) return false;

    const [_, token] = authorization.split(' ');

    const { userId, allowed } = await this.broker.call('auth.checkAbility', {
      token,
      abilities,
    });

    request.user = { id: userId };
    return allowed;
  }
}
