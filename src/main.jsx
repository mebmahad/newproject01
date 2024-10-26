import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import store from './store/store.js';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home.jsx';
import { AuthLayout, Login } from './components/index.js';
import AddPost from "./pages/AddPost";
import Signup from './pages/Signup';
import EditPost from "./pages/EditPost";
import Post from "./pages/Post";
import AllPosts from "./pages/AllPosts";
import EditProcure from './pages/EditProcure.jsx';
import AllProcures from "./pages/AllProcures";
import AddProcure from "./pages/AddProcure";
import Procure from "./pages/Procure";
import EditItem from './pages/EditItem.jsx';
import AllItems from "./pages/AllItems";
import AddItem from "./pages/AddItem.jsx";
import Item from "./pages/Item.jsx";
import EditVendor from './pages/EditVendor.jsx';
import AllVendors from "./pages/AllVendors";
import AddVendor from "./pages/AddVendor.jsx";
import Vendor from "./pages/Vendor.jsx";
import AddPo from './pages/AddPo.jsx';
import EditPo from './pages/EditPo.jsx';
import AllPos from "./pages/AllPos";
import Po from "./pages/Po.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthLayout authentication={false}>
            <Signup />
          </AuthLayout>
        ),
      },
      {
        path: "/all-posts",
        element: (
            <AllPosts />
        ),
      },
      {
        path: "/add-post",
        element: (
          <AuthLayout authentication>
            {""}
            <AddPost />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-post/:id", // Changed from slug to id
        element: (
          <AuthLayout authentication>
            {""}
            <EditPost />
          </AuthLayout>
        ),
      },
      {
        path: "/post/:id", // Changed from slug to id
        element: <Post />,
      },
      {
        path: "/all-procures",
        element: (
          <AuthLayout authentication>
            {""}
            <AllProcures />
          </AuthLayout>
        ),
      },
      {
        path: "/add-procure/:id",
        element: (
          <AuthLayout authentication>
            {""}
            <AddProcure />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-procure/:id", // Changed from slug to id
        element: (
          <AuthLayout authentication>
            {""}
            <EditProcure />
          </AuthLayout>
        ),
      },
      {
        path: "/procure/:id", // Changed from slug to id
        element: <Procure />,
      },

      {
        path: "/all-items",
        element: (
          <AuthLayout authentication>
          {""}
          <AllItems />
        </AuthLayout>
        ),
      },
      {
        path: "/add-item",
        element: (
          <AuthLayout authentication>
            {""}
            <AddItem />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-item/:id", // Changed from slug to id
        element: (
          <AuthLayout authentication>
            {""}
            <EditItem />
          </AuthLayout>
        ),
      },
      {
        path: "/item/:id", // Changed from slug to id
        element: <Item />,
      },
      {
        path: "/all-vendors",
        element: (
          <AuthLayout authentication>
          {""}
          <AllVendors />
        </AuthLayout>
        ),
      },
      {
        path: "/add-vendor",
        element: (
          <AuthLayout authentication>
            {""}
            <AddVendor />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-vendor/:id", // Changed from slug to id
        element: (
          <AuthLayout authentication>
            {""}
            <EditVendor />
          </AuthLayout>
        ),
      },
      {
        path: "/vendor/:id", // Changed from slug to id
        element: <Vendor />,
      },
      {
        path: "/all-pos",
        element: (
          <AuthLayout authentication>
          {""}
          <AllPos />
        </AuthLayout>
        ),
      },
      {
        path: "/add-po",
        element: (
          <AuthLayout authentication>
            {""}
            <AddPo />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-po/:id", // Changed from slug to id
        element: (
          <AuthLayout authentication>
            {""}
            <EditPo />
          </AuthLayout>
        ),
      },
      {
        path: "/po/:id", // Changed from slug to id
        element: <Po />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
