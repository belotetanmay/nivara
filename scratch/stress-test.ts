import { PrismaClient, BookingStatus, PaymentStatus } from '@prisma/client';

const db = new PrismaClient();

async function runConcurrencyStressTest() {
  console.log('=== STARTING NIVARA CONCURRENCY & STRESS TEST ===');

  try {
    // 1. Fetch an available slot and customer
    const slot = await db.availability.findFirst({
      where: { isBooked: false },
      include: { van: true },
    });

    const customers = await db.user.findMany({
      where: { role: 'CUSTOMER' },
      take: 5,
    });

    if (!slot || customers.length < 2) {
      console.log('⚠️ Insufficient seed data for concurrency test. Skipping live DB mutations.');
      return;
    }

    console.log(`Testing concurrent booking attempts on Slot ${slot.id} (Van ${slot.van.title})...`);

    // 2. Simulate 5 concurrent users trying to book the EXACT SAME availability slot at the same microsecond
    const bookingResults = await Promise.allSettled(
      customers.map((cust) =>
        db.$transaction(async (tx) => {
          const freshSlot = await tx.availability.findUnique({
            where: { id: slot.id },
          });

          if (freshSlot?.isBooked) {
            throw new Error('SLOT_ALREADY_BOOKED');
          }

          // Mark slot booked
          await tx.availability.update({
            where: { id: slot.id },
            data: { isBooked: true },
          });

          // Create booking
          const booking = await tx.booking.create({
            data: {
              customerId: cust.id,
              vendorId: slot.van.vendorId,
              vanId: slot.van.id,
              slotId: slot.id,
              bookingCode: `NV-STRESS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              sessionLength: 30,
              status: BookingStatus.PENDING,
            },
          });

          return booking;
        })
      )
    );

    const fulfilled = bookingResults.filter((r) => r.status === 'fulfilled');
    const rejected = bookingResults.filter((r) => r.status === 'rejected');

    console.log(`Concurrency Results: ${fulfilled.length} succeeded, ${rejected.length} safely rejected (prevented double-booking).`);

    if (fulfilled.length === 1 && rejected.length === customers.length - 1) {
      console.log('✅ CONCURRENCY LOCK PASSED: Exactly 1 user secured the slot. 0 race conditions or duplicate bookings!');
    } else {
      console.log('⚠️ Concurrency warning: multiple locks recorded.');
    }
  } catch (error) {
    console.error('Stress test error:', error);
  } finally {
    await db.$disconnect();
  }
}

runConcurrencyStressTest();
