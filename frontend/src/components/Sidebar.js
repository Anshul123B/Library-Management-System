import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiBook,
  FiUsers,
  FiCreditCard,
  FiSend,
  FiRotateCcw,
  FiAlertTriangle,
  FiBarChart2,
  FiFilm,
  FiBookOpen,
} from 'react-icons/fi';
import './Sidebar.css';

/**
 * Sidebar - Navigation sidebar with role-based menu items
 */
const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  const adminLinks = [
    { path: '/', label: 'Dashboard', icon: <FiHome /> },
    { path: '/books', label: 'Books', icon: <FiBook /> },
    { path: '/movies', label: 'Movies', icon: <FiFilm /> },
    { path: '/users', label: 'Users', icon: <FiUsers /> },
    { path: '/memberships', label: 'Memberships', icon: <FiCreditCard /> },
    { path: '/issue-book', label: 'Issue Book', icon: <FiSend /> },
    { path: '/return-book', label: 'Return Book', icon: <FiRotateCcw /> },
    { path: '/active-issues', label: 'Active Issues', icon: <FiBookOpen /> },
    { path: '/overdue-books', label: 'Overdue Books', icon: <FiAlertTriangle /> },
    { path: '/reports', label: 'Reports', icon: <FiBarChart2 /> },
  ];

  const userLinks = [
    { path: '/', label: 'Dashboard', icon: <FiHome /> },
    { path: '/browse-books', label: 'Browse Books', icon: <FiBook /> },
    { path: '/browse-movies', label: 'Browse Movies', icon: <FiFilm /> },
    { path: '/my-issues', label: 'My Issued Books', icon: <FiBookOpen /> },
    { path: '/issue-book', label: 'Issue Book', icon: <FiSend /> },
    { path: '/return-book', label: 'Return Book', icon: <FiRotateCcw /> },
  ];

  const links = isAdmin() ? adminLinks : userLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-section-title">Navigation</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
