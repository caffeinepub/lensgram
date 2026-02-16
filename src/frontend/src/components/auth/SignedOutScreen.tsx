import LoginButton from './LoginButton';

export default function SignedOutScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <img
            src="/assets/generated/lensgram-icon.dim_256x256.png"
            alt="LensGram"
            className="w-24 h-24 mx-auto"
          />
          <h1 className="text-4xl font-bold tracking-tight">LensGram</h1>
          <p className="text-lg text-muted-foreground">
            Connect with friends through secure messaging and calls
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in to start discovering and connecting with people
          </p>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
