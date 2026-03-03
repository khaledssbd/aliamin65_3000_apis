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
  return PageModel.findByIdAndUpdate(id, payload, { new: true });
};

// 5. togglePagePublishStatusIntoDB
const togglePagePublishStatusIntoDB = async (id: string) => {
  const page = await PageModel.findById(id);
  if (!page) return null;
  page.published = !page.published;
  await page.save();
  return page;
};

export const PageService = {
  getPageBySlugFromDB,
  getAllPagesFromDB,
  createPageIntoDB,
  updatePageIntoDB,
  togglePagePublishStatusIntoDB,
};
