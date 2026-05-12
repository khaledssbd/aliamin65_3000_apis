import { ROLE } from '../User/user.constant';
import UserModel from '../User/user.model';
import DriverModel from '../Driver/driver.model';
import OrderModel from '../Order/order.model';
import PaymentModel from '../Payment/payment.model';
import PricingModel from '../Pricing/pricing.model';

type TMonthlyRow = { _id: { month: number }; total: number };

const buildMonthlySeries = (rows: TMonthlyRow[]) => {
  const series = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    total: 0,
  }));

  rows.forEach((row) => {
    const index = row._id.month - 1;
    if (index >= 0 && index < 12) series[index].total = row.total;
  });

  return series;
};

// getDashboardFromDB
const getDashboardFromDB = async () => {
  const [
    customerCount,
    driverCount,
    totalOrders,
    totalPayments,
    revenueAgg,
    pricing,
    recentCustomers,
    recentDrivers,
  ] = await Promise.all([
    UserModel.countDocuments({ role: ROLE.CUSTOMER }),
    UserModel.countDocuments({ role: ROLE.DRIVER }),
    OrderModel.countDocuments({}),
    PaymentModel.countDocuments({}),
    PaymentModel.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]),
    PricingModel.findOne({}).sort({ createdAt: -1 }).lean(),
    UserModel.find({ role: ROLE.CUSTOMER })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email phone image role isActive createdAt')
      .lean(),
    UserModel.find({ role: ROLE.DRIVER })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email phone image role isActive createdAt')
      .lean(),
  ]);

  const currentYear = new Date().getFullYear();
  const [monthlyOrdersRaw, monthlyRevenueRaw] = await Promise.all([
    OrderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
            $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]),
    PaymentModel.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
            $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]),
  ]);

  return {
    summary: {
      customerCount,
      driverCount,
      totalOrders,
      totalPayments,
      totalRevenue: revenueAgg[0]?.totalRevenue ?? 0,
      pricePerBag: pricing?.pricePerBag ?? 45,
      driverEarningPercentage: pricing?.driverEarningPercentage ?? 70,
    },
    recentCustomers,
    recentDrivers,
    monthlyOrders: buildMonthlySeries(monthlyOrdersRaw),
    monthlyRevenue: buildMonthlySeries(monthlyRevenueRaw),
  };
};

// getYearlyAppointmentStatsFromDB
const getYearlyAppointmentStatsFromDB = async (year: number) => {
  const rows = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    },
    {
      $group: { _id: { month: { $month: '$createdAt' } }, total: { $sum: 1 } },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  return buildMonthlySeries(rows);
};

// getYearlyRevenueStatsFromDB
const getYearlyRevenueStatsFromDB = async (year: number) => {
  const rows = await PaymentModel.aggregate([
    {
      $match: {
        status: 'succeeded',
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  return buildMonthlySeries(rows);
};

// getUsersByRoleFromDB
const getUsersByRoleFromDB = async (
  query: Record<string, unknown>,
  role: typeof ROLE.CUSTOMER | typeof ROLE.DRIVER,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = String(query.searchTerm ?? '').trim();

  const filter: Record<string, unknown> = { role };

  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { phone: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name email phone image role address isActive deactivationReason createdAt updatedAt')
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  if (role === ROLE.DRIVER) {
    const driverDocs = await DriverModel.find({ user: { $in: users.map((user) => user._id) } })
      .select(
        'user stripeConnectedAccountId licenseImageUrl selfieImageUrl identity isAvailable insurance vehicle backgroundCheckStatus reputationTier capacityLimit status createdAt updatedAt',
      )
      .lean();

    const driverByUserId = new Map(
      driverDocs.map((driver) => [String(driver.user), driver]),
    );

    const data = users.map((user) => {
      const driver = driverByUserId.get(String(user._id));

      return {
        ...user,
        driverProfile: driver ?? null,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPage: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

// toggleUserStatusIntoDB
const toggleUserStatusIntoDB = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) return null;

  user.isActive = !user.isActive;
  await user.save();
  return user;
};

// getBookingsFromDB
const getBookingsFromDB = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    OrderModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name email phone image role isActive')
      .populate('driver', 'name email phone image role isActive')
      .lean(),
    OrderModel.countDocuments({}),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

// getPaymentHistoriesFromDB
const getPaymentHistoriesFromDB = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    PaymentModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'order',
        populate: [
          { path: 'customer', select: 'name email phone image role isActive' },
          { path: 'driver', select: 'name email phone image role isActive' },
        ],
      })
      .populate('customer', 'name email phone image role isActive')
      .lean(),
    PaymentModel.countDocuments({}),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const AdminService = {
  getDashboardFromDB,
  getYearlyAppointmentStatsFromDB,
  getYearlyRevenueStatsFromDB,
  getUsersByRoleFromDB,
  toggleUserStatusIntoDB,
  getBookingsFromDB,
  getPaymentHistoriesFromDB,
};
