import { ReactNode } from 'react';
import PrimaryNav from './PrimaryNav';
import LoginButton from '../auth/LoginButton';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-6">
            <img src="/assets/generated/lensgram-logo.dim_1200x400.png" alt="LensGram" className="h-8" />
            <PrimaryNav />
          </div>
          <LoginButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} LensGram. Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
