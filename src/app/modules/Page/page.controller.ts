import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PageService } from './page.service';

const getBySlug = asyncHandler(async (req, res) => {
  const doc = await PageService.getBySlug(String(req.params.slug));

  sendResponse(res, { statusCode: httpStatus.OK, message: 'Page', data: doc });
});

const list = asyncHandler(async (_req, res) => {
  const docs = await PageService.list();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pages',
    data: docs,
  });
});

const create = asyncHandler(async (req, res) => {
  const doc = await PageService.create(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Page created',
    data: doc,
  });
});

const update = asyncHandler(async (req, res) => {
  const doc = await PageService.update(String(req.params.id), req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Page updated',
    data: doc,
  });
});

const toggle = asyncHandler(async (req, res) => {
  const page = await PageService.toggle(String(req.params.id));
  if (!page)
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Not found',
      data: null,
    });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Publish toggled',
    data: page,
  });
});

export const PageController = {
  getBySlug,
  list,
  create,
  update,
  toggle,
};
