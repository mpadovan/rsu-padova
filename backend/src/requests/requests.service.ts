import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Request, RequestStatus } from './request.entity';
import { RequestsRepository } from './requests.repository';

export interface AnonymousRequestContext {
  email?: string;
  uid?: string;
  userAgent?: string;
}

export const REQUESTS_LOGGER = Symbol('REQUESTS_LOGGER');

@Injectable()
export class RequestsService {
  constructor(
    private readonly repository: RequestsRepository,
    @Inject(REQUESTS_LOGGER) private readonly logger: LoggerService,
  ) {}

  async createAnonymousRequest(
    text: string,
    context?: AnonymousRequestContext,
  ): Promise<Request> {
    const sanitizedText = text.trim();

    if (!sanitizedText) {
      throw new Error('Request text cannot be empty');
    }

    const now = new Date();
    const request = await this.repository.create({
      text: sanitizedText,
      status: RequestStatus.Active,
      createdAt: now,
      updatedAt: now,
      anonymousAuthorId: this.generateAnonymousAuthorId(),
    });

    this.logCreation(request, context);

    return request;
  }

  async listRequests(): Promise<Request[]> {
    return this.repository.findActive();
  }

  async archiveRequest(id: string): Promise<Request | null> {
    return this.repository.archive(id);
  }

  private logCreation(request: Request, context?: AnonymousRequestContext) {
    const domain = this.extractDomain(context?.email);
    const safeLog = {
      message: 'Anonymous request created',
      requestId: request.id,
      status: request.status,
      domain,
      timestamp: request.createdAt.toISOString(),
    };

    this.logger.log(JSON.stringify(safeLog), RequestsService.name);
  }

  private extractDomain(email?: string): string | undefined {
    if (!email || !email.includes('@')) {
      return undefined;
    }

    return email.split('@')[1]?.toLowerCase();
  }

  private generateAnonymousAuthorId(): string {
    return `anon_${randomBytes(8).toString('hex')}`;
  }
}
