import { Injectable, NotFoundException } from '@nestjs/common';
import { AllowedDomainsRepository } from './allowed-domains.repository';
import { AllowedDomain } from './allowed-domain.entity';

@Injectable()
export class AllowedDomainsService {
  constructor(private readonly repository: AllowedDomainsRepository) {}

  findAll(): Promise<AllowedDomain[]> {
    return this.repository.findAll();
  }

  async findByDomain(domain: string): Promise<AllowedDomain | null> {
    return this.repository.findByDomain(domain.toLowerCase());
  }

  async create(domain: string): Promise<AllowedDomain> {
    const normalized = domain.toLowerCase();
    const existing = await this.repository.findByDomain(normalized);
    if (existing) {
      return existing;
    }
    return this.repository.create(normalized);
  }

  async update(id: string, domain: string): Promise<AllowedDomain> {
    const normalized = domain.toLowerCase();
    const found = await this.repository.findById(id);
    if (!found) {
      throw new NotFoundException(`Allowed domain with id ${id} not found`);
    }
    return this.repository.update(id, normalized);
  }

  async remove(id: string): Promise<void> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new NotFoundException(`Allowed domain with id ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async isEmailAllowed(email: string): Promise<boolean> {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return false;
    }
    const allowed = await this.repository.findByDomain(domain);
    return !!allowed;
  }
}
