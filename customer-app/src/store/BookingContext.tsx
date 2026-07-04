import { Coordinates, VehicleType } from '@useme/shared';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface BookingDraft {
  pickup?: { address?: string; coordinates: Coordinates };
  destination?: { address?: string; coordinates: Coordinates };
  vehicleType?: VehicleType;
  scheduledAt?: string;
  fareEstimate?: number;
}

interface BookingState {
  draft: BookingDraft;
  setDraft: Dispatch<SetStateAction<BookingDraft>>;
  activeBookingId: string | null;
  setActiveBookingId: (id: string | null) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingState | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>({});
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const value = useMemo<BookingState>(
    () => ({
      draft,
      setDraft,
      activeBookingId,
      setActiveBookingId,
      reset: () => setDraft({}),
    }),
    [draft, activeBookingId],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking(): BookingState {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
