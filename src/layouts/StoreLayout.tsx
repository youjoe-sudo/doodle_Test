import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileNav } from '../components/layout/MobileNav';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Homepage } from '../pages/store/Homepage';

export const StoreLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';

  return (
    <div className="min-h-screen flex flex-col w-full" style={{ backgroundColor: '#FDFBF7' }}>
      <Navbar />
      <main className="flex-1 w-full min-h-screen bg-[#FDFBF7] py-6 px-4">
        <ErrorBoundary>
          {isHome ? <Homepage /> : <Outlet />}
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};
