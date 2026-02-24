import EditEventModal from '../editModal/EditEventModal';
import EventGrid from '../EventGrid/EventGrid';

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
      <EventGrid 
        events={events}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        scrollRef={scrollRef}
        deleteEvent={deleteEvent}
        setEditingEvent={setEditingEvent}
        currentUserId={currentUserId}
        pendingEventIds={pendingEventIds}
      />

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
        className="fab-add-event"
        onClick={onCreateClick}
        title='Create Event'
      >
        +
      </button>
    </>
  );
}