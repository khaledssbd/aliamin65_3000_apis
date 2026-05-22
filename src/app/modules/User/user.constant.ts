import config from '../../config';

export const ROLE = {
  CUSTOMER: 'CUSTOMER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type TRole = keyof typeof ROLE;

export type ValueOf<T> = T[keyof T];

export const defaultUserImage: string =
  'https://res.cloudinary.com/dweesppci/image/upload/v1746204369/wtmpcphfvexcq2ubcss0.png';

export const otpExpiryMinutes = Number(config.otp_expiry_minutes);

export type TDeactiveAccountPayload = {
  email: string;
  password: string;
  deactivationReason: string;
};

export type TUpdateUserPayload = {
  name: string;
  address?: string;
  phone: string;
  dateOfBirth?: string;
};
