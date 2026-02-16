import { useState } from 'react';
import { useSearchUserByUsername } from '../hooks/useUserSearch';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Search } from 'lucide-react';
import UserResultCard from '../components/users/UserResultCard';

export default function DiscoverPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: userProfile, isLoading, isFetched } = useSearchUserByUsername(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
        <p className="text-muted-foreground">Find and connect with people on LensGram</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search by Username</CardTitle>
          <CardDescription>Enter a username to find someone</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter username..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!searchInput.trim() || isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      )}

      {isFetched && searchQuery && !userProfile && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">User not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              No user with username "{searchQuery}" exists
            </p>
          </CardContent>
        </Card>
      )}

      {userProfile && <UserResultCard profile={userProfile} />}
    </div>
  );
}
