import axios from 'axios';
import { TBackgroundProvider } from './backgroundCheck.interface';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import config from '../../config';
import crypto from 'crypto';

const getVeriffBaseUrl = () => {
  return (config.status.veriff_base_url || 'https://api.veriff.com') as string;
};

const signVeriffRequestBodyIfPossible = (body: unknown) => {
  const secret = config.status.veriff_shared_secret;
  if (!secret) return undefined;

  try {
    const raw = JSON.stringify(body);
    return crypto.createHmac('sha256', secret).update(raw).digest('hex');
  } catch {
    return undefined;
  }
};

const createVeriffSession = async (payload: {
  vendorData: string;
  endUserId: string;
  person?: { firstName?: string; lastName?: string; idNumber?: string };
  document?: { number?: string; type?: string; country?: string };
  address?: { fullAddress?: string };
}) => {
  if (!config.status.veriff_api_key) {
    throw new AppError(httpStatus.BAD_REQUEST, 'VERIFF_API_KEY is missing');
  }

  const body = {
    verification: {
      callback: config.status.veriff_callback_url,
      vendorData: payload.vendorData,
      endUserId: payload.endUserId,
      person: payload.person,
      document: payload.document,
      address: payload.address,
    },
  };

  const signature = signVeriffRequestBodyIfPossible(body);
  const { data } = await axios.post(
    `${getVeriffBaseUrl()}/v1/sessions/`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': config.status.veriff_api_key,
        ...(signature ? { 'X-HMAC-SIGNATURE': signature } : {}),
      },
    },
  );

  const sessionId = data?.verification?.id as string | undefined;
  const url = data?.verification?.url as string | undefined;
  if (!sessionId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to create Veriff session',
    );
  }

  return { sessionId, url };
};

const uploadVeriffMedia = async (payload: {
  sessionId: string;
  context: string;
  buffer: Buffer;
}) => {
  if (!config.status.veriff_api_key) {
    throw new AppError(httpStatus.BAD_REQUEST, 'VERIFF_API_KEY is missing');
  }

  const body = {
    context: payload.context,
    base64: payload.buffer.toString('base64'),
  };

  const signature = signVeriffRequestBodyIfPossible(body);
  await axios.post(
    `${getVeriffBaseUrl()}/v1/sessions/${payload.sessionId}/media`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': config.status.veriff_api_key,
        ...(signature ? { 'X-HMAC-SIGNATURE': signature } : {}),
      },
    },
  );
};

const submitVeriffSession = async (sessionId: string) => {
  if (!config.status.veriff_api_key) {
    throw new AppError(httpStatus.BAD_REQUEST, 'VERIFF_API_KEY is missing');
  }

  const body = { verification: { status: 'submitted' } };
  const signature = signVeriffRequestBodyIfPossible(body);
  await axios.patch(`${getVeriffBaseUrl()}/v1/sessions/${sessionId}`, body, {
    headers: {
      'Content-Type': 'application/json',
      'X-AUTH-CLIENT': config.status.veriff_api_key,
      ...(signature ? { 'X-HMAC-SIGNATURE': signature } : {}),
    },
  });
};

export const startVerificationWithVERIFF = async (payload: {
  vendorData: string;
  endUserId: string;
  licenseImage: Buffer;
  selfieImage: Buffer;
}) => {
  const { sessionId, url } = await createVeriffSession({
    vendorData: payload.vendorData,
    endUserId: payload.endUserId,
  });

  await uploadVeriffMedia({
    sessionId,
    context: 'document-front',
    buffer: payload.licenseImage,
  });

  await uploadVeriffMedia({
    sessionId,
    context: 'face',
    buffer: payload.selfieImage,
  });

  await submitVeriffSession(sessionId);

  return { sessionId, url };
};

// checkr part
const checkStatusWithCHECKR = async (reportId: string) => {
  const { data } = await axios.get(
    `https://api.checkr.com/v1/reports/${reportId}`,
    {
      auth: {
        username: config.status.checkr_api_key!,
        password: '',
      },
    },
  );

  return {
    status: mapCheckrStatus(data.status),
  };
};

const mapCheckrStatus = (status: string) => {
  if (status === 'clear') return 'APPROVED';
  if (status === 'consider') return 'FAILED';
  return 'PENDING';
};

// karmacheck part
const checkStatusWithKARMACHECK = async (reportId: string) => {
  const { data } = await axios.get(
    `https://api.karmacheck.com/v1/reports/${reportId}`,
    {
      headers: {
        Authorization: `Bearer ${config.status.karmacheck_api_key}`,
      },
    },
  );

  return {
    status: mapKarmaStatus(data.status),
  };
};

const mapKarmaStatus = (status: string) => {
  if (status === 'completed') return 'APPROVED';
  if (status === 'failed') return 'FAILED';
  return 'PENDING';
};

// sterling part
const checkStatusWithSTERLING = async (reportId: string) => {
  const { data } = await axios.get(
    `https://api.sterlingcheck.com/reports/${reportId}`,
    {
      headers: {
        Authorization: `Bearer ${config.status.sterling_api_key}`,
      },
    },
  );

  return {
    status: mapSterlingStatus(data.status),
  };
};

const mapSterlingStatus = (status: string) => {
  if (status === 'complete') return 'APPROVED';
  if (status === 'rejected') return 'FAILED';
  return 'PENDING';
};

// veriff part
const checkStatusWithVERIFF = async (sessionId: string) => {
  const { data } = await axios.get(
    `https://api.veriff.com/v1/sessions/${sessionId}`,
    {
      headers: {
        'X-AUTH-CLIENT': config.status.veriff_api_key!,
      },
    },
  );

  return {
    status: mapVeriffStatus(data.status),
  };
};

const mapVeriffStatus = (status: string) => {
  if (status === 'approved') return 'APPROVED';
  if (status === 'declined') return 'FAILED';
  return 'PENDING';
};

const providerMap = {
  CHECKR: checkStatusWithCHECKR,
  KARMACHECK: checkStatusWithKARMACHECK,
  STERLING: checkStatusWithSTERLING,
  VERIFF: checkStatusWithVERIFF,
};

export const dispatchProviderStatusCheck = async (
  provider: TBackgroundProvider,
  reportId: string,
) => {
  const handler = providerMap[provider];

  if (!handler)
    throw new AppError(httpStatus.BAD_REQUEST, 'Unsupported provider!');

  return handler(reportId);
};
