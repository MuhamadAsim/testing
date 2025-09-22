import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import ChatWindow, { Chat, Message } from '@/components/chat/ChatWindow';
import ChatHistory from '@/components/chat/ChatHistory';
import { FileItem } from '@/components/files/FileManager';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);

  // Redirect to sign in if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Load data from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem(`chats_${user.id}`);
    const savedFiles = localStorage.getItem(`files_${user.id}`);
    
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setChats(parsedChats);
    }
    
    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles).map((file: any) => ({
        ...file,
        uploadedAt: new Date(file.uploadedAt)
      }));
      setFiles(parsedFiles);
    }
  }, [user.id]);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    localStorage.setItem(`chats_${user.id}`, JSON.stringify(chats));
  }, [chats, user.id]);

  // Save files to localStorage whenever files change
  useEffect(() => {
    localStorage.setItem(`files_${user.id}`, JSON.stringify(files));
  }, [files, user.id]);

  const handleNewChat = () => {
    setCurrentChat(null);
  };

  const handleUpdateChat = (updatedChat: Chat) => {
    setChats(prevChats => {
      const existingIndex = prevChats.findIndex(c => c.id === updatedChat.id);
      if (existingIndex >= 0) {
        const newChats = [...prevChats];
        newChats[existingIndex] = updatedChat;
        return newChats;
      } else {
        return [updatedChat, ...prevChats];
      }
    });
    setCurrentChat(updatedChat);
  };

  const handleSelectChat = (chat: Chat) => {
    setCurrentChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(c => c.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
    toast({
      title: "Chat deleted",
      description: "The chat has been removed successfully.",
    });
  };

  const handleFileUpload = (newFiles: FileItem[]) => {
    setFiles(prevFiles => [...newFiles, ...prevFiles]);
  };

  const handleFileDelete = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar className="border-r">
            <SidebarContent>
              <div className="p-4 h-full">
                <ChatHistory
                  chats={chats}
                  currentChat={currentChat}
                  onSelectChat={handleSelectChat}
                  onDeleteChat={handleDeleteChat}
                />
              </div>
            </SidebarContent>
          </Sidebar>

          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <Navbar />
              </div>
            </header>
            
            <div className="flex-1 flex flex-col">
              <ChatWindow
                currentChat={currentChat}
                onNewChat={handleNewChat}
                onUpdateChat={handleUpdateChat}
                files={files}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;