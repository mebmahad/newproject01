import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import authService from "./appwrite/auth";
import { login, logout } from "./store/authSlice";
import { Footer, Header } from './components';
import { Outlet } from 'react-router-dom';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authService.getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login({ userData }));
        } else {
          dispatch(logout());
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return !loading ? (
    <div className="min-h-screen flex flex-col bg-gray-400">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow">
          <Outlet />
        </div>
      </main>
      <Footer className="mt-4" />
    </div>
  ) : (
    <div className="flex justify-center items-center min-h-screen bg-gray-400">
      <span className="text-lg text-gray-700">Loading...</span>
    </div>
  );
}

export default App;
