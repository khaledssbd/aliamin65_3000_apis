import axios from 'axios';
import { TBackgroundProvider } from './backgroundCheck.interface';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import config from '../../config';

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
