import { Document } from 'mongoose';

export type TPageSlug =
  | 'about-us'
  | 'privacy-policy'
  | 'terms-and-conditions'
  | string;

export interface IPage extends Document {
  title: string;
  slug: TPageSlug;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
