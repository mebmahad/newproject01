import React from 'react';
import { Container, ItemBtn, Logo, LogoutBtn } from '../index';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProcurementBtn from './ProcurementBtn';
import HeadBtn from './HeadBtn';

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Home',
      slug: '/',
      active: true,
    },
    {
      name: 'Login',
      slug: '/login',
      active: !authStatus,
    },
    {
      name: 'Signup',
      slug: '/signup',
      active: !authStatus,
    },
    {
      name: 'All Complaints',
      slug: '/all-posts',
      active: true,
    },
    {
      name: 'Add Complaints',
      slug: '/add-post',
      active: true,
    },
    {
      name: 'Manage Store',
      slug: '/store-manage',
      active: true,
    },
  ];

  return (
    <header className="w-full py-3 shadow bg-gray-500">
      <Container>
        <nav className="flex flex-wrap items-center justify-between">
          <div className="mr-4">
            <Link to="/">
              <Logo width="30px" />
            </Link>
          </div>
          <ul className="flex flex-wrap justify-end w-full">
            {navItems.map((item) => (
              item.active ? (
                <li key={item.name} className="mr-2 mb-2">
                  <button
                    onClick={() => navigate(item.slug)}
                    className={`inline-block px-4 py-2 text-sm duration-200 rounded-full 
                      ${window.location.pathname === item.slug ? 'bg-blue-300 text-white' : 'text-gray-200 hover:bg-blue-100'}`}
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            ))}
            {authStatus && (
              <li className="mr-2 mb-2">
                <LogoutBtn />
              </li>
            )}
            {authStatus && (
              <li className="mr-2 mb-2">
                <ProcurementBtn />
              </li>
            )}
            {authStatus && (
              <li className="mr-2 mb-2">
                <HeadBtn />
              </li>
            )}
            {authStatus && (
              <li className="mr-2 mb-2">
                <ItemBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
