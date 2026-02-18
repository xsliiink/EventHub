import Sidebar from '../shared/components/Sidebar/Sidebar'
import TopBar from '../shared/components/TopBar/TopBar'
import './MainLayout.css';

interface MainLayoutProps{
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="layout-wrapper">
      <aside className="layout-sidebar">
        <Sidebar />
      </aside>

      <div className="layout-content-area">
        <header className="layout-header">
          <TopBar />
        </header>

        <main className="layout-main">
          <div className="layout-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}