import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import connectDB from '../config/database.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@hotel.com',
    phone: '+1234567890',
    password: '123456',
    role: 'admin',
    address: {
      street: '123 Admin Street',
      city: 'Admin City',
      state: 'AC',
      country: 'Adminland',
      zipCode: '12345'
    }
  },
  {
    name: 'Receptionist User',
    email: 'receptionist@hotel.com',
    phone: '+1234567891',
    password: '123456',
    role: 'receptionist',
    address: {
      street: '456 Reception St',
      city: 'Reception City',
      state: 'RC',
      country: 'Receptionland',
      zipCode: '67890'
    }
  },
  {
    name: 'John Doe',
    email: 'guest@example.com',
    phone: '+1234567892',
    password: '123456',
    role: 'guest',
    address: {
      street: '789 Guest Avenue',
      city: 'Guest City',
      state: 'GC',
      country: 'Guestland',
      zipCode: '11223'
    },
    idProof: 'https://example.com/id1.jpg',
    idNumber: 'G123456789'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567893',
    password: '123456',
    role: 'guest',
    address: {
      street: '321 Visitor Road',
      city: 'Visitor City',
      state: 'VC',
      country: 'Visitorland',
      zipCode: '44556'
    },
    idProof: 'https://example.com/id2.jpg',
    idNumber: 'G987654321'
  }
];

const sampleRooms = [
  {
    roomNumber: '101',
    roomType: 'single',
    description: 'Cozy single room with city view, perfect for solo travelers.',
    price: 99,
    capacity: 1,
    amenities: ['wifi', 'tv', 'ac', 'safe', 'shower', 'coffee-maker'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        alt: 'Single Room'
      }
    ],
    status: 'available',
    floor: 1,
    size: '200 sq ft',
    beds: 1,
    bedType: 'single'
  },
  {
    roomNumber: '102',
    roomType: 'double',
    description: 'Spacious double room with comfortable queen bed and work desk.',
    price: 149,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'bathtub', 'coffee-maker', 'iron'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        alt: 'Double Room'
      }
    ],
    status: 'available',
    floor: 1,
    size: '300 sq ft',
    beds: 1,
    bedType: 'queen'
  },
  {
    roomNumber: '201',
    roomType: 'deluxe',
    description: 'Luxurious deluxe room with king bed and panoramic city views.',
    price: 199,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'balcony', 'bathtub', 'coffee-maker', 'iron', 'hairdryer'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        alt: 'Deluxe Room'
      }
    ],
    status: 'available',
    floor: 2,
    size: '400 sq ft',
    beds: 1,
    bedType: 'king'
  },
  {
    roomNumber: '202',
    roomType: 'suite',
    description: 'Elegant suite with separate living area and premium amenities.',
    price: 299,
    capacity: 4,
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'balcony', 'bathtub', 'coffee-maker', 'iron', 'hairdryer', 'ocean-view'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        alt: 'Suite Room'
      }
    ],
    status: 'occupied',
    floor: 2,
    size: '600 sq ft',
    beds: 2,
    bedType: 'king'
  },
  {
    roomNumber: '301',
    roomType: 'presidential',
    description: 'Ultra-luxurious presidential suite with premium services and stunning views.',
    price: 499,
    capacity: 4,
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'balcony', 'bathtub', 'coffee-maker', 'iron', 'hairdryer', 'ocean-view', 'mountain-view'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1564501049415-5db36e8d2a10?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        alt: 'Presidential Suite'
      }
    ],
    status: 'maintenance',
    floor: 3,
    size: '1000 sq ft',
    beds: 2,
    bedType: 'king'
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});

    console.log('🗑️ Existing data cleared');

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log('✅ Users created');

    // Create rooms
    const createdRooms = await Room.insertMany(sampleRooms);
    console.log('✅ Rooms created');

    // Create sample bookings
    const sampleBookings = [
      {
        guest: createdUsers[2]._id, // John Doe
        room: createdRooms[3]._id, // Suite room
        checkIn: new Date('2024-02-15'),
        checkOut: new Date('2024-02-18'),
        numberOfGuests: {
          adults: 2,
          children: 1
        },
        totalAmount: 897, // 299 * 3 nights
        amountPaid: 897,
        paymentStatus: 'paid',
        bookingStatus: 'checked-in',
        specialRequests: 'Please provide extra towels and a baby crib.',
        createdBy: createdUsers[1]._id // Receptionist
      },
      {
        guest: createdUsers[3]._id, // Jane Smith
        room: createdRooms[1]._id, // Double room
        checkIn: new Date('2024-02-20'),
        checkOut: new Date('2024-02-22'),
        numberOfGuests: {
          adults: 1,
          children: 0
        },
        totalAmount: 298, // 149 * 2 nights
        amountPaid: 150,
        paymentStatus: 'partial',
        bookingStatus: 'confirmed',
        specialRequests: 'Early check-in requested if possible.',
        createdBy: createdUsers[3]._id // Self-booking
      }
    ];

    await Booking.insertMany(sampleBookings);
    console.log('✅ Bookings created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@hotel.com / 123456');
    console.log('Receptionist: receptionist@hotel.com / 123456');
    console.log('Guest: guest@example.com / 123456');
    console.log('Guest 2: jane@example.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();