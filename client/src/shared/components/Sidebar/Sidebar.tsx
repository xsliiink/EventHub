import { Link } from 'react-router-dom'

export default function Sidebar(){
    return(
        <aside className='hidden md:flex w-64 bg-white border-r border-neutral-200 p-6 flex-col justify-between'>

            <div>
                <h1 className="text-xl font-semibold mb-10 tracking-tight">
                    EventHub
                </h1>

                <nav className="space-y-2 text-sm">
                    <Link
                        to='/'
                        className='block px-3 py-2 rounded-lg hover:bg-neutral-100 transition'
                    >
                        Feed
                    </Link>

                     <div className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
                        Groups (mock)
                    </div>

                     <div className="px-3 py-2 rounded-lg bg-green-50 text-green-700">
                        Messages (mock)
                    </div>

                    <div className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700">
                        Resources (mock)
                    </div>

                    <div className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700">
                        Settings (mock)
                    </div>
                </nav>
            </div>

            {/* Logout button */}
            <button className="text-xs text-neutral-400 hover:text-neutral-600 transition">
                Log out
            </button>
        </aside>
    )
}