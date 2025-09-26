import { Link, NavLink } from "react-router-dom";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center">
            <span className="text-primary font-black">V</span>
          </div>
          <span className="font-semibold">Vyomkesh Industries</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/plans">Plans</NavItem>
          <NavItem to="/about">About</NavItem>
          <NavItem to="/faqs">FAQs</NavItem>
          <NavItem to="/blog">Blog</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link to="/signup">Sign up</Link>
          </Button>
          <Button asChild>
            <Link to="/#calculator">Calculate Returns</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center">
              <span className="text-primary font-black">V</span>
            </div>
            <span className="font-semibold">Vyomkesh Industries</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Regulator‑ready compliance, transparent ledgers, and dedicated
            support.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/blog">Updates</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/terms">Terms</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy</Link>
            </li>
            <li>
              <Link to="/risk">Risk Disclosure</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="mailto:support@vyomkeshindustries.com">support@vyomkeshindustries.com</a>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Get Started</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Start investing with as little as ₹10,000.
          </p>
          <Button asChild className="w-full md:w-auto">
            <Link to="#calculator">Start Investing</Link>
          </Button>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vyomkesh Industries. All rights reserved.
      </div>
    </footer>
  );
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
