import { Inject, Injectable } from '@nestjs/common';
import { CollectionReference, Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../config/firebase-admin.provider';
import { AllowedDomain } from './allowed-domain.entity';

@Injectable()
export class AllowedDomainsRepository {
  private readonly collection: CollectionReference;

  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('allowed_domains');
  }

  async findAll(): Promise<AllowedDomain[]> {
    const snapshot = await this.collection.orderBy('domain').get();
    return snapshot.docs.map((doc) => this.mapDocument(doc.id, doc.data()));
  }

  async findByDomain(domain: string): Promise<AllowedDomain | null> {
    const snapshot = await this.collection.where('domain', '==', domain).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return this.mapDocument(doc.id, doc.data());
  }

  async findById(id: string): Promise<AllowedDomain | null> {
    const doc = await this.collection.doc(id).get();
    const data = doc.data();
    if (!doc || !doc.exists || !data) {
      return null
    }
    return this.mapDocument(doc.id, data);
  }

  async create(domain: string): Promise<AllowedDomain> {
    const now = new Date();
    const payload = { domain, createdAt: now, updatedAt: now };
    const docRef = await this.collection.add(payload);
    return { id: docRef.id, ...payload };
  }

  async update(id: string, domain: string): Promise<AllowedDomain> {
    const now = new Date();
    const payload = { domain, updatedAt: now };
    await this.collection.doc(id).set(payload, { merge: true });
    const doc = await this.collection.doc(id).get();
    const data = doc.data();
    if (!doc || !doc.exists || !data) {
      throw new Error('Document not found');
    }
    return this.mapDocument(doc.id, data);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  private mapDocument(id: string, data: FirebaseFirestore.DocumentData): AllowedDomain {
    return {
      id,
      domain: data.domain,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
    };
  }
}
