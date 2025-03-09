import React, { useEffect, useState } from 'react';
import { Container, LogoutBtn } from '../index';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import authService from '../../appwrite/auth';
import { AiFillHome } from 'react-icons/ai';

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchCurrentUser();
  }, [authStatus]);

  return (
    <header className="w-full py-4 shadow bg-gradient-to-r from-blue-500 to-indigo-500">
      <Container>
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/')}>
              <AiFillHome size={30} className="text-white hover:text-indigo-200" />
            </button>
          </div>
          <div>
            {authStatus && <LogoutBtn />}
          </div>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
