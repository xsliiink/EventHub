import type { SocialEvent, UpdateEventDTO, EventFormData } from '@shared/types';

const BASE_URL = '/api/events';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

export const eventsService = {
    getAll: async (location: string): Promise<SocialEvent[]> => {
        const params = new URLSearchParams(location ? {location} : {});
        const res = await fetch(`${BASE_URL}?${params.toString()}`);

        if(!res.ok) throw new Error('Failed to fetch');
        return res.json();
    },

    delete: async(id: number): Promise<void> => {
        const res = await fetch(`${BASE_URL}/delete/${id}`,{
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if(!res.ok) throw new Error('Delete failed');
    },

    create: async( values: EventFormData): Promise<SocialEvent> => {
        const data = new FormData();
        Object.entries(values).forEach(([key,value]) => {
            if (value !== null && value !== undefined){
                if(key === 'selectedHobbies' && Array.isArray(value)){
                    value.forEach(h => data.append('selectedHobbies[]',h))
                }else{
                    data.append(key,value as string | Blob);
                }
            }
        });

        const res = await fetch(`${BASE_URL}/create`,{
            method: 'POST',
            headers: getAuthHeaders(),
            body: data
        });

        if(!res.ok) throw new Error('Create failed');
        return res.json();
    },
    update: async(updatedData: UpdateEventDTO): Promise<SocialEvent> => {
        const data = new FormData();

        //filling out the FormData
        if(updatedData.title) data.append('title',updatedData.title);
        if(updatedData.date) data.append('date',updatedData.date);
        if (updatedData.description !== undefined) data.append('description', updatedData.description ?? '');
        if (updatedData.location !== undefined) data.append('location', updatedData.location ?? '');
        if (updatedData.eventImage) data.append('eventImage', updatedData.eventImage);

        //fetch request
        const res = await fetch(`${BASE_URL}/update/${updatedData.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: data
        });

        //response
        if (!res.ok) throw new Error('Update failed');
        return res.json();
    }
}