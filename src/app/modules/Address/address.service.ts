import { Types } from 'mongoose';
import UserModel from '../User/user.model';

// 1. listMineAddressInDB
const listMineAddressInDB = async (userId: Types.ObjectId) => {
  const user = await UserModel.findById(userId).select('address');
  return { address: user?.address ?? '' };
};

// 2. createAddressInDB
const createAddressInDB = async (
  userId: Types.ObjectId,
  payload: { address: string },
) => {
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { address: payload.address } },
    { new: true },
  ).select('address');
  return { address: updated?.address ?? '' };
};

// 3. updateAddressInDB
const updateAddressInDB = async (
  userId: Types.ObjectId,
  _id: string,
  payload: { address: string },
) => {
  void _id;
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { address: payload.address } },
    { new: true },
  ).select('address');
  return { address: updated?.address ?? '' };
};

// 4. removeInAddressDB
const removeAddressInDB = async (
  userId: Types.ObjectId,
  _id: string,
) => {
  void _id;
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { address: '' } },
    { new: true },
  ).select('address');
  return { address: updated?.address ?? '' };
};

// 5. setDefaultAddressInDB
const setDefaultAddressInDB = async (userId: Types.ObjectId, _id: string) => {
  void _id;
  const user = await UserModel.findById(userId).select('address');
  return { address: user?.address ?? '' };
};

export const AddressService = {
  listMineAddressInDB,
  createAddressInDB,
  updateAddressInDB,
  removeAddressInDB,
  setDefaultAddressInDB,
};
