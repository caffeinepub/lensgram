import { Principal } from '@dfinity/principal';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { UserPlus, Check, Clock } from 'lucide-react';
import { useConnectionStatus } from '../../hooks/useConnectionRequests';
import { useSendConnectionRequest } from '../../hooks/useConnectionRequests';
import { useNavigate } from '@tanstack/react-router';
import type { UserProfile } from '../../backend';

interface UserResultCardProps {
  profile: UserProfile;
}

export default function UserResultCard({ profile }: UserResultCardProps) {
  const navigate = useNavigate();
  const usernameToPrincipal = Principal.fromText(profile.username);
  const { status } = useConnectionStatus(usernameToPrincipal);
  const sendRequestMutation = useSendConnectionRequest();

  const handleSendRequest = async () => {
    try {
      await sendRequestMutation.mutateAsync(usernameToPrincipal);
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };

  const renderActionButton = () => {
    if (status === 'connected') {
      return (
        <Button onClick={() => navigate({ to: '/chats/$userId', params: { userId: profile.username } })}>
          <Check className="w-4 h-4 mr-2" />
          Connected
        </Button>
      );
    }

    if (status === 'incoming') {
      return (
        <Button variant="outline" onClick={() => navigate({ to: '/requests' })}>
          View Request
        </Button>
      );
    }

    return (
      <Button onClick={handleSendRequest} disabled={sendRequestMutation.isPending}>
        <UserPlus className="w-4 h-4 mr-2" />
        {sendRequestMutation.isPending ? 'Sending...' : 'Send Request'}
      </Button>
    );
  };

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl">
                {profile.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{profile.displayName}</h3>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
          {renderActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}
