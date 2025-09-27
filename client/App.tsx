import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/hooks/useAuth";
import Plans from "@/pages/Plans";
import About from "@/pages/About";
import FAQs from "@/pages/FAQs";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Risk from "@/pages/Risk";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Forgot from "@/pages/Forgot";
import Reset from "@/pages/Reset";
import AdminBootstrap from "@/pages/AdminBootstrap";
import { UserShell, AdminShell } from "@/components/layout/AppShell";
import UserOverview from "@/pages/app/Overview";
import UserInvest from "@/pages/app/Invest";
import UserWallet from "@/pages/app/Wallet";
import UserTransactions from "@/pages/app/Transactions";
import UserPayouts from "@/pages/app/Payouts";
import UserWithdrawals from "@/pages/app/Withdrawals";
import UserReferrals from "@/pages/app/Referrals";
import UserKYC from "@/pages/app/KYC";
import UserSupport from "@/pages/app/Support";
import UserProfile from "@/pages/app/Profile";
import AdminOverview from "@/pages/admin/Overview";
import AdminLogin from "@/pages/admin/Login";
import AdminPlans from "@/pages/admin/Plans";
import AdminInvestments from "@/pages/admin/Investments";
import AdminWallet from "@/pages/admin/Wallet";
import AdminPayouts from "@/pages/admin/Payouts";
import AdminWithdrawals from "@/pages/admin/Withdrawals";
import AdminReferrals from "@/pages/admin/Referrals";
import AdminReports from "@/pages/admin/Reports";
import AdminCMS from "@/pages/admin/CMS";
import AdminSettings from "@/pages/admin/Settings";
import AdminSupport from "@/pages/admin/Support";
import AdminAudit from "@/pages/admin/Audit";
import AdminUsers from "@/pages/admin/Users";
import AdminKyc from "@/pages/admin/KYC";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/about" element={<About />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/risk" element={<Risk />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin-bootstrap" element={<AdminBootstrap />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/app" element={<UserShell />}>
                <Route index element={<UserOverview />} />
                <Route path="invest" element={<UserInvest />} />
                <Route path="wallet" element={<UserWallet />} />
                <Route path="transactions" element={<UserTransactions />} />
                <Route path="payouts" element={<UserPayouts />} />
                <Route path="withdrawals" element={<UserWithdrawals />} />
                <Route path="referrals" element={<UserReferrals />} />
                <Route path="kyc" element={<UserKYC />} />
                <Route path="support" element={<UserSupport />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>

              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<AdminOverview />} />
                <Route path="dashboard" element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="plans" element={<AdminPlans />} />
                <Route path="investments" element={<AdminInvestments />} />
                <Route path="wallet" element={<AdminWallet />} />
                <Route path="payouts" element={<AdminPayouts />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
                <Route path="referrals" element={<AdminReferrals />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="cms" element={<AdminCMS />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="kyc" element={<AdminKyc />} />
                <Route path="audit" element={<AdminAudit />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
