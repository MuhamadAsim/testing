import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Bot, User, FileText, Loader2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import FileManager, { FileItem } from '@/components/files/FileManager';
import PromptShortcuts from '@/components/chat/PromptShortcuts';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  fileAttached?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatWindowProps {
  currentChat: Chat | null;
  onNewChat: () => void;
  onUpdateChat: (chat: Chat) => void;
  files: FileItem[];
  onFileUpload: (files: FileItem[]) => void;
  onFileDelete: (fileId: string) => void;
}

const ChatWindow = ({ currentChat, onNewChat, onUpdateChat, files, onFileUpload, onFileDelete }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateTokens } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const simulateAIResponse = (userMessage: string): string => {
    const responses = [
      "I understand your question. Let me help you with that. Based on the information provided, here are some key points to consider...",
      "That's a great question! From my analysis, I can provide you with the following insights and recommendations...",
      "I've processed your request and here's what I found. Let me break this down into several important aspects...",
      "Thank you for your query. Based on my knowledge and the context you've provided, here's a comprehensive response...",
      "I can help you with that. Let me analyze the information and provide you with a detailed explanation..."
    ];
    return responses[Math.floor(Math.random() * responses.length)] + 
           ` (This is a simulated response to: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}")`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    // Check tokens for non-admin users
    if (user.role !== 'admin' && user.tokens < 10) {
      toast({
        title: "Insufficient tokens",
        description: "You need at least 10 tokens to send a message. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      fileAttached: selectedFile ? files.find(f => f.id === selectedFile)?.name : undefined
    };

    let updatedChat: Chat;

    if (currentChat) {
      updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, newMessage],
        updatedAt: new Date(),
        title: currentChat.messages.length === 0 ? message.substring(0, 50) : currentChat.title
      };
    } else {
      updatedChat = {
        id: Date.now().toString(),
        title: message.substring(0, 50),
        messages: [newMessage],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    onUpdateChat(updatedChat);
    setMessage('');
    setSelectedFile('');

    // Update tokens for non-admin users
    if (user.role !== 'admin') {
      updateTokens(10);
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: simulateAIResponse(newMessage.content),
        sender: 'assistant',
        timestamp: new Date()
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiResponse],
        updatedAt: new Date()
      };

      onUpdateChat(finalChat);
      setIsLoading(false);
    }, 1500);
  };

  const handlePromptSelect = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">
            {currentChat?.title || 'New Chat'}
          </h2>
          {currentChat && (
            <span className="text-sm text-muted-foreground">
              {currentChat.messages.length} messages
            </span>
          )}
        </div>
        <Button onClick={onNewChat} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">Start a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Ask me anything! I can help with questions, analysis, coding, writing, and more.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'chat-bubble-user shadow-soft'
                      : 'chat-bubble-assistant shadow-soft'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.fileAttached && (
                    <div className="mt-2 flex items-center space-x-1 text-xs opacity-75">
                      <FileText className="h-3 w-3" />
                      <span>{msg.fileAttached}</span>
                    </div>
                  )}
                  <div className="mt-1 text-xs opacity-60">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="chat-bubble-assistant shadow-soft px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* File Management */}
      <div className="border-t p-4 bg-surface/50">
        <FileManager
          files={files}
          onUpload={onFileUpload}
          onDelete={onFileDelete}
          compact={true}
        />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-surface">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* File Selection */}
          {files.length > 0 && (
            <Select value={selectedFile} onValueChange={setSelectedFile}>
              <SelectTrigger>
                <SelectValue placeholder="Select a file (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No file selected</SelectItem>
                {files.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="gradient"
              disabled={!message.trim() || isLoading || (user?.role !== 'admin' && (user?.tokens || 0) < 10)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {user?.role !== 'admin' && (
            <p className="text-xs text-muted-foreground">
              Each message costs 10 tokens. You have {user?.tokens?.toLocaleString()} tokens remaining.
            </p>
          )}
        </form>
      </div>

      {/* Prompt Shortcuts */}
      <div className="border-t p-4 bg-surface/50">
        <PromptShortcuts onSelectPrompt={handlePromptSelect} compact={true} />
      </div>
    </div>
  );
};

export default ChatWindow;