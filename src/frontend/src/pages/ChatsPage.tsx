import { useGetConnectionProfiles } from '../hooks/useConnections';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { MessageSquare } from 'lucide-react';

export default function ChatsPage() {
  const { data: connections = [], isLoading } = useGetConnectionProfiles();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
        <p className="text-muted-foreground">Your conversations with connected users</p>
      </div>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No connections yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with people to start chatting
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {connections.map((profile) => (
            <Card
              key={profile.username}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate({ to: '/chats/$userId', params: { userId: profile.username } })}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
