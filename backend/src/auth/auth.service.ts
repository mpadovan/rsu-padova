import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
import { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FIREBASE_APP } from '../config/firebase-admin.provider';
import { AllowedDomainsService } from '../allowed-domains/allowed-domains.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: App,
    @Inject(forwardRef(() => AllowedDomainsService))
    private readonly allowedDomainsService: AllowedDomainsService,
  ) {}

  async verifyToken(idToken: string) {
    try {
      const decoded = await getAuth(this.firebaseApp).verifyIdToken(idToken, true);
      if (!decoded.email) {
        throw new UnauthorizedException('Firebase token missing email claim');
      }

      const isAllowed = await this.allowedDomainsService.isEmailAllowed(decoded.email);
      if (!isAllowed) {
        throw new UnauthorizedException('Email domain is not allowed');
      }

      return decoded;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
