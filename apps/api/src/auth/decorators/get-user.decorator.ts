import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific field is requested (e.g., 'id'), return that field
    // Otherwise return the entire user object
    return data ? user?.[data] : user;
  },
);
