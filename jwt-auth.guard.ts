import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// يُستخدم لحماية أي Route: @UseGuards(JwtAuthGuard)
// يعتمد داخلياً على JwtStrategy الذي يتحقق من deletedAt/status
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
