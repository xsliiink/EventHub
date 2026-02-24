import EventCard from '../EventCard/EventCard';
import type { SocialEvent } from '@shared/types';
import './EventGrid.css';

interface EventGridProps {
  events: SocialEvent[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  scrollRef: (node?: Element | null) => void;
  deleteEvent: (id: number) => void;
  setEditingEvent: (event: SocialEvent) => void;
  currentUserId?: number;
  pendingEventIds: Set<number>;
}

export default function EventGrid({
  events,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  scrollRef,
  deleteEvent,
  setEditingEvent,
  currentUserId,
  pendingEventIds
}: EventGridProps) {

    if (isError) return <div className="grid-message error">Could not load events.</div>;
    if (isLoading && !isFetchingNextPage) return <div className="grid-message">Loading events...</div>;
    if (!isLoading && events.length === 0) return <div className="grid-message">No events found.</div>;

    return (
    <div className="event-grid-wrapper">
      <div className="event-grid-container">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onDelete={deleteEvent}
            onEdit={setEditingEvent}
            currentUserId={currentUserId}
            isPending={pendingEventIds.has(event.id)}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={scrollRef} className="pagination-trigger">
        {isFetchingNextPage && <span>Loading more...</span>}
        {!hasNextPage && events.length > 0 && <span>You've reached the end 🏁</span>}
      </div>
    </div>
  );
}