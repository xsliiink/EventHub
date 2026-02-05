import { useEffect, useState } from 'react';
import type { Hobby } from '../../../shared/types';

export function useHobbies(){
    const [hobbies,setHobbies] = useState<Hobby[]>([]);
    const [isLoading,setIsLoading] = useState(true);

    //hobbies from server
    useEffect(() =>{
        const loadHobbies = async () => {
            try{
                setIsLoading(true);
                const res = await fetch('/api/hobbies')
                const data = await res.json();
                setHobbies(data); 
            }catch(err:unknown){
                console.error('Error loading hobbies', err);
            }finally{
                setIsLoading(false);
            }
        };
        
        loadHobbies();
    },[]);

    return {
        hobbies,
        isLoading,
    };
}