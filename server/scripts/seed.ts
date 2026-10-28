import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { User } from '../src/models/User.model';
import { Hotel } from '../src/models/Hotel.model';
import { RoomType } from '../src/models/RoomType.model';
import { PhysicalRoom } from '../src/models/PhysicalRoom.model';
import { DailyInventory } from '../src/models/DailyInventory.model';
import { Booking } from '../src/models/Booking.model';
import { Payment } from '../src/models/Payment.model';
import { Review } from '../src/models/Review.model';
import { StaffAssignment } from '../src/models/StaffAssignment.model';
import { ServiceRequest } from '../src/models/ServiceRequest.model';
import { getStayNightStrings } from '../src/utils/referenceGenerator';

async function seedDatabase(): Promise<void> {
  if (env.isProduction) {
    console.error('[HotelPro Seed] Refusing to run development seed script in production mode.');
    process.exit(1);
  }
  await connectDatabase();
  await Promise.all([
    User.deleteMany({}),
    Hotel.deleteMany({}),
    RoomType.deleteMany({}),
    PhysicalRoom.deleteMany({}),
    DailyInventory.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({}),
    StaffAssignment.deleteMany({}),
    ServiceRequest.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash('HotelPro@2026', 12);
  const [adminUser, managerUser, staffUser, guestUser] = await User.insertMany([
    { name: 'Vikramaditya Sen (Platform Admin)', email: 'admin@hotelpro.in', passwordHash, phone: '+91 98110 44201', role: 'admin', isEmailVerified: true, accountStatus: 'active' },
    { name: 'Devika Rathore (Hotel Manager)', email: 'manager@hotelpro.in', passwordHash, phone: '+91 98290 71500', role: 'manager', isEmailVerified: true, accountStatus: 'active' },
    { name: 'Rohan Mewara (Front Desk Staff)', email: 'staff@hotelpro.in', passwordHash, phone: '+91 98291 11223', role: 'staff', isEmailVerified: true, accountStatus: 'active' },
    { name: 'Aarav Deshmukh', email: 'guest@hotelpro.in', passwordHash, phone: '+91 98201 55412', role: 'guest', isEmailVerified: true, accountStatus: 'active' }
  ]);

  const hotels = await Hotel.insertMany([
    {
      name: 'Suryagarh Lake Palace & Haveli',
      slug: 'suryagarh-lake-palace-udaipur',
      tagline: 'Restored 18th-century Mewar sandstone haveli overlooking Lake Pichola',
      description: 'Carved from honey-gold sandstone along Lake Pichola with traditional courtyards and private boat jetty.',
      address: 'Haridasji Ki Magri, Pichola Shore Road',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
      contact: { phone: '+91 294 243 8800', email: 'reservations.udaipur@hotelpro.in' },
      amenities: ['Heritage Courtyard Pool', 'Ayurvedic Spa & Hammam', 'Fine Dining & Rooftop Bar', 'High-Speed Wi-Fi'],
      images: [{ url: '/assets/hotel-palace-hero.jpg', alt: 'Suryagarh Lake Palace', isPrimary: true }],
      startingPrice: 14500,
      ratingAverage: 4.9,
      ratingCount: 1,
      managers: [managerUser._id],
      operationalStatus: 'active',
      featured: true
    },
    {
      name: 'Ahilya Fort Riverside Sanctuary',
      slug: 'ahilya-fort-riverside-maheshwar',
      tagline: 'Historic 1766 citadel perched high above the sacred Narmada River ghats',
      description: 'Set within Queen Ahilyabai Holkar’s 18th-century citadel overlooking the Narmada River.',
      address: 'Ahilya Wada, Fort Citadel',
      city: 'Maheshwar',
      state: 'Madhya Pradesh',
      country: 'India',
      contact: { phone: '+91 7283 273 320', email: 'concierge.ahilya@hotelpro.in' },
      amenities: ['Narmada River View Terraces', 'Organic Farm-to-Table Dining', 'High-Speed Wi-Fi'],
      images: [{ url: '/assets/hotel-ahilya-fort.jpg', alt: 'Ahilya Fort', isPrimary: true }],
      startingPrice: 12800,
      ratingAverage: 4.8,
      ratingCount: 1,
      managers: [managerUser._id],
      operationalStatus: 'active',
      featured: true
    }
  ]);

  await StaffAssignment.insertMany([
    { staff: managerUser._id, hotel: hotels[0]._id, department: 'management', shift: 'morning', isActive: true },
    { staff: staffUser._id, hotel: hotels[0]._id, department: 'front_desk', shift: 'morning', isActive: true }
  ]);

  const roomTypes = await RoomType.insertMany([
    {
      hotel: hotels[0]._id,
      name: 'Haveli Courtyard Chamber',
      code: 'HCC',
      description: 'Light-filled guest room with carved sandstone jharokha seating.',
      maxOccupancy: { adults: 2, children: 1 },
      bedConfiguration: '1 King Bed',
      sizeSqFt: 480,
      amenities: ['Courtyard View', 'Rain Shower', 'Wi-Fi'],
      totalInventory: 4,
      basePricePerNight: 14500,
      seasonalPricing: [],
      images: [{ url: '/assets/room-deluxe-interior.jpg', alt: 'Chamber' }],
      isActive: true
    }
  ]);

  await PhysicalRoom.insertMany([
    { hotel: hotels[0]._id, roomType: roomTypes[0]._id, roomNumber: 'HCC-101', floor: 1, housekeepingStatus: 'inspected', occupancyStatus: 'vacant' },
    { hotel: hotels[0]._id, roomType: roomTypes[0]._id, roomNumber: 'HCC-102', floor: 1, housekeepingStatus: 'clean', occupancyStatus: 'vacant' }
  ]);

  const nights = getStayNightStrings('2026-10-28', '2026-10-31');
  const booking = await Booking.create({
    bookingReference: 'HPR-20261028-A101',
    guest: guestUser._id,
    guestDetails: { fullName: 'Aarav Deshmukh', email: 'guest@hotelpro.in', phone: '+91 98201 55412' },
    hotel: hotels[0]._id,
    roomType: roomTypes[0]._id,
    checkInDate: '2026-10-28',
    checkOutDate: '2026-10-31',
    nights: 3,
    guestsCount: { adults: 2, children: 0 },
    roomQuantity: 1,
    pricing: { nightlyRates: nights.map((d) => ({ date: d, ratePerRoom: 14500 })), baseAmount: 43500, taxesAndFees: 7830, discountAmount: 0, additionalCharges: 0, totalAmount: 51330, currency: 'INR' },
    status: 'confirmed',
    paymentStatus: 'paid',
    inventoryLocked: true
  });

  await Payment.create({
    booking: booking._id,
    guest: guestUser._id,
    hotel: hotels[0]._id,
    invoiceNumber: 'INV-HPR-2026-8801',
    amount: 51330,
    currency: 'INR',
    provider: 'razorpay_sandbox',
    providerOrderId: 'order_seed_a101',
    providerPaymentId: 'pay_seed_a101',
    verificationStatus: 'verified'
  });

  console.log('[HotelPro Seed] Completed successfully.');
  await disconnectDatabase();
}

seedDatabase();
