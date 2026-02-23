/* eslint-disable no-console */
import config from '../config';
import { ROLE } from '../modules/User/user.constant';
import UserModel from '../modules/User/user.model';
import colors from 'colors';

const superAdminData = {
  role: ROLE.SUPER_ADMIN,
  name: config.superAdmin.name,
  // address: config.superAdmin.address,
  phone: config.superAdmin.phone,
  email: config.superAdmin.email,
  password: config.superAdmin.password,
  otp: config.superAdmin.otp,
  otpExpiry: config.superAdmin.otpExpiry,
  isVerifiedByOTP: true,
};

const seedSuperAdmin = async () => {
  try {
    // Check if an admin already exists
    const isSuperAdminExist = await UserModel.findOne({
      role: ROLE.SUPER_ADMIN,
      email: config.superAdmin.email,
    });

    if (!isSuperAdminExist) {
      await UserModel.create(superAdminData);

      console.log(colors.green('Super_Admin created successfully!').bold);
    } else {
      console.log(colors.yellow('Super_Admin already exists!').bold);
    }
  } catch (error) {
    console.error('Error seeding Super_Admin:', error);
  }
};

export default seedSuperAdmin;
