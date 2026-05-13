import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PageService } from './page.service';

// 1. getPageBySlug
const getPageBySlug = asyncHandler(async (req, res) => {
  const doc = await PageService.getPageBySlugFromDB(String(req.params.slug));

  // res.setHeader(
  //   'Cache-Control',
  //   'no-store, no-cache, must-revalidate, proxy-revalidate',
  // );
  // res.setHeader('Pragma', 'no-cache');
  // res.setHeader('Expires', '0');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Page retrieved successfully!',
    data: doc,
  });
});

// 2. getAllPages
const getAllPages = asyncHandler(async (_req, res) => {
  const docs = await PageService.getAllPagesFromDB();

  // res.setHeader(
  //   'Cache-Control',
  //   'no-store, no-cache, must-revalidate, proxy-revalidate',
  // );
  // res.setHeader('Pragma', 'no-cache');
  // res.setHeader('Expires', '0');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pages retrieved successfully!',
    data: docs,
  });
});

// 3. createPage
const createPage = asyncHandler(async (req, res) => {
  const doc = await PageService.createPageIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Page created successfully!',
    data: doc,
  });
});

// 4. updatePage
const updatePage = asyncHandler(async (req, res) => {
  const doc = await PageService.updatePageIntoDB(
    String(req.params.id),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Page updated successfully!',
    data: doc,
  });
});

// 5. togglePagePublishStatus
const togglePagePublishStatus = asyncHandler(async (req, res) => {
  const page = await PageService.togglePagePublishStatusIntoDB(
    String(req.params.id),
  );

  if (!page)
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Page not found!',
      data: null,
    });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Publish toggled successfully!',
    data: page,
  });
});

// 6. upsertPageBySlug
const upsertPageBySlug = asyncHandler(async (req, res) => {
  const doc = await PageService.upsertPageBySlugIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Page saved successfully!',
    data: doc,
  });
});

export const PageController = {
  getPageBySlug,
  getAllPages,
  createPage,
  updatePage,
  togglePagePublishStatus,
  upsertPageBySlug,
};
