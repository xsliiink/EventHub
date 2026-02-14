import type { InfiniteData } from '@tanstack/react-query';
import type { PaginatedResponse, SocialEvent } from '@shared/types';

export function updateInfiniteData(
    oldData: InfiniteData<PaginatedResponse<SocialEvent>> | undefined,
    updater : (events: SocialEvent[]) => SocialEvent[]
): InfiniteData<PaginatedResponse<SocialEvent>> | undefined {
    if (!oldData) return oldData;
    return{
        ...oldData,
        pages:oldData.pages.map((page) =>({
            ...page,
            data : updater(page.data),
        }))
    }
}
