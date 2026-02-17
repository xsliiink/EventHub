import { GiFlexibleLamp } from 'react-icons/gi';
import Sidebar from '../shared/components/Sidebar/Sidebar'
import TopBar from '../shared/components/TopBar/TopBar'

interface MainLayoutProps{
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps){
    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Sidebar */}
            <Sidebar/>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">

            {/* Topbar */}
            <TopBar/>

            {/* content */}
            <main className='flex-1 overflow-y-auto'>
                <div className="max-w-6xl mx-auto px-8 py-8">
                    {children}
                </div>
            </main>

            </div>


        </div>
    )
}