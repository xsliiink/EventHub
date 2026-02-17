import EventCard from '../EventCard/EventCard';
import EditEventModal from '../editModal/EditEventModal';

import type { SocialEvent,UpdateEventDTO } from '@shared/types';
import type { FetchNextPageOptions } from '@tanstack/react-query';

interface FeedSectionProps {
  events: SocialEvent[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<unknown>;
  deleteEvent: (id: number) => void;
  updateEvent: (data: UpdateEventDTO) => Promise<SocialEvent>;
  pendingEventIds: Set<number>;
  currentUserId: number | undefined;
  editingEvent: SocialEvent | null;
  setEditingEvent: React.Dispatch<React.SetStateAction<SocialEvent | null>>;
  onCreateClick: () => void;
  scrollRef: (node?: Element | null | undefined) => void;
}

export default function FeedSection({
  events,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  deleteEvent,
  updateEvent,
  pendingEventIds,
  currentUserId,
  editingEvent,
  setEditingEvent,
  onCreateClick,
  scrollRef,
}: FeedSectionProps) {

  return (
    <>
      {isLoading && !isFetchingNextPage && <p>Loading events...</p>}

      {isError && <p>Could not load events.</p>}

      {!isLoading && events.length === 0 && <p>No events found</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onDelete={deleteEvent}
            onEdit={(ev) => setEditingEvent(ev)}
            currentUserId={currentUserId}
            isPending={pendingEventIds.has(event.id)}
          />
        ))}
      </div>

      <div ref={scrollRef} className="h-10 text-center">
        {isFetchingNextPage && <p>Loading more...</p>}
        {!hasNextPage && events.length > 0 && <p>You've reached the end 🏁</p>}
      </div>

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={async (data) => {
            await updateEvent(data);
            setEditingEvent(null);
          }}
        />
      )}

      <button
        className="fixed bottom-8 right-8 w-12 h-12 bg-black text-white rounded-full"
        onClick={onCreateClick}
      >
        +
      </button>
    </>
  );
}