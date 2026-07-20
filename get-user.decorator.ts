import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// استخدام: findProfile(@GetUser() user: AuthenticatedUser)
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
