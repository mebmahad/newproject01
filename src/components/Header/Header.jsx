import React, {useEffect, useState} from 'react';
import { Container, ItemBtn, Logo, LogoutBtn, BudgetBtn, ManagestoreBtn } from '../index';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProcurementBtn from './ProcurementBtn';
import HeadBtn from './HeadBtn';
import AllposBtn from './AllposBtn';
import authService from '../../appwrite/auth';
import AddcomplaintsBtn from './AddcomplaintsBtn';
import AllcomplaintsBtn from './AllcomplaintsBtn';

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        console.log("Fetched User:", user); // Debugging output
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchCurrentUser();
  }, [authStatus]);

  const isAuthor = currentUser?.name;

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
            {(isAuthor==='Procurement'||isAuthor==='Admin'||isAuthor==='Technician') && (
              <li className="mr-2 mb-2">
                <AddcomplaintsBtn />
              </li>
            )}
            {(isAuthor==='Procurement'||isAuthor==='Admin'||isAuthor==='Technician') && (
              <li className="mr-2 mb-2">
                <AllcomplaintsBtn />
              </li>
            )}
            {(isAuthor==='Budget') && (
              <li className="mr-2 mb-2">
                <BudgetBtn />
              </li>
            )}
            {(isAuthor==='Procurement'||isAuthor==='Admin') && (
              <li className="mr-2 mb-2">
                <ProcurementBtn />
              </li>
            )}
            {(isAuthor==='Procurement'||isAuthor==='Admin') && (
              <li className="mr-2 mb-2">
                <AllposBtn />
              </li>
            )}
            {(isAuthor==='Procurement'||isAuthor==='Admin'||isAuthor==='Store') && (
              <li className="mr-2 mb-2">
                <ManagestoreBtn />
              </li>
            )}
            {(isAuthor==='Procurement'||isAuthor==='Admin') && (
              <li className="mr-2 mb-2">
                <HeadBtn />
              </li>
            )}
            {(isAuthor==='Procurement'||isAuthor==='Admin'||isAuthor==='Store') && (
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
