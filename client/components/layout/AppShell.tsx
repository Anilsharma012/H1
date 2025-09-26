import { Link, NavLink, Outlet } from "react-router-dom";
import { PropsWithChildren } from "react";
import { useAuth } from "@/hooks/useAuth";

function Item({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm ${isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-foreground"}`
      }
    >
      {children}
    </NavLink>
  );
}

export function UserShell({ children }: PropsWithChildren) {
  return (
    <div className="container py-6 grid md:grid-cols-[240px_1fr] gap-6">
      <aside className="rounded-xl border p-3 h-fit sticky top-24">
        <div className="font-semibold mb-2">User</div>
        <Item to="/app">Overview</Item>
        <Item to="/app/invest">Start Investment</Item>
        <Item to="/app/wallet">Wallet</Item>
        <Item to="/app/transactions">Transactions</Item>
        <Item to="/app/payouts">Payouts</Item>
        <Item to="/app/withdrawals">Withdrawals</Item>
        <Item to="/app/referrals">Referrals</Item>
        <Item to="/app/kyc">KYC</Item>
        <Item to="/app/support">Support</Item>
        <Item to="/app/profile">Profile</Item>
      </aside>
      <section>{children || <Outlet />}</section>
    </div>
  );
}

export function AdminShell({ children }: PropsWithChildren) {
  const { logout } = useAuth();
  const doLogout = async () => {
    try {
      localStorage.removeItem("admin_token");
      await logout();
    } finally {
      window.location.href = "/admin/login";
    }
  };
  return (
    <div className="container py-6 grid md:grid-cols-[240px_1fr] gap-6">
      <aside className="rounded-xl border p-3 h-fit sticky top-24">
        <div className="font-semibold mb-2">Admin</div>
        <Item to="/admin">Overview</Item>
        <Item to="/admin/users">Users & KYC</Item>
        <Item to="/admin/plans">Plans & Rules</Item>
        <Item to="/admin/investments">Investments</Item>
        <Item to="/admin/wallet">Wallet & Ledger</Item>
        <Item to="/admin/payouts">Payouts</Item>
        <Item to="/admin/withdrawals">Withdrawals</Item>
        <Item to="/admin/referrals">Referrals</Item>
        <Item to="/admin/reports">Reports</Item>
        <Item to="/admin/cms">CMS</Item>
        <Item to="/admin/support">Support Desk</Item>
        <Item to="/admin/kyc">KYC</Item>
        <Item to="/admin/settings">Settings</Item>
        <Item to="/admin/audit">Audit Logs</Item>
        <button onClick={doLogout} className="mt-3 w-full text-left px-3 py-2 rounded-md text-sm text-foreground/70 hover:text-foreground border">
          Logout
        </button>
      </aside>
      <section>{children || <Outlet />}</section>
    </div>
  );
}
