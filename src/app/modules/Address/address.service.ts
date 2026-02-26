import AddressModel from './address.model';
import { IAddress } from './address.interface';
import { Types } from 'mongoose';

const listMine = async (userId: Types.ObjectId) => {
  return AddressModel.find({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

const create = async (userId: Types.ObjectId, payload: Partial<IAddress>) => {
  const doc = await AddressModel.create({ ...payload, user: userId });
  if (payload.isDefault) {
    await AddressModel.updateMany(
      { user: userId, _id: { $ne: doc._id } },
      { $set: { isDefault: false } },
    );
  }
  return doc;
};

const update = async (
  userId: Types.ObjectId,
  id: string,
  payload: Partial<IAddress>,
) => {
  const doc = await AddressModel.findOneAndUpdate(
    { _id: id, user: userId },
    payload,
    { new: true },
  );
  if (payload.isDefault && doc) {
    await AddressModel.updateMany(
      { user: userId, _id: { $ne: doc._id } },
      { $set: { isDefault: false } },
    );
  }
  return doc;
};

const remove = async (userId: Types.ObjectId, id: string) => {
  const doc = await AddressModel.findOneAndDelete({ _id: id, user: userId });
  return doc;
};

const setDefault = async (userId: Types.ObjectId, id: string) => {
  const doc = await AddressModel.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { isDefault: true } },
    { new: true },
  );
  await AddressModel.updateMany(
    { user: userId, _id: { $ne: id } },
    { $set: { isDefault: false } },
  );
  return doc;
};

export const AddressService = { listMine, create, update, remove, setDefault };
