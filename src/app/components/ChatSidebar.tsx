"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getChats, deleteChat } from '@/utils/supabase';

interface ChatHistoryItem {
  id: string;
  title: string;
  updated_at: string;
  model: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => Promise<void>;
  activeChatId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose, onNewChat, activeChatId }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, profile, plan, signOut } = useAuth();

  // Load chat history when component mounts or user changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) {
        setChatHistory([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const chats = await getChats(user.id);
        setChatHistory(chats || []);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [user]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle deleting a chat
  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await deleteChat(id);
      setChatHistory(prev => prev.filter(chat => chat.id !== id));
      
      // If the deleted chat is the active one, redirect to /chat
      if (activeChatId === id) {
        router.push('/chat');
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Handle creating a new chat
  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      router.push('/chat');
    }
    onClose();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-[#111827] border-r border-gray-800/50 transition-all duration-300 ease-in-out z-50 shadow-2xl overflow-hidden ${
          isOpen ? 'w-[280px] md:w-[320px] translate-x-0' : 'w-0 -translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-16">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800/70 bg-gray-900/50 backdrop-blur-sm">
            <h2 className="text-lg font-medium text-white">Chat History</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-all duration-200"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-800/70 bg-gray-900/20">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/20 hover:from-[#9c6bff]/30 hover:to-[#00c8ff]/30 text-white py-2.5 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg border border-[#9c6bff]/10 hover:border-[#9c6bff]/20 hover:translate-y-[-1px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>
          
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto py-2 px-3 chat-sidebar-scroll">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00c8ff]"></div>
              </div>
            ) : !user ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>Please sign in to view your chat history</p>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>No chat history found</p>
                <p className="mt-2">Start a new conversation!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {chatHistory.map((chat) => (
                  <li key={chat.id} className="animate-fadeIn" style={{ animationDelay: `${chatHistory.indexOf(chat) * 0.05}s` }}>
                    <Link 
                      href={`/chat/${chat.id}`}
                      className={`flex items-start justify-between p-3 rounded-md transition-all duration-200 hover:shadow-md ${
                        activeChatId === chat.id 
                          ? 'bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/10 border-l-2 border-[#00c8ff]' 
                          : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${activeChatId === chat.id ? 'text-[#00c8ff]' : 'text-white'}`}>
                          {chat.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400 flex items-center">
                            <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(chat.updated_at)}
                          </p>
                          <p className="text-xs text-[#00c8ff]">
                            {chat.model === 'sonar-reasoning-pro' ? 'Pro' : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="ml-2 p-1.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-gray-800/70 transition-all duration-200"
                        aria-label="Delete chat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* User Profile Section - Moved below chat history */}
          {user && (
            <div className="p-4 border-t border-b border-gray-800/70 bg-gray-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] flex items-center justify-center text-white font-medium overflow-hidden shadow-lg shadow-[#9c6bff]/10">
                  <span>{profile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {profile?.name || user.email || 'User'}
                  </p>
                  <p className="text-xs bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] inline-block text-transparent bg-clip-text font-medium">
                    {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                  </p>
                </div>
                <Link 
                  href="/settings"
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>
              
              {/* Upgrade Plan Button */}
              {plan === 'free' && (
                <Link 
                  href="/pricing"
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] text-white py-2 px-4 rounded-md hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#9c6bff]/10 hover:shadow-[#9c6bff]/20 hover:translate-y-[-1px]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Upgrade Plan</span>
                </Link>
              )}
            </div>
          )}
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-800/70 bg-gray-900/30 backdrop-blur-sm">
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white py-2 px-4 rounded-md bg-gray-800/30 hover:bg-gray-800/70 transition-all duration-200 w-full border border-gray-800/50 hover:border-gray-700/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
              
              {user && (
                <div className="text-xs text-gray-400 text-center py-1 px-2 bg-gray-800/30 rounded-md border border-gray-800/50">
                  {plan === 'free' 
                    ? <span><span className="text-[#00c8ff] font-medium">{10 - (profile?.questions_used || 0)}</span>/10 questions left</span> 
                    : <span className="text-[#00c8ff] font-medium">Unlimited questions</span>}
                </div>
              )}
              <div className="text-xs text-center bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] inline-block text-transparent bg-clip-text font-medium">
                Scruvia AI Assistant
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
