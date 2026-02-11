import type { PaginatedResponse } from '@shared/types';

export const getPaginationParams = (query: {page? : string;limit? : string}) => {
    const page = Math.max(1,parseInt(query.page || '1'));
    const limit = Math.max(1,Math.min(100,parseInt(query.limit || '10')));
    const offset =(page - 1) * limit;

    return {page,limit,offset}
};

export const formatPaginatedResponse = <T>(
    data: T[],
    page: number,
    limit: number,
): PaginatedResponse<T> => {
    return {
        data,
        nextPage: data.length === limit ? page + 1 : null,
    }
}
