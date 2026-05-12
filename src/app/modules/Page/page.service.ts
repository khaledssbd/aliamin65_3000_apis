import { IPage } from './page.interface';
import PageModel from './page.model';

// 1. getPageBySlugFromDB
const getPageBySlugFromDB = async (slug: string) => {
  return PageModel.findOne({ slug, published: true });
};

// 2. getAllPagesFromDB
const getAllPagesFromDB = async () => {
  return PageModel.find({}).sort({ createdAt: -1 });
};

// 3. createPageIntoDB
const createPageIntoDB = async (payload: IPage) => {
  return PageModel.create(payload);
};

// 4. updatePageIntoDB
const updatePageIntoDB = async (id: string, payload: IPage) => {
  return PageModel.findByIdAndUpdate(id, payload, { returnDocument: 'after' });
};

// 5. togglePagePublishStatusIntoDB
const togglePagePublishStatusIntoDB = async (id: string) => {
  const page = await PageModel.findById(id);
  if (!page) return null;
  page.published = !page.published;
  await page.save();
  return page;
};

// 6. upsertPageBySlugIntoDB
const upsertPageBySlugIntoDB = async (payload: IPage) => {
  return PageModel.findOneAndUpdate(
    { slug: payload.slug },
    { $set: payload },
    { upsert: true, returnDocument: 'after', runValidators: true },
  );
};

export const PageService = {
  getPageBySlugFromDB,
  getAllPagesFromDB,
  createPageIntoDB,
  updatePageIntoDB,
  togglePagePublishStatusIntoDB,
  upsertPageBySlugIntoDB,
};
