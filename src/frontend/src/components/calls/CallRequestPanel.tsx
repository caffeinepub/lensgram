import { Principal } from '@dfinity/principal';
import { useGetCallState, useInitiateCall, useAcceptCall, useDeclineCall, useEndCall } from '../../hooks/useCallRequests';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Phone, PhoneOff, PhoneIncoming } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface CallRequestPanelProps {
  otherUserPrincipal: Principal | null;
}

export default function CallRequestPanel({ otherUserPrincipal }: CallRequestPanelProps) {
  const { identity } = useInternetIdentity();
  const { data: callState } = useGetCallState();
  const initiateMutation = useInitiateCall();
  const acceptMutation = useAcceptCall();
  const declineMutation = useDeclineCall();
  const endMutation = useEndCall();

  if (!otherUserPrincipal || !identity) return null;

  const myPrincipal = identity.getPrincipal().toString();
  const otherPrincipalStr = otherUserPrincipal.toString();

  const handleInitiateCall = async () => {
    try {
      await initiateMutation.mutateAsync(otherUserPrincipal);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  const handleAcceptCall = async () => {
    if (!callState) return;
    try {
      await acceptMutation.mutateAsync(callState.caller);
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };

  const handleDeclineCall = async () => {
    if (!callState) return;
    try {
      await declineMutation.mutateAsync(callState.caller);
    } catch (error) {
      console.error('Failed to decline call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      await endMutation.mutateAsync(otherUserPrincipal);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  if (!callState) {
    return (
      <div className="border-b p-4">
        <Button onClick={handleInitiateCall} disabled={initiateMutation.isPending} className="w-full">
          <Phone className="w-4 h-4 mr-2" />
          {initiateMutation.isPending ? 'Calling...' : 'Start Call'}
        </Button>
      </div>
    );
  }

  const isIncomingCall = callState.callee.toString() === myPrincipal && callState.caller.toString() === otherPrincipalStr;
  const isOutgoingCall = callState.caller.toString() === myPrincipal && callState.callee.toString() === otherPrincipalStr;

  if (isIncomingCall) {
    return (
      <div className="border-b p-4">
        <Alert className="mb-3">
          <PhoneIncoming className="w-4 h-4" />
          <AlertDescription>Incoming call request</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={handleAcceptCall} disabled={acceptMutation.isPending} className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={handleDeclineCall}
            disabled={declineMutation.isPending}
            variant="destructive"
            className="flex-1"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>
      </div>
    );
  }

  if (isOutgoingCall) {
    return (
      <div className="border-b p-4">
        <Alert className="mb-3">
          <Phone className="w-4 h-4" />
          <AlertDescription>Call in progress</AlertDescription>
        </Alert>
        <Button onClick={handleEndCall} disabled={endMutation.isPending} variant="destructive" className="w-full">
          <PhoneOff className="w-4 h-4 mr-2" />
          End Call
        </Button>
      </div>
    );
  }

  return null;
}
