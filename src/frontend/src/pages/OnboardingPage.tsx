import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useOnboard } from '../hooks/useCurrentUserProfile';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { classifyOnboardingError } from '../utils/onboardingErrors';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const onboardMutation = useOnboard();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardMutation.mutateAsync({ displayName, email, username });
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('Onboarding error:', error);
    }
  };

  const handleReLogin = async () => {
    await clear();
    queryClient.clear();
  };

  const errorClassification = onboardMutation.error
    ? classifyOnboardingError(onboardMutation.error)
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <img
            src="/assets/generated/lensgram-icon.dim_256x256.png"
            alt="LensGram"
            className="w-16 h-16 mx-auto"
          />
          <div>
            <CardTitle className="text-2xl">Welcome to LensGram</CardTitle>
            <CardDescription>Set up your profile to get started</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
              />
              <p className="text-xs text-muted-foreground">
                Choose a unique username. Others can find you with this.
              </p>
            </div>

            {onboardMutation.isError && errorClassification && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errorClassification.message}
                  {errorClassification.type === 'unauthorized' && (
                    <Button
                      variant="link"
                      className="p-0 h-auto ml-2 text-destructive-foreground underline"
                      onClick={handleReLogin}
                    >
                      Sign in again
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={onboardMutation.isPending}>
              {onboardMutation.isPending ? 'Creating Profile...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
