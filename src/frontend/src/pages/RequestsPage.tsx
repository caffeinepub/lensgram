import { useGetPendingRequestProfiles } from '../hooks/useConnectionRequests';
import { useAcceptConnectionRequest, useRejectConnectionRequest } from '../hooks/useConnectionRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Check, X } from 'lucide-react';
import { formatTimestamp } from '../utils/time';

export default function RequestsPage() {
  const { data: requestProfiles = [], isLoading } = useGetPendingRequestProfiles();
  const acceptMutation = useAcceptConnectionRequest();
  const rejectMutation = useRejectConnectionRequest();

  const handleAccept = async (requester: any) => {
    try {
      await acceptMutation.mutateAsync(requester);
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleReject = async (requester: any) => {
    try {
      await rejectMutation.mutateAsync(requester);
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Connection Requests</h1>
        <p className="text-muted-foreground">Manage your incoming connection requests</p>
      </div>

      {requestProfiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pending requests</p>
            <p className="text-sm text-muted-foreground mt-1">
              When someone sends you a connection request, it will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requestProfiles.map(({ request, profile }) => (
            <Card key={request.requester.toString()}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {profile?.displayName?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile?.displayName || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">@{profile?.username || 'unknown'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(request.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(request.requester)}
                      disabled={acceptMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(request.requester)}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
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
