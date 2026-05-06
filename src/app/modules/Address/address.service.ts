import { Types } from 'mongoose';
import UserModel from '../User/user.model';

// 1. getMyAddressFromDB
const getMyAddressFromDB = async (userId: Types.ObjectId) => {
  const user = await UserModel.findById(userId).select('address');
  return { address: user?.address ?? '' };
};

// 2. createAddressIntoDB
const createAddressIntoDB = async (
  userId: Types.ObjectId,
  payload: { address: string },
) => {
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { address: payload.address } },
    { returnDocument: 'after' },
  ).select('address');
  return { address: updated?.address ?? '' };
};

// 3. updateAddressIntoDB
const updateAddressIntoDB = async (
  userId: Types.ObjectId,
  payload: { address: string },
) => {
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { address: payload.address } },
    { returnDocument: 'after' },
  ).select('address');
  return { address: updated?.address ?? '' };
};

// 4. deleteAddressFromDB
const deleteAddressFromDB = async (userId: Types.ObjectId) => {
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { address: '' } },
    { returnDocument: 'after' },
  ).select('address');
  return { address: updated?.address ?? '' };
};

// 5. setDefaultAddressIntoDB
const setDefaultAddressIntoDB = async (userId: Types.ObjectId) => {
  const user = await UserModel.findById(userId).select('address');
  return { address: user?.address ?? '' };
};

export const AddressService = {
  getMyAddressFromDB,
  createAddressIntoDB,
  updateAddressIntoDB,
  deleteAddressFromDB,
  setDefaultAddressIntoDB,
};
