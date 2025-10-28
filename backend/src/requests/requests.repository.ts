import { Inject, Injectable } from '@nestjs/common';
import { CollectionReference, Firestore } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import { FIRESTORE } from '../config/firebase-admin.provider';
import { Request, RequestStatus } from './request.entity';

interface CreateRequestRecord {
  text: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  anonymousAuthorId: string;
}

@Injectable()
export class RequestsRepository {
  private readonly collection: CollectionReference;

  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('requests');
  }

  async create(record: CreateRequestRecord): Promise<Request> {
    const docId = this.generateDocumentId();
    await this.collection.doc(docId).set({
      text: record.text,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      anonymousAuthorId: record.anonymousAuthorId,
    });

    return {
      id: docId,
      text: record.text,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      anonymousAuthorId: record.anonymousAuthorId,
    };
  }

  async findActive(): Promise<Request[]> {
    const snapshot = await this.collection
      .where('status', '==', RequestStatus.Active)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => this.mapDocument(doc.id, doc.data()));
  }

  async archive(id: string): Promise<Request | null> {
    const now = new Date();
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    await docRef.set(
      {
        status: RequestStatus.Archived,
        updatedAt: now,
        archivedAt: now,
      },
      { merge: true },
    );

    const updatedDoc = await docRef.get();
    return this.mapDocument(updatedDoc.id, updatedDoc.data());
  }

  private mapDocument(
    id: string,
    data: FirebaseFirestore.DocumentData,
  ): Request {
    return {
      id,
      text: data.text,
      status: data.status,
      createdAt: this.normalizeDate(data.createdAt),
      updatedAt: this.normalizeDate(data.updatedAt),
      archivedAt: data.archivedAt ? this.normalizeDate(data.archivedAt) : null,
      anonymousAuthorId: data.anonymousAuthorId,
    };
  }

  private normalizeDate(value: unknown): Date {
    if (!value) {
      return new Date(0);
    }

    const timestamp = value as { toDate?: () => Date };
    return typeof timestamp.toDate === 'function'
      ? timestamp.toDate()
      : (value as Date);
  }

  private generateDocumentId(): string {
    return `req_${randomBytes(8).toString('hex')}`;
  }
}
