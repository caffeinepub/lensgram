import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMessages, useSendMessage } from '../hooks/useChat';
import { useGetConnectionProfiles } from '../hooks/useConnections';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { formatMessageTime } from '../utils/time';
import { Principal } from '@dfinity/principal';
import CallRequestPanel from '../components/calls/CallRequestPanel';

export default function ChatDetailPage() {
  const { userId } = useParams({ from: '/app-layout/chats/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: connections = [] } = useGetConnectionProfiles();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const connection = connections.find((c) => c.username === userId);
  const connectionPrincipal = connection ? Principal.fromText(connection.username) : null;

  const { data: messages = [] } = useGetMessages(connectionPrincipal);
  const sendMessageMutation = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !connectionPrincipal) return;

    try {
      await sendMessageMutation.mutateAsync({
        recipient: connectionPrincipal,
        content: messageInput.trim(),
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!connection) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">User not found or not connected</p>
            <Button className="mt-4" onClick={() => navigate({ to: '/chats' })}>
              Back to Chats
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-4 h-[calc(100vh-4rem)] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/chats' })}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarFallback>{connection.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{connection.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">@{connection.username}</p>
            </div>
          </div>
        </CardHeader>

        <CallRequestPanel otherUserPrincipal={connectionPrincipal} />

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.sender.toString() === identity?.getPrincipal().toString();
              return (
                <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!messageInput.trim() || sendMessageMutation.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
