import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, Wallet, BarChart3,
  ChevronLeft, X, Target, CalendarClock, Handshake, Calendar
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/wallets', label: 'Dompet', icon: Wallet },
  { to: '/budget', label: 'Anggaran', icon: PiggyBank },
  { to: '/goals', label: 'Tujuan', icon: Target },
  { to: '/bills', label: 'Tagihan', icon: CalendarClock },
  { to: '/debts', label: 'Utang Piutang', icon: Handshake },
  { to: '/calendar', label: 'Kalender', icon: Calendar },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl
          border-r border-primary-100 dark:border-dark-700
          overflow-hidden
          ${isOpen
            ? 'w-64 shadow-xl lg:shadow-md translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-20 w-64'
          }
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-primary-100 dark:border-dark-700 flex-shrink-0">
          <div className={`flex items-center ${!isOpen && 'lg:justify-center lg:w-full'}`}>
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className={`font-display font-bold text-lg bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all duration-500 ${!isOpen ? 'lg:max-w-0 lg:opacity-0 lg:ml-0' : 'lg:max-w-[200px] lg:opacity-100 ml-3'}`}>
              RekapKu
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-800 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={`
                  flex items-center px-3 py-2.5 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
                    : 'text-dark-500 dark:text-dark-400 hover:bg-primary-50/50 dark:hover:bg-dark-800 hover:text-primary-600 dark:hover:text-primary-400'
                  }
                  ${!isOpen && 'lg:justify-center lg:px-0'}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isOpen ? 'lg:max-w-0 lg:opacity-0 lg:ml-0' : 'lg:max-w-[200px] lg:opacity-100 ml-3'}`}>
                  {item.label}
                </span>
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-primary-600 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden lg:block z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse button (desktop only) */}
        <div className="hidden lg:flex px-3 pb-4">
          <button
            onClick={onToggle}
            className={`
              flex items-center w-full px-3 py-2.5 rounded-xl
              text-dark-400 hover:bg-primary-50 dark:hover:bg-dark-800 hover:text-primary-500
              transition-all duration-200
              ${!isOpen && 'justify-center px-0'}
            `}
          >
            <ChevronLeft className={`w-5 h-5 flex-shrink-0 transition-transform duration-500 ${!isOpen && 'rotate-180'}`} />
            <span className={`text-sm overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isOpen ? 'lg:max-w-0 lg:opacity-0 lg:ml-0' : 'lg:max-w-[200px] lg:opacity-100 ml-3'}`}>
              Tutup Sidebar
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
