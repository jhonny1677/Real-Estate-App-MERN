import HomePage from "./routes/homePage/homePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ListPage from "./routes/listPage/listPage";
import { Layout, RequireAuth, RequireAdmin } from "./routes/layout/layout";
import SinglePage from "./routes/singlePage/singlePage";
import ProfilePage from "./routes/profilePage/profilePage";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import NewPostPage from "./routes/newPostPage/newPostPage";
import EditPostPage from "./routes/editPost/editPost";
import ForgotPassword from "./routes/forgotPassword/forgotPassword";
import ResetPassword from "./routes/resetPassword/resetPassword";
import VerifyEmail from "./routes/verifyEmail/verifyEmail";
import FavoritesPage from "./routes/favoritesPage/favoritesPage";
import ComparePage from "./routes/comparePage/comparePage";
import NotificationSettings from "./routes/notificationSettings/NotificationSettings";
import NotificationsPage from "./routes/notificationsPage/NotificationsPage";
import SavedSearches from "./components/savedSearches/SavedSearches";
import TestNotifications from "./routes/testNotifications/TestNotifications";
import UpcomingVisits from "./components/upcomingVisits/UpcomingVisits";
import AdminDashboard from "./routes/adminDashboard/AdminDashboard";

import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";
import ChatListPage from "./routes/chatListPage/chatListPage";
import About from "./routes/About/About";
import Contact from "./routes/Contact/Contact";
import Agents from "./routes/Agents/Agents";
import RecommendationsPage from "./routes/RecommendationsPage/RecommendationsPage";
import RecentlyViewedPage from "./routes/recentlyViewed/RecentlyViewedPage";
import SSOCallback from "./routes/ssoCallback/SSOCallback";
import SyncUser from "./routes/ssoCallback/SyncUser";

function App() {
  console.log("Estate App is loading properly...");

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <HomePage /> },
        { path: "/list", element: <ListPage />, loader: listPageLoader },
        { path: "/login", element: <Login /> },
        { path: "/register", element: <Register /> },
        { path: "/forgot-password", element: <ForgotPassword /> },
        { path: "/reset-password", element: <ResetPassword /> },
        { path: "/verify-email", element: <VerifyEmail /> },
        { path: "/about", element: <About /> },
        { path: "/contact", element: <Contact /> },
        { path: "/agents", element: <Agents /> },
        { path: "/favorites", element: <FavoritesPage /> },
        { path: "/compare", element: <ComparePage /> },
        { path: "/saved-searches", element: <SavedSearches /> },
        { path: "/upcoming-visits", element: <UpcomingVisits /> },
        { path: "/notifications", element: <NotificationsPage /> },
        { path: "/notification-settings", element: <NotificationSettings /> },
        { path: "/test-notifications", element: <TestNotifications /> },
        { path: "/property/:id", element: <SinglePage />, loader: singlePageLoader },
        { path: "/recommendations/:propertyId", element: <RecommendationsPage /> },
        { path: "/recently-viewed", element: <RecentlyViewedPage /> },
        { path: "/sso-callback", element: <SSOCallback /> },
        { path: "/sync-user", element: <SyncUser /> },
      ],
    },
    {
      path: "/",
      element: <RequireAdmin />,
      children: [
        { path: "/admin", element: <AdminDashboard /> },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        { path: "/profile", element: <ProfilePage />, loader: profilePageLoader },
        { path: "/profile/update", element: <ProfileUpdatePage /> },
        { path: "/chats", element: <ChatListPage /> },
        { path: "/add", element: <NewPostPage /> },
        { path: "/edit/:id", element: <EditPostPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
