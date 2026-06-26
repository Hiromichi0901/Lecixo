import { NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }) =>
  isActive
    ? 'text-sm font-medium text-emerald-400'
    : 'text-sm text-neutral-400 hover:text-neutral-200';

function Navbar() {
  return (
    <nav className="grid grid-cols-3 items-center px-12 py-4 bg-neutral-900 border-b border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-emerald-700"></div>
        <span className="text-lg font-semibold text-white">Lexico</span>
      </div>

      <div className="flex items-center justify-center gap-9">
        <NavLink to="/" end className={navLinkClass}>
          Read
        </NavLink>
        <NavLink to="/vocabulary" className={navLinkClass}>
          Vocabulary
        </NavLink>
        <NavLink to="/quiz" className={navLinkClass}>
          Quiz
        </NavLink>
      </div>

      <div className="flex items-center justify-end gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100"></div>
        <button
          type="button"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
          aria-label="Menu"
        >
          <span className="text-lg leading-none tracking-widest">···</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
