import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { Search, Inbox, MessageSquare } from 'lucide-react';

export default function PrimaryNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    { path: '/', label: 'Discover', icon: Search },
    { path: '/requests', label: 'Requests', icon: Inbox },
    { path: '/chats', label: 'Chats', icon: MessageSquare },
  ];

  return (
    <nav className="flex gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path || (item.path === '/chats' && currentPath.startsWith('/chats'));
        return (
          <Button
            key={item.path}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: item.path })}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
