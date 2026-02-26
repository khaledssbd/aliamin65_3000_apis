import { Schema, model } from 'mongoose';
import { IPage } from './page.interface';

const pageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

const PageModel = model<IPage>('Page', pageSchema);
export default PageModel;
