import { z } from 'zod';

// Reusable validators
export const zodEnumFromObject = <T extends Record<string, string>>(obj: T) =>
  z.enum([...Object.values(obj)] as [string, ...string[]]);

// 1. createUserSchema
const createUserSchema = z.object({
  body: z.object({
    name: z.string({
      error: 'Name is required',
    }),
    // address: z.string({
    //   error: 'Address is required',
    // }),
    phone: z.string({
      error: 'Phone is required',
    }),
    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform((email) => email.toLowerCase()) // Convert email to lowercase
      .refine((email) => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine((value) => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),

    password: z
      .string({
        error: 'Password is required',
      })
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(20, { message: 'Password cannot exceed 20 characters' }),

    // role: zodEnumFromObject(ROLE),
  }),
});

const createDriverAccountSchema = z.object({
  body: z.object({
    // name: z.string({
    //   error: 'Name is required',
    // }),
    // phone: z.string({
    //   error: 'Phone is required',
    // }),
    // email: z
    //   .string({
    //     error: 'Email is required!',
    //   })
    //   .email({ message: 'Invalid email format!' })
    //   .transform((email) => email.toLowerCase())
    //   .refine((email) => email !== '', { message: 'Email is required!' })
    //   .refine((value) => typeof value === 'string', {
    //     message: 'Email must be string!',
    //   }),
    // password: z
    //   .string({
    //     error: 'Password is required',
    //   })
    //   .min(6, { message: 'Password must be at least 6 characters long' })
    //   .max(20, { message: 'Password cannot exceed 20 characters' }),
    insuranceProvider: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
    insuranceExpiration: z.string().optional(),
    vehicleMake: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehicleYear: z.string().optional(),
    vehiclePlate: z.string().optional(),

    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    idNumber: z.string().optional(),
    documentType: z.string().optional(),
    documentCountry: z.string().optional(),
    fullAddress: z.string().optional(),

    // role: zodEnumFromObject({ DRIVER: 'DRIVER' }),
    role: z.enum(['DRIVER']),
  }),
});

// 2. sendSignupOtpAgainSchema
const sendSignupOtpAgainSchema = z.object({
  body: z.object({
    userEmail: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform((email) => email.toLowerCase()) // Convert email to lowercase
      .refine((email) => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine((value) => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),
  }),
});

// 3. verifySignupOtpSchema
const verifySignupOtpSchema = z.object({
  body: z.object({
    userEmail: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform((email) => email.toLowerCase()) // Convert email to lowercase
      .refine((email) => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine((value) => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),

    otp: z
      .string({
        error: 'Password is required!',
      })
      .min(6, { message: 'Password must be at least 6 characters long!' })
      .max(6, { message: 'Password cannot exceed 6 characters!' }),
  }),
});

// 4. signinSchema
const signinSchema = z.object({
  body: z.object({
    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform((email) => email.toLowerCase()) // Convert email to lowercase
      .refine((email) => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine((value) => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),

    password: z
      .string({
        error: 'Password is required!',
      })
      .min(6, { message: 'Password must be at least 6 characters long!' })
      .max(20, { message: 'Password cannot exceed 20 characters!' }),
  }),
});

// 5. changePasswordSchema
const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string({
        error: 'Old password is required!',
      })
      .min(6, { message: 'Old password must be at least 6 characters long!' })
      .max(20, { message: 'Old password cannot exceed 20 characters!' }),

    newPassword: z
      .string({
        error: 'New password is required!',
      })
      .min(6, { message: 'New password must be at least 6 characters long!' })
      .max(20, { message: 'New password cannot exceed 20 characters!' }),
  }),
});

// 6. forgotPasswordSchema
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform((email) => email.toLowerCase()) // Convert email to lowercase
      .refine((email) => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine((value) => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),
  }),
});

// 7. sendForgotPasswordOtpAgainSchema
const sendForgotPasswordOtpAgainSchema = z.object({
  body: z.object({
    token: z.string({ error: 'Token is required!' }),
  }),
});

// 8. verifyOtpForForgotPasswordSchema
const verifyOtpForForgotPasswordSchema = z.object({
  body: z.object({
    token: z.string({ error: 'Token is required!' }),
    otp: z
      .string({
        error: 'OTP is required!',
      })
      .regex(/^\d+$/, { message: 'OTP must be a number!' })
      .length(6, { message: 'OTP must be exactly 6 digits' }),
  }),
});

// 9. resetPasswordSchema
const resetPasswordSchema = z.object({
  body: z.object({
    resetPasswordToken: z.string({
      error: 'Reset password token is required!',
    }),

    newPassword: z
      .string({
        error: 'New password is required!',
      })
      .min(6, { message: 'New password must be at least 6 characters long!' })
      .max(20, { message: 'New password cannot exceed 20 characters!' }),
  }),
});

// 10. deactivateUserAccountSchema
const deactivateUserAccountSchema = z.object({
  body: z
    .object({
      email: z
        .string({
          error: 'Email is required!',
        })
        .email('Invalid email format!')
        .transform((email) => email.toLowerCase())
        .refine((email) => email !== '', { message: 'Email is required!' })
        .refine((value) => typeof value === 'string', {
          message: 'Email must be string!',
        }),

      password: z
        .string({
          error: 'Password is required!',
        })
        .min(6, { message: 'Password must be at least 6 characters long!' })
        .max(20, { message: 'Password cannot exceed 20 characters!' }),

      deactivationReason: z
        .string({
          error: 'Deactivation reason is required!',
        })
        .min(3, 'Reason must be at least 3 characters!')
        .max(200, 'Reason cannot exceed 200 characters!'),
    })
    .strict(),
});

// 11. getNewAccessTokenSchema
const getNewAccessTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      error: 'Refresh token is required!',
    }),
  }),
});

// 12. updateUserDataSchema
const updateUserDataSchema = z.object({
  body: z.object({
    name: z.string().optional(),

    address: z.string().optional(),

    phone: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserSchema,
  createDriverAccountSchema,
  sendSignupOtpAgainSchema,
  verifySignupOtpSchema,
  signinSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  sendForgotPasswordOtpAgainSchema,
  verifyOtpForForgotPasswordSchema,
  resetPasswordSchema,
  deactivateUserAccountSchema,
  updateUserDataSchema,
  getNewAccessTokenSchema,
};
