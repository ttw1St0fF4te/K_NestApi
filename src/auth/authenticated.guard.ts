import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAuthenticated = request.isAuthenticated();
    
    if (!isAuthenticated) {
      throw new UnauthorizedException('Требуется авторизация');
    }
    
    return isAuthenticated;
  }
}
