import { createBrowserRouter } from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import ForgotPassword from "./features/auth/pages/ForgotPassword"
import Protected from './features/auth/components/Protected'
import Home from "./features/auth/pages/Home"
import Interview from "./features/interview/pages/Interview"
import Settings from "./features/auth/pages/Settings"


const router = createBrowserRouter([
   {
      path: "/login",
      element: <Login />
   },

   {
      path: "/register",
      element: <Register />
   },
   {
      path: "/forgot-password",
      element: <ForgotPassword />
   },
   {
      path: "/",
      element: <Protected><Home></Home></Protected>
   },
   {
      path: "/settings",
      element: <Protected><Settings></Settings></Protected>
   },
   {
      path: "/interview",
      element: <Protected><Interview></Interview></Protected>
   },
   {
      path: "/interview/:id",
      element: <Protected><Interview></Interview></Protected>
   }
])

export default router