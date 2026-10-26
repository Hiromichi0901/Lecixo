import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navLinkClass = ({ isActive }) =>
  isActive
    ? 'text-sm font-medium text-emerald-400'
    : 'text-sm text-neutral-400 hover:text-neutral-200';

function Navbar() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const signedIn = Boolean(user) && !user.isAnonymous;

  async function handleLogOut() {
    try {
      await logOut();
      // Logging out drops back to the read-only anonymous session, so pages that
      // need an account are no longer reachable.
      navigate('/');
    } catch (error) {
      console.error('Log out failed:', error);
    }
  }

  return (
    <nav className="grid grid-cols-3 items-center px-12 py-4 bg-neutral-900 border-b border-neutral-800">
      <NavLink to="/" end className="flex items-center gap-2 hover:opacity-90">
        <div className="w-7 h-7 rounded-full bg-emerald-700"></div>
        <span className="text-lg font-semibold text-white">Lexico</span>
      </NavLink>

      <div className="flex items-center justify-center gap-9">
      <NavLink to="/" end className={navLinkClass}>
          Read
        </NavLink>
        <NavLink to="/dictionary" className={navLinkClass}>
          Dictionary
        </NavLink>
        <NavLink to="/vocabulary" className={navLinkClass}>
          Vocabulary
        </NavLink>
      </div>

      <div className="flex items-center justify-end gap-3">
        {signedIn ? (
          <>
            <span className="max-w-48 truncate text-sm text-neutral-400" title={user.email}>
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleLogOut}
              className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-400 hover:text-white"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Log in / Sign up
          </Link>
        )}
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
