import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PageService } from './page.service';

// 1. getPageBySlug
const getPageBySlug = asyncHandler(async (req, res) => {
  const doc = await PageService.getPageBySlugFromDB(String(req.params.slug));

  sendResponse(res, { statusCode: httpStatus.OK, message: 'Page', data: doc });
});

// 2. getAllPages
const getAllPages = asyncHandler(async (_req, res) => {
  const docs = await PageService.getAllPagesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pages',
    data: docs,
  });
});

// 3. createPage
const createPage = asyncHandler(async (req, res) => {
  const doc = await PageService.createPageIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Page created',
    data: doc,
  });
});

// 4. updatePage
const updatePage = asyncHandler(async (req, res) => {
  const doc = await PageService.updatePageIntoDB(String(req.params.id), req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Page updated',
    data: doc,
  });
});

// 5. togglePagePublishStatus
const togglePagePublishStatus = asyncHandler(async (req, res) => {
  const page = await PageService.togglePagePublishStatusIntoDB(String(req.params.id));
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
  getPageBySlug,
  getAllPages,
  createPage,
  updatePage,
  togglePagePublishStatus,
};
