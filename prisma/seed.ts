import { PrismaClient, Role, KYCStatus, VendorStatus, VanStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean database
  await prisma.adminAuditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.van.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.kYCDocument.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('adminpassword123', salt);
  const customerPasswordHash = await bcrypt.hash('password123', salt);
  const vendorPasswordHash = await bcrypt.hash('password123', salt);

  // 1. Seed Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Nivara Founder',
      email: 'admin@nivara.com',
      phone: '+919999999999',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      kycStatus: KYCStatus.VERIFIED,
    },
  });
  console.log('Seeded Admin User:', admin.email);

  // 2. Seed Customers
  const customerVerified = await prisma.user.create({
    data: {
      name: 'Tanmay Sharma',
      email: 'tanmay@gmail.com',
      phone: '+919876543210',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      kycStatus: KYCStatus.VERIFIED,
    },
  });

  const customerUnverified = await prisma.user.create({
    data: {
      name: 'Riya Sen',
      email: 'riya@gmail.com',
      phone: '+919876543211',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      kycStatus: KYCStatus.UNVERIFIED,
    },
  });
  console.log('Seeded Customers:', customerVerified.email, customerUnverified.email);

  // Seed KYC Document for verified customer
  await prisma.kYCDocument.create({
    data: {
      userId: customerVerified.id,
      docType: 'AADHAAR',
      docNumber: 'XXXX-XXXX-1234',
      fileUrl: '/uploads/dummy_aadhaar.jpg',
      status: KYCStatus.VERIFIED,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });

  // Seed pending KYC Document for unverified customer
  const pendingKycUser = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'rahul@gmail.com',
      phone: '+919876543212',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      kycStatus: KYCStatus.PENDING,
    },
  });

  await prisma.kYCDocument.create({
    data: {
      userId: pendingKycUser.id,
      docType: 'PAN_CARD',
      docNumber: 'ABCDE1234F',
      fileUrl: '/uploads/dummy_pan.jpg',
      status: KYCStatus.PENDING,
    },
  });

  // 3. Seed Vendors
  const vendorUserApproved = await prisma.user.create({
    data: {
      name: 'Vikas Pods',
      email: 'vikas@wellnessvans.com',
      phone: '+919812345678',
      passwordHash: vendorPasswordHash,
      role: Role.VENDOR,
      kycStatus: KYCStatus.VERIFIED,
    },
  });

  const vendorProfileApproved = await prisma.vendorProfile.create({
    data: {
      userId: vendorUserApproved.id,
      businessName: 'Vikas Wellness Vans',
      bio: 'Providing state-of-the-art mobile relaxation pods since 2024. Equipped with zero-gravity seats and active noise cancellation.',
      verificationStatus: VendorStatus.APPROVED,
      payoutDetails: 'Bank: HDFC Bank, A/C: 501002345678, IFSC: HDFC0000123',
      ratingAvg: 4.8,
      totalBookings: 12,
    },
  });

  const vendorUserPending = await prisma.user.create({
    data: {
      name: 'CalmSpace Mobile',
      email: 'info@calmspace.in',
      phone: '+919812345679',
      passwordHash: vendorPasswordHash,
      role: Role.VENDOR,
      kycStatus: KYCStatus.PENDING,
    },
  });

  await prisma.vendorProfile.create({
    data: {
      userId: vendorUserPending.id,
      businessName: 'CalmSpace Mobile Recovery',
      bio: 'Next-generation wellness cabins focusing on sleep and stress relief. Our fleet consists of converted acoustic vans.',
      verificationStatus: VendorStatus.PENDING,
      payoutDetails: 'UPI: calmspace@okaxis',
      ratingAvg: 0.0,
      totalBookings: 0,
    },
  });
  console.log('Seeded Vendors');

  // 4. Seed Vans
  const vanIndiranagar = await prisma.van.create({
    data: {
      vendorId: vendorProfileApproved.id,
      title: 'Nivara Pod Mumbai - Bandra West',
      description: 'Located in Bandra West at Carter Road, this premium relaxation pod offers ultimate isolation. Features a premium leather zero-gravity reclining chair, customizable ambient lighting (warm amber to soft green), and immersive spatial audio.',
      amenities: ['Zero-Gravity Chair', 'Soundproofing', 'Aromatherapy', 'Ambient Lighting', 'Air Conditioning'],
      photos: ['/images/van1_ext.jpg', '/images/van1_int.jpg'],
      latitude: 19.0596,
      longitude: 72.8295,
      address: 'Carter Road, Bandra West, Mumbai, Maharashtra 400050',
      serviceRadius: 5.0,
      price15: 1499,
      price30: 1999,
      price45: 2499,
      status: VanStatus.ACTIVE,
      hasAttendant: true,
      attendantName: 'Ramesh Kumar',
    },
  });

  const vanKoramangala = await prisma.van.create({
    data: {
      vendorId: vendorProfileApproved.id,
      title: 'Nivara Pod Thane - Meadows',
      description: 'Perfect escape at Hiranandani Meadows in Thane West. A soundproof cabin designed for quick power naps and stress recovery. Tucked in a quiet lane behind residential clusters.',
      amenities: ['Zero-Gravity Chair', 'Soundproofing', 'Aromatherapy', 'Ambient Lighting', 'Air Conditioning'],
      photos: ['/images/van2_ext.jpg', '/images/van2_int.jpg'],
      latitude: 19.2183,
      longitude: 72.9781,
      address: 'Hiranandani Meadows, Thane West, Thane, Maharashtra 400610',
      serviceRadius: 6.0,
      price15: 1499,
      price30: 1999,
      price45: 2499,
      status: VanStatus.ACTIVE,
      hasAttendant: false,
    },
  });

  const vanUnderReview = await prisma.van.create({
    data: {
      vendorId: vendorProfileApproved.id,
      title: 'Nivara Pod South Mumbai - Colaba',
      description: 'New premium pod expanding our network in South Mumbai near Colaba. Quiet rest and recovery cabin with state-of-the-art oxygen concentration.',
      amenities: ['Zero-Gravity Chair', 'Soundproofing', 'Oxygen Therapy', 'Ambient Lighting'],
      photos: ['/images/van3_ext.jpg'],
      latitude: 18.9220,
      longitude: 72.8347,
      address: 'Gateway of India, Colaba, Mumbai, Maharashtra 400001',
      serviceRadius: 4.0,
      price15: 1499,
      price30: 1999,
      price45: 2499,
      status: VanStatus.UNDER_REVIEW,
      hasAttendant: true,
      attendantName: 'Amit Shah',
    },
  });
  console.log('Seeded Vans');

  // 5. Seed Availabilities (Slots for today and tomorrow)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const slotTimes = [
    { start: 9, end: 10 },
    { start: 10, end: 11 },
    { start: 11, end: 12 },
    { start: 14, end: 15 },
    { start: 15, end: 16 },
    { start: 16, end: 17 },
    { start: 17, end: 18 },
  ];

  // Seed for Indiranagar
  const availabilitiesData = [];
  for (const date of [today, tomorrow]) {
    for (const time of slotTimes) {
      const startTime = new Date(date);
      startTime.setHours(time.start, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(time.end, 0, 0, 0);

      availabilitiesData.push({
        vanId: vanIndiranagar.id,
        date: date,
        startTime: startTime,
        endTime: endTime,
        isBooked: false,
      });

      availabilitiesData.push({
        vanId: vanKoramangala.id,
        date: date,
        startTime: startTime,
        endTime: endTime,
        isBooked: false,
      });
    }
  }

  await prisma.availability.createMany({
    data: availabilitiesData,
  });
  console.log('Seeded Availabilities');

  // Fetch some seeded availabilities to create bookings
  const indiranagarSlots = await prisma.availability.findMany({
    where: { vanId: vanIndiranagar.id },
    orderBy: { startTime: 'asc' },
  });

  // Create a past completed booking
  const pastSlot = indiranagarSlots[0];
  await prisma.availability.update({
    where: { id: pastSlot.id },
    data: { isBooked: true },
  });

  const bookingCompleted = await prisma.booking.create({
    data: {
      customerId: customerVerified.id,
      vanId: vanIndiranagar.id,
      vendorId: vendorProfileApproved.id,
      slotId: pastSlot.id,
      sessionLength: 30,
      status: BookingStatus.COMPLETED,
      bookingCode: 'NV-9871-3421',
      createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bookingCompleted.id,
      amount: 499,
      currency: 'INR',
      gatewayRef: 'ch_mock_completed_payment_1',
      status: PaymentStatus.SUCCESS,
    },
  });

  await prisma.review.create({
    data: {
      bookingId: bookingCompleted.id,
      customerId: customerVerified.id,
      vanId: vanIndiranagar.id,
      rating: 5,
      comment: 'Absolutely magical experience. The noise cancellation inside the van makes you forget you are right next to the busy Indiranagar 12th Main road. Highly recommended!',
    },
  });

  // Create an upcoming confirmed booking
  const upcomingSlot = indiranagarSlots[3];
  await prisma.availability.update({
    where: { id: upcomingSlot.id },
    data: { isBooked: true },
  });

  const bookingConfirmed = await prisma.booking.create({
    data: {
      customerId: customerVerified.id,
      vanId: vanIndiranagar.id,
      vendorId: vendorProfileApproved.id,
      slotId: upcomingSlot.id,
      sessionLength: 45,
      status: BookingStatus.CONFIRMED,
      bookingCode: 'NV-2342-9856',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bookingConfirmed.id,
      amount: 699,
      currency: 'INR',
      gatewayRef: 'ch_mock_confirmed_payment_2',
      status: PaymentStatus.SUCCESS,
    },
  });

  // Seed Admin Audit Logs
  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'APPROVE_VENDOR',
      targetEntity: `VendorProfile:${vendorProfileApproved.id}`,
      details: 'Approved Vikas Wellness Vans after reviewing identity and business documents.',
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'APPROVE_VAN',
      targetEntity: `Van:${vanIndiranagar.id}`,
      details: 'Approved Nivara Pod Bangalore - Indiranagar listing.',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
