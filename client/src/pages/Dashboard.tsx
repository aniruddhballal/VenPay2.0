import { useEffect, useState } from 'react';

import AnimatedLines from '../components/Partials/AnimatedLines'; // adjust path if needed

import { useSelector, useDispatch } from "react-redux";
import { BusinessCenter, RequestPage, Payment, Inventory, AccountCircle } from "@mui/icons-material";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import ProductManagement from "../components/Partials/ProductManagement";
import ProductList from "../components/Partials/ProductList";
import ProductRequests from "../components/Partials/ProductRequests";
import PaymentRequests from "../components/Partials/PaymentRequests";
import { toast } from "react-toastify";
import { setUser, logout, setLoading, setInitialized } from "../store/authSlice";

import {
  DashboardContainer, DashboardHeader, DashboardSubheader, NavigationContainer, NavigationButton,
  NavigationButton2, SectionContainer, LoadingContainer, LoadingSpinner, StyledButton,
  ProfileButton, ProfileImage } from "../styles/dashboardStyles";

// Define RootState type for useSelector
interface RootState {
  auth: {
    user: {
      _id: string;
      email: string;
      name: string;
      userType: "vendor" | "company";
      profilePicture?: string;
    } | null;
    isLoading: boolean;
    isInitialized: boolean;
  };
}

type VendorSection = 'product-management' | 'product-requests';
type CompanySection = 'product-list' | 'payment-requests';

export default function Dashboard() {
  const { user, isLoading, isInitialized } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State to track active section
  const [activeVendorSection, setActiveVendorSection] = useState<VendorSection>('product-management');
  const [activeCompanySection, setActiveCompanySection] = useState<CompanySection>('product-list');

  useEffect(() => {
    // Only fetch user data if not already initialized
    if (!isInitialized) {
      dispatch(setLoading(true));
     
      api
        .get("/auth/me")
        .then(res => {
          const fetchedUser = res.data.user;
          if (
            fetchedUser?._id &&
            fetchedUser?.email &&
            (fetchedUser.userType === "vendor" || fetchedUser.userType === "company")
          ) {
            dispatch(setUser(fetchedUser));
          } else {
            console.warn("User data incomplete or invalid:", fetchedUser);
            toast.error("Invalid user session. Please log in again.");
            dispatch(setUser(null));
            navigate("/login");
          }
        })
        .catch(err => {
          console.error("Auth check failed:", err);
          toast.error(err.response?.data?.error || "Authentication failed. Please log in again.");
          dispatch(setUser(null));
          navigate("/login");
        })
        .finally(() => {
          dispatch(setLoading(false));
          dispatch(setInitialized());
        });
    }
  }, [dispatch, navigate, isInitialized]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      dispatch(logout());
      navigate("/login");
    } catch (err: any) {
      console.error("Logout failed:", err);
      toast.error(err.response?.data?.error || "Logout failed. Please try again.");
    }
  };

  const goToProfile = () => {
    if (user?._id) {
      navigate(`/user/${user._id}`);
    }
  };

  const handleVendorSectionClick = (section: VendorSection) => {
    setActiveVendorSection(section);
  };

  const handleCompanySectionClick = (section: CompanySection) => {
    setActiveCompanySection(section);
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        Loading user data...
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  if (!user) {
    return (
      <LoadingContainer>
        Not authorized
      </LoadingContainer>
    );
  }

  // Determine background color based on active section
  const getBackgroundColor = () => {
    if (user.userType === "vendor") {
      return activeVendorSection === 'product-management' 
        ? 'from-emerald-900/20 via-emerald-800/20 to-emerald-900/20' 
        : 'from-blue-900/20 via-blue-800/20 to-blue-900/20';
    } else {
      return activeCompanySection === 'product-list' 
        ? 'from-emerald-900/20 via-emerald-800/20 to-emerald-900/20' 
        : 'from-blue-900/20 via-blue-800/20 to-blue-900/20';
    }
  };

  return (
    <div className={`relative w-full min-h-screen bg-gradient-to-br ${getBackgroundColor()}`}>
      <DashboardContainer>
      <div style={{ position: 'absolute', zIndex: 0, top: 0, left: 0, width: '100%', height: '100%' }}>
        <AnimatedLines 
          activeSet={
            user.userType === "vendor" 
              ? (activeVendorSection === 'product-management' ? 'set2' : 'set1')
              : (activeCompanySection === 'product-list' ? 'set2' : 'set1')
          } 
        />
      </div>      
      <DashboardHeader variant="h1">Welcome, {user.name}</DashboardHeader>
      
      <ProfileButton onClick={goToProfile}>
        {user.profilePicture ? (
          <ProfileImage src={user.profilePicture} alt={`${user.name}'s profile`} />
        ) : (
          <AccountCircle />
        )}
      </ProfileButton>
      <StyledButton buttontype="logout" onClick={handleLogout}>
        Logout
      </StyledButton>

      {user.userType === "vendor" && (
        <>
          <DashboardSubheader variant="h2">Vendor Dashboard</DashboardSubheader>
          
          <NavigationContainer>
            <NavigationButton 
              onClick={() => handleVendorSectionClick('product-management')}
              style={{ 
                opacity: activeVendorSection === 'product-management' ? 1 : 0.7,
                backgroundColor: activeVendorSection === 'product-management' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                borderColor: activeVendorSection === 'product-management' ? 'rgba(16, 185, 129, 0.3)' : 'transparent'
              }}
            >
              <Inventory />
              Product Management
            </NavigationButton>
            <NavigationButton2 
              onClick={() => handleVendorSectionClick('product-requests')}
              style={{ 
                opacity: activeVendorSection === 'product-requests' ? 1 : 0.7,
                backgroundColor: activeVendorSection === 'product-requests' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderColor: activeVendorSection === 'product-requests' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'
              }}
            >
              <RequestPage />
              Product Requests
            </NavigationButton2>
          </NavigationContainer>

          <SectionContainer>
            {activeVendorSection === 'product-management' && <ProductManagement />}
            {activeVendorSection === 'product-requests' && <ProductRequests />}
          </SectionContainer>
        </>
      )}

      {user.userType === "company" && (
        <>
          <DashboardSubheader variant="h2">Company Dashboard</DashboardSubheader>
          
          <NavigationContainer>
            <NavigationButton 
              onClick={() => handleCompanySectionClick('product-list')}
              style={{ 
                opacity: activeCompanySection === 'product-list' ? 1 : 0.7,
                backgroundColor: activeCompanySection === 'product-list' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                borderColor: activeCompanySection === 'product-list' ? 'rgba(16, 185, 129, 0.3)' : 'transparent'
              }}
            >
              <BusinessCenter />
              Product Catalog
            </NavigationButton>
            <NavigationButton2 
              onClick={() => handleCompanySectionClick('payment-requests')}
              style={{ 
                opacity: activeCompanySection === 'payment-requests' ? 1 : 0.7,
                backgroundColor: activeCompanySection === 'payment-requests' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderColor: activeCompanySection === 'payment-requests' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'
              }}
            >
              <Payment />
              Payment Requests
            </NavigationButton2>
          </NavigationContainer>

          <SectionContainer>
            {activeCompanySection === 'product-list' && <ProductList />}
            {activeCompanySection === 'payment-requests' && <PaymentRequests />}
          </SectionContainer>
        </>
      )}
    </DashboardContainer>
    </div>
  );
}