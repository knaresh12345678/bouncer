import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Bouncer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  experience: string;
  hourlyRate: number;
  specialties: string[];
  availability: 'available' | 'busy' | 'offline';
  profileImage?: string;
  completedJobs: number;
  bio: string;
  location: string;
}

export interface BookingRequest {
  id: string;
  eventName: string;
  location: string;
  date: string;
  time: string;
  price: number;
  userId: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  description?: string;
  requiredBouncers?: number;
}

export interface BookingSelection {
  type: 'individual' | 'group';
  selectedBouncers: Bouncer[];
  requestId?: string;
}

interface BookingContextType {
  bouncers: Bouncer[];
  bookingRequests: BookingRequest[];
  createBookingRequest: (request: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => Promise<BookingRequest>;
  updateBookingRequest: (id: string, updates: Partial<BookingRequest>) => Promise<void>;
  getAvailableBouncers: () => Bouncer[];
  addBouncer: (bouncer: Omit<Bouncer, 'id'>) => Promise<Bouncer>;
  updateBouncer: (id: string, updates: Partial<Bouncer>) => Promise<void>;
  makeBooking: (selection: BookingSelection) => Promise<void>;
  getUserBookings: (userId: string) => BookingRequest[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [bouncers, setBouncers] = useState<Bouncer[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);

  // Initialize with some default bouncers for development
  useEffect(() => {
    const defaultBouncers: Bouncer[] = [
      {
        id: 'bouncer-1',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@example.com',
        rating: 4.9,
        experience: '8 years',
        hourlyRate: 45,
        specialties: ['Event Security', 'VIP Protection', 'Crowd Control'],
        availability: 'available',
        completedJobs: 156,
        bio: 'Professional security expert with extensive experience in high-profile events and VIP protection.',
        location: 'Downtown'
      },
      {
        id: 'bouncer-2',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah@example.com',
        rating: 4.8,
        experience: '6 years',
        hourlyRate: 40,
        specialties: ['Wedding Security', 'Corporate Events', 'Party Security'],
        availability: 'available',
        completedJobs: 89,
        bio: 'Specialized in providing discrete and professional security for special occasions.',
        location: 'Midtown'
      },
      {
        id: 'bouncer-3',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david@example.com',
        rating: 4.7,
        experience: '10 years',
        hourlyRate: 50,
        specialties: ['Corporate Security', 'Executive Protection', 'Event Management'],
        availability: 'available',
        completedJobs: 203,
        bio: 'Veteran security professional with a decade of experience in corporate and executive protection.',
        location: 'Business District'
      },
      {
        id: 'bouncer-4',
        firstName: 'Alex',
        lastName: 'Chen',
        email: 'alex@example.com',
        rating: 4.6,
        experience: '5 years',
        hourlyRate: 38,
        specialties: ['Night Club Security', 'Private Parties', 'Venue Security'],
        availability: 'busy',
        completedJobs: 67,
        bio: 'Young and energetic security professional specializing in nightlife and party environments.',
        location: 'Entertainment District'
      },
      {
        id: 'bouncer-5',
        firstName: 'Lisa',
        lastName: 'Rodriguez',
        email: 'lisa@example.com',
        rating: 4.9,
        experience: '7 years',
        hourlyRate: 42,
        specialties: ['Female Security', 'Celebrity Protection', 'Event Coordination'],
        availability: 'available',
        completedJobs: 124,
        bio: 'Professional female security expert providing specialized protection and coordination services.',
        location: 'Uptown'
      }
    ];

    // Load from localStorage or use defaults
    const savedBouncers = localStorage.getItem('bouncer_app_bouncers');
    const savedRequests = localStorage.getItem('bouncer_app_requests');

    if (savedBouncers) {
      try {
        setBouncers(JSON.parse(savedBouncers));
      } catch (error) {
        console.error('Error loading bouncer data:', error);
        setBouncers(defaultBouncers);
      }
    } else {
      setBouncers(defaultBouncers);
    }

    if (savedRequests) {
      try {
        setBookingRequests(JSON.parse(savedRequests));
      } catch (error) {
        console.error('Error loading booking requests:', error);
        setBookingRequests([]);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('bouncer_app_bouncers', JSON.stringify(bouncers));
  }, [bouncers]);

  useEffect(() => {
    localStorage.setItem('bouncer_app_requests', JSON.stringify(bookingRequests));
  }, [bookingRequests]);

  const createBookingRequest = async (requestData: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>): Promise<BookingRequest> => {
    const newRequest: BookingRequest = {
      ...requestData,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBookingRequests(prev => [...prev, newRequest]);
    return newRequest;
  };

  const updateBookingRequest = async (id: string, updates: Partial<BookingRequest>): Promise<void> => {
    setBookingRequests(prev =>
      prev.map(request =>
        request.id === id ? { ...request, ...updates } : request
      )
    );
  };

  const getAvailableBouncers = (): Bouncer[] => {
    return bouncers.filter(bouncer => bouncer.availability === 'available');
  };

  const addBouncer = async (bouncerData: Omit<Bouncer, 'id'>): Promise<Bouncer> => {
    const newBouncer: Bouncer = {
      ...bouncerData,
      id: `bouncer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setBouncers(prev => [...prev, newBouncer]);
    return newBouncer;
  };

  const updateBouncer = async (id: string, updates: Partial<Bouncer>): Promise<void> => {
    setBouncers(prev =>
      prev.map(bouncer =>
        bouncer.id === id ? { ...bouncer, ...updates } : bouncer
      )
    );
  };

  const makeBooking = async (selection: BookingSelection): Promise<void> => {
    // In a real app, this would create actual bookings
    // For now, we'll just log the selection
    console.log('Booking made:', selection);

    // Mark selected bouncers as busy
    const bouncerIds = selection.selectedBouncers.map(b => b.id);
    setBouncers(prev =>
      prev.map(bouncer =>
        bouncerIds.includes(bouncer.id)
          ? { ...bouncer, availability: 'busy' as const }
          : bouncer
      )
    );

    // Update the related booking request if available
    if (selection.requestId) {
      await updateBookingRequest(selection.requestId, { status: 'accepted' });
    }
  };

  const getUserBookings = (userId: string): BookingRequest[] => {
    return bookingRequests.filter(request => request.userId === userId);
  };

  const value: BookingContextType = {
    bouncers,
    bookingRequests,
    createBookingRequest,
    updateBookingRequest,
    getAvailableBouncers,
    addBouncer,
    updateBouncer,
    makeBooking,
    getUserBookings
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};