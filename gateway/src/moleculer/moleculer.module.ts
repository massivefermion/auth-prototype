import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerModuleAsyncOptions,
  MoleculerModuleOptions,
  MoleculerOptionsFactory,
} from './moleculer-options.interface';
import {
  BROKER_PROVIDER_NAME,
  MOLECULER_MODULE_OPTIONS,
} from './moleculer.constants';

@Module({})
export class MoleculerModule {
  static forRoot(options: MoleculerModuleOptions): DynamicModule {
    const moleculerModuleOptions = {
      provide: MOLECULER_MODULE_OPTIONS,
      useValue: options,
    };
    const brokerProvider = {
      provide: BROKER_PROVIDER_NAME,
      useFactory: async () => {
        const broker = new ServiceBroker(options.brokerOptions);
        await broker.start();
        return broker;
      },
    };

    return {
      module: MoleculerModule,
      providers: [brokerProvider, moleculerModuleOptions],
      exports: [brokerProvider],
    };
  }

  static forRootAsync(options: MoleculerModuleAsyncOptions): DynamicModule {
    const brokerProvider: Provider = {
      provide: BROKER_PROVIDER_NAME,
      useFactory: async (moleculerOptions: MoleculerModuleOptions) => {
        const broker = new ServiceBroker(moleculerOptions.brokerOptions);
        await broker.start();
        return broker;
      },
      inject: [MOLECULER_MODULE_OPTIONS],
    };
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: MoleculerModule,
      imports: options.imports,
      providers: [...asyncProviders, brokerProvider],
      exports: [brokerProvider],
    };
  }

  private static createAsyncProviders(
    options: MoleculerModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<MoleculerOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: MoleculerModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MOLECULER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<MoleculerOptionsFactory>,
    ];
    return {
      provide: MOLECULER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MoleculerOptionsFactory) =>
        await optionsFactory.createMoleculerOptions(),
      inject,
    };
  }
}
