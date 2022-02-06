import { ModuleMetadata, Type } from '@nestjs/common';
import { BrokerOptions } from 'moleculer';

export type MoleculerModuleOptions = {
  brokerOptions: BrokerOptions;
};

export interface MoleculerOptionsFactory {
  createMoleculerOptions(): Promise<MoleculerModuleOptions> | MoleculerModuleOptions;
}

export interface MoleculerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<MoleculerOptionsFactory>;
  useClass?: Type<MoleculerOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MoleculerModuleOptions> | MoleculerModuleOptions;
  inject?: any[];
}
