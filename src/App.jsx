import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "./context/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useReducer } from "react";
import { reducer, initialState } from "./reducers/UseReducer";
import UserContext from "./context/UserContext";

import "./App.css";

import "./CSS/components/Navbar.css";
import "./CSS/components/Footer.css";
import "./CSS/components/FloatingActionButton.css";

import "./CSS/admin/AdminSignup.css";
import "./CSS/admin/Subscriptionplans.css";
import "./CSS/admin/NewsArticle.css";
// import "./CSS/admin/Login.css"
// import "./CSS/admin/EmailVerification.css"
// import "./CSS/admin/ForgotPassword.css"

import "./CSS/users/UserSignup.css";
// import "./CSS/user/Login.css"
// import "./CSS/user/EmailVerification.css"
// import "./CSS/user/ForgotPassword.css"
// import "./CSS/user/Dashboard.css"
// import "./CSS/user/UserPortal.css"

import "./CSS/public/Profile.css";
import "./CSS/public/HomePage.css";
import "./CSS/public/NewsPage.css";
import "./CSS/public/NewsArticle.css";
import "./CSS/public/Subscriptionplans.css";

// import "./CSS/Error/Error.css"

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingActionButton from "./components/FloatingActionButton";

import HomePage from "./pages/public/HomePage";
import UserSubscriptionplans from "./pages/public/Subscriptionplans";
import NewsPage from "./pages/public/News/NewsArticle";

import UserSignup from "./pages/users/Signup";
import UserLogin from "./pages/users/Login";
// import UserEmailVerification from './pages/users/EmailVerification';
// import UserForgotPassword from './pages/users/ForgotPassword';
import UserMyProfile from "./pages/users/Profile";
// import UserDashboard from './pages/users/Dashboard';

// import UserAlerts from './pages/user/Alerts';
// import UserMaintenanceSchedule from './pages/user/MaintenanceSchedule';
// import UserMyEquipment from './pages/user/MyEquipment';
// import UserMyWorkOrders from './pages/user/MyWorkOrders';

import AdminSignup from "./pages/admin/Signup";
import AdminLogin from "./pages/admin/Login";
import AdminMyProfile from "./pages/admin/Profile";
import AdminSubscriptionplans from "./pages/admin/Subscriptionplans";
import AdminNewsArticle from "./pages/admin/NewsArticle";

// import AdminEmailVerification from './pages/auth/admin/EmailVerification';
// import AdminForgotPassword from './pages/auth/admin/ForgotPassword';

// import Error404 from './pages/Error/Error';

function App() {
  const { isDarkMode } = useContext(ThemeContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "LOAD_USER" });
  }, []);

  return (
    <>
      <UserContext.Provider value={{ state, dispatch }}>
        <div className={isDarkMode ? "dark" : "light"}>
          <Router>
            {/* <AdminSidebar /> */}

            <Navbar />
            <div className="navbar-spacer" />
            <FloatingActionButton />

            {/* <AdminNavSidebar /> */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/news" element={<NewsPage />} />
              {/* <Route path="/pricing" element={<SubsriptionPlans />} />
            <Route path="/GlobalPrivacyPolicy" element={<GlobalPrivacyPolicy />} />
            <Route path="/TermsofService" element={<TermsofService />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/our-services" element={<OurServices />} />
            <Route path="/my-api-reference" element={<APIReference />} />
            <Route path="/changelog" element={<Changelogs />} />
            <Route path="/product/authentication" element={<ProductAuthentication />} />
            <Route path="/product/sso" element={<ProductSingleSignOn />} />
            <Route path="/product/mfa" element={<MultiFactorAuth />} />
            <Route path="/product/api" element={<APIAccess />} />
            <Route path="/integration-guides" element={<IntegrationGuide />} />
            <Route path="/public-roadmap" element={<PublicRoadmap />} />
            <Route path="/schedule-demo" element={<ScheduleDemo />} />
            <Route path="/watch-demo" element={<WatchDemo />} /> */}

              <Route path="/user/signup" element={<UserSignup />} />
              <Route path="/user/login" element={<UserLogin />} />
              {/*  <Route path="/user/email-verification" element={<UserEmailVerification />} />
            <Route path="/user/forgot-password" element={<UserForgotPassword />} />*/}
              <Route path="/user/my-profile" element={<UserMyProfile />} />
              <Route path="/user/subscription-plans" element={<UserSubscriptionplans />} />
              {/* <Route path="/user/dashboard" element={<UserDashboard />} />

            <Route path="/user/alerts" element={<UserAlerts />} />
            <Route path="/user/maintenance-schedule" element={<UserMaintenanceSchedule />} />
            <Route path="/user/my-equipment" element={<UserMyEquipment />} />
            <Route path="/user/my-work-order" element={<UserMyWorkOrders />} />*/}

              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/my-profile" element={<AdminMyProfile />} />
              <Route path="/admin/subscription-plans" element={<AdminSubscriptionplans />} />
              <Route path="/admin/news-article-list" element={<AdminNewsArticle />} />

              {/*  <Route path="/admin/email-verification" element={<AdminEmailVerification />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} /> */}

              {/* 
            <Route path="*" element={<Error404 />} /> */}
            </Routes>

            <Footer />
          </Router>
        </div>
      </UserContext.Provider>
    </>
  );
}

export default App;
