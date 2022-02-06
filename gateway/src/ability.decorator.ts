import { SetMetadata } from '@nestjs/common';

export const Abilities = (
  ...abilities: { action: string; subject: string }[]
) => SetMetadata('abilities', abilities);
