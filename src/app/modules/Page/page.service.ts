import { IPage } from './page.interface';
import PageModel from './page.model';

const getBySlug = async (slug: string) => {
  return PageModel.findOne({ slug, published: true });
};

const list = async () => {
  return PageModel.find({}).sort({ createdAt: -1 });
};

const create = async (payload: IPage) => {
  return PageModel.create(payload);
};

const update = async (id: string, payload: IPage) => {
  return PageModel.findByIdAndUpdate(id, payload, { new: true });
};

const toggle = async (id: string) => {
  const page = await PageModel.findById(id);
  if (!page) return null;
  page.published = !page.published;
  await page.save();
  return page;
};

export const PageService = { getBySlug, list, create, update, toggle };
