"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import TextLogo from '@/app/components/TextLogo';
import { queryPerplexity, getModelForUserPlan, PerplexityModel, PerplexityResponse, getModelDisplayName } from '@/utils/perplexity-api';
import ModelSelector from '@/app/components/ModelSelector';
import WebSearchResults from '@/app/components/WebSearchResults';
import ChatSidebar from '@/app/components/ChatSidebar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { Switch } from '@headlessui/react';
import { SendIcon } from '@/app/components/SendIcon';
import Counter from '@/app/components/Counter';
import CodeBlock from '@/app/components/CodeBlock';
import ThinkingContent from '@/app/components/ThinkingContent';
import { useAuth } from '@/context/AuthContext';
import { saveChat, getChats, incrementQuestionCount } from '@/utils/supabase';
import type { DetailedHTMLProps, TableHTMLAttributes, HTMLAttributes } from 'react';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isStreaming?: boolean;
  citations?: string[];
};

// Define Citation type
type Citation = {
  id: string;
  text: string;
  url: string;
};

// Define CodeBlock props interface
interface CodeBlockProps {
  language: string;
  value: string;
}

// Add constants for local storage keys
const CHAT_STORAGE_KEY = 'scruvia_active_chat';
const MESSAGES_STORAGE_KEY = 'scruvia_chat_messages';

export default function ChatPage() {
  const router = useRouter();
  const { user, profile, plan, isLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [questionsRemaining, setQuestionsRemaining] = useState<number>(10);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [showWebSources, setShowWebSources] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamedResponse, setStreamedResponse] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const [selectedModel, setSelectedModel] = useState<PerplexityModel>('sonar');

  // Show loading state while auth is being checked
  const [bypassAuthLoading, setBypassAuthLoading] = useState(false);
  
  // Add a timeout to bypass loading screen if it takes too long
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.log('Bypassing auth loading state due to timeout');
        setBypassAuthLoading(true);
      }, 3000); // After 3 seconds, bypass the loading screen
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Save active chat to localStorage when available
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, activeChatId);
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
        console.log('Saved chat state to localStorage', { activeChatId, messageCount: messages.length });
      } catch (error) {
        console.error('Error saving chat to localStorage:', error);
      }
    }
  }, [activeChatId, messages]);

  // Handle beforeunload event to save chat state
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Ensure the latest chat state is saved before the page unloads
      if (activeChatId && messages.length > 0) {
        try {
          localStorage.setItem(CHAT_STORAGE_KEY, activeChatId);
          localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
          console.error('Error saving chat before unload:', error);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeChatId, messages]);

  // Handle visibility change to restore chat when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('Tab became visible, checking chat state');
        const chatId = params?.id as string;
        
        // If we have a chat ID in the URL but no messages, try to reload from localStorage first
        if (chatId && messages.length === 0) {
          try {
            const storedChatId = localStorage.getItem(CHAT_STORAGE_KEY);
            const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
            
            // Only restore from localStorage if the stored chat matches the current URL
            if (storedChatId === chatId && storedMessages) {
              const parsedMessages = JSON.parse(storedMessages) as Message[];
              
              if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                console.log('Restoring chat from localStorage on visibility change', { 
                  chatId,
                  messageCount: parsedMessages.length 
                });
                
                setMessages(parsedMessages);
                return; // Skip database load if we have local data
              }
            }
          } catch (error) {
            console.error('Error restoring from localStorage on visibility change:', error);
          }
          
          // If localStorage restore failed or data didn't match, load from database
          console.log('Loading chat history from database on visibility change:', chatId);
          loadChatHistory(chatId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [params, user, messages.length]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect to ensure session is restored on load
  useEffect(() => {
    // Import and run ensureSessionRestored on component mount
    const attemptSessionRestoration = async () => {
      try {
        const { ensureSessionRestored } = await import('@/utils/supabase');
        const success = await ensureSessionRestored();
        if (success) {
          console.log('Session manually restored, refreshing page');
          // Force a reload after successful session restoration
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    };
    
    // Only attempt restoration if we have a pending login but no user
    if (!user && typeof window !== 'undefined' && localStorage.getItem('userLoginPending') === 'true') {
      attemptSessionRestoration();
    }
  }, [user]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    // Check for pending login flag in case session is still initializing
    const userLoginPending = typeof window !== 'undefined' && localStorage.getItem('userLoginPending') === 'true';
    
    if (!isLoading) {
      if (user) {
        // If user is authenticated, clear the pending flag
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userLoginPending');
          console.log('User authenticated, cleared pending login flag');
        }
      } else if (!userLoginPending) {
        // Only redirect if user is not authenticated and there's no pending login
        console.log('No authenticated user found, redirecting to login');
        // Use direct location change for more reliability
        if (typeof window !== 'undefined') {
          window.location.href = `${window.location.origin}/login`;
        } else {
          router.push('/login');
        }
      } else {
        // If there's a pending login but no user yet, wait a bit longer
        console.log('Login pending, waiting for session...');
        
        // Import the debugAuthState function dynamically to avoid circular imports
        import('@/utils/supabase').then(({ debugAuthState }) => {
          // Run debug to check auth state
          debugAuthState();
        });
        
        const timer = setTimeout(() => {
          // If still no user after timeout, clear flag and redirect
          if (!user) {
            console.log('Session timeout, redirecting to login');
            localStorage.removeItem('userLoginPending');
            
            // Use direct location change for more reliability
            if (typeof window !== 'undefined') {
              window.location.href = `${window.location.origin}/login`;
            } else {
              router.push('/login');
            }
          }
        }, 5000); // Extended to 5 second grace period for production
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, user, router]);
  
  useEffect(() => {
    // Set up user profile and questions remaining
    if (user && profile) {
      // Set questions remaining based on plan
      const questionsUsed = profile.questions_used || 0;
      let totalQuestions = 10; // free plan
      
      if (plan === 'plus') {
        totalQuestions = 50;
      } else if (plan === 'pro') {
        totalQuestions = 200;
      } else if (plan === 'team') {
        totalQuestions = 500;
      }
      
      console.log(`Setting questions remaining: ${totalQuestions} - ${questionsUsed} = ${Math.max(0, totalQuestions - questionsUsed)}`);
      setQuestionsRemaining(Math.max(0, totalQuestions - questionsUsed));
    }
  }, [user, profile, plan]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check if we're viewing a specific chat
  useEffect(() => {
    const chatId = params?.id as string;
    
    if (chatId && user) {
      // Only load history if we haven't already loaded this chat
      if (chatId !== activeChatId || messages.length === 0) {
        console.log('Loading chat history for new chat ID:', chatId);
        setActiveChatId(chatId);
        loadChatHistory(chatId);
      }
    } else if (user && !params?.id) {
      // If no specific chat ID in URL, check if we have a stored chat
      try {
        const storedChatId = localStorage.getItem(CHAT_STORAGE_KEY);
        const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
        
        if (storedChatId && storedMessages) {
          const parsedMessages = JSON.parse(storedMessages) as Message[];
          
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            console.log('Restoring chat from localStorage for home page', { 
              chatId: storedChatId, 
              messageCount: parsedMessages.length 
            });
            
            // Redirect to the stored chat
            router.push(`/chat/${storedChatId}`);
            return; // Skip welcome message creation
          }
        }
      } catch (error) {
        console.error('Error checking stored chat on home page:', error);
      }
      
      // If no stored chat or restoration failed, initialize with welcome message
      console.log('No stored chat found, initializing with welcome message');
      const welcomeMessage = {
        id: uuidv4(),
        content: "Hello! I'm Scruvia AI. How can I help you with your taxation and financial analytics questions today?",
        role: 'assistant' as const,
        timestamp: new Date().toISOString()
      };
      
      setMessages([welcomeMessage]);
    }
  }, [params, user, router, activeChatId, messages.length]);
  
  // Set the model based on user's plan
  useEffect(() => {
    if (plan) {
      const model = getModelForUserPlan(plan);
      setSelectedModel(model);
    }
  }, [plan]);
  
  // Load chat history for a specific chat ID
  const loadChatHistory = async (chatId: string) => {
    if (!user) return;
    
    try {
      // Load chat history from Supabase
      const chats = await getChats(user.id);
      const currentChat = chats.find(chat => chat.id === chatId);
      
      if (currentChat && currentChat.messages) {
        // Ensure messages are of the correct type before setting
        if (Array.isArray(currentChat.messages)) {
          // Validate the message structure to ensure it meets the Message type requirements
          const validMessages = currentChat.messages.filter(msg => 
            msg && 
            typeof msg === 'object' && 
            'id' in msg && 
            'content' in msg && 
            'role' in msg && 
            (msg.role === 'user' || msg.role === 'assistant') &&
            'timestamp' in msg
          );
          
          if (validMessages.length > 0) {
            console.log(`Loaded ${validMessages.length} valid messages for chat ${chatId}`);
            setMessages(validMessages as Message[]);
            
            // Also update localStorage
            try {
              localStorage.setItem(CHAT_STORAGE_KEY, chatId);
              localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(validMessages));
            } catch (error) {
              console.error('Error saving loaded chat to localStorage:', error);
            }
          } else {
            console.log("No valid messages found in chat:", chatId);
            setMessages([]);
          }
        } else {
          console.log("Chat messages are not in expected format:", currentChat.messages);
          setMessages([]);
        }
      } else {
        console.log("Chat not found:", chatId);
        // Create a new welcome message
        const welcomeMessage = {
          id: uuidv4(),
          content: "Hello! I'm Scruvia AI. How can I help you with your taxation and financial analytics questions today?",
          role: 'assistant' as const,
          timestamp: new Date().toISOString()
        };
        
        setMessages([welcomeMessage]);
        
        // Save this new chat ID and messages to localStorage
        try {
          localStorage.setItem(CHAT_STORAGE_KEY, chatId);
          localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([welcomeMessage]));
        } catch (error) {
          console.error('Error saving new welcome message to localStorage:', error);
        }
        
        // Save the new chat to Supabase so it exists for next time
        await saveChat({
          id: chatId,
          title: "New Conversation",
          messages: [welcomeMessage],
          user_id: user.id,
          model: selectedModel
        });
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Handle the error gracefully - create a new welcome message
      const welcomeMessage = {
        id: uuidv4(),
        content: "Sorry, there was an issue loading your chat history. How can I help you today?",
        role: 'assistant' as const,
        timestamp: new Date().toISOString()
      };
      
      setMessages([welcomeMessage]);
    }
  };

  // After the final message is saved to Supabase in handleSendMessage
  const saveToLocalStorage = (chatId: string, messagesData: Message[]) => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, chatId);
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messagesData));
    } catch (error) {
      console.error('Error saving chat to localStorage:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming || !user) return;

    try {
      // Create or get current chat ID
      const currentChatId = activeChatId || uuidv4();
      if (!activeChatId) {
        setActiveChatId(currentChatId);
      }
      
      // Add user message to state
      const userMessage: Message = {
        id: uuidv4(),
        content: input,
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Save to localStorage immediately after adding user message
      saveToLocalStorage(currentChatId, updatedMessages);
      
      // Clear input and update UI
      setInput('');
      
      // Check if user has remaining questions
      const questionsUsed = profile?.questions_used || 0;
      
      // Get question limits based on user plan
      let questionLimit = 10; // Default for free
      if (plan === 'plus') questionLimit = 50;
      if (plan === 'pro') questionLimit = 200;
      if (plan === 'team') questionLimit = 500;
      
      // If user reached question limit
      if (questionsUsed >= questionLimit && plan !== 'team') {
        const limitMessage: Message = {
          id: uuidv4(),
          content: `You've reached your ${questionLimit} question limit for the ${plan} plan. Please upgrade to continue asking questions.`,
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        const finalMessages = [...updatedMessages, limitMessage];
        setMessages(finalMessages);
        
        // Save to localStorage
        saveToLocalStorage(currentChatId, finalMessages);
        
        // Save to Supabase
        await saveChat({
          id: currentChatId,
          title: getMessagePreview(userMessage.content),
          messages: finalMessages,
          user_id: user.id,
          model: selectedModel
        });
        
        return;
      }
      
      // Create placeholder message for streaming
      const placeholderId = uuidv4();
      const placeholderMessage: Message = {
        id: placeholderId,
        content: '',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      
      // Add the placeholder message to state
      const messagesWithPlaceholder = [...updatedMessages, placeholderMessage];
      setMessages(messagesWithPlaceholder);
      
      // Save to localStorage with placeholder
      saveToLocalStorage(currentChatId, messagesWithPlaceholder);
      
      setIsStreaming(true);
      
      // Clear any previous sources when starting a new message
      setActiveCitations([]);
      // Don't automatically show the sources panel
      setShowWebSources(false);
      
      // Get previous messages for context
      const chatMessages = updatedMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      
      try {
        // Track the stream content for debugging
        let streamContent = '';
        
        // Stream response from Perplexity API
        const response = await queryPerplexity(
          input, 
          selectedModel, 
          chatMessages, 
          true, // Enable streaming
          (chunk) => {
            // Safely update the streaming message with each chunk
            streamContent += chunk;
            setMessages((prevMessages: Message[]) => {
              const updatedMsgs = prevMessages.map(msg => 
                msg.id === placeholderId 
                  ? { ...msg, content: streamContent } 
                  : msg
              );
              
              // Update localStorage periodically during streaming (not on every chunk to avoid performance issues)
              if (Math.random() < 0.1) { // ~10% chance to update localStorage during streaming
                saveToLocalStorage(currentChatId, updatedMsgs);
              }
              
              return updatedMsgs;
            });
          }
        );
        
        if (response) {
          // When streaming is done, update the final message with content and citations
          const finalContent = response.choices?.[0]?.message?.content || streamContent;
          const finalCitations = response.citations || [];
          
          console.log('Response citations:', finalCitations);
          
          // Update the message in state with final content
          const finalAssistantMessage = {
            id: placeholderId,
            content: finalContent,
            role: 'assistant' as const,
            timestamp: new Date().toISOString(),
            isStreaming: false,
            citations: finalCitations
          };
          
          const finalMessages = updatedMessages.concat([finalAssistantMessage]);
          setMessages(finalMessages);
          
          // Save final message state to localStorage
          saveToLocalStorage(currentChatId, finalMessages);
          
          // Save the chat to Supabase
          await saveChat({
            id: currentChatId,
            title: getMessagePreview(userMessage.content),
            messages: finalMessages,
            user_id: user.id,
            model: selectedModel
          });
          
          // Increment the question count in Supabase and update local state
          const success = await incrementQuestionCount(user.id);
          if (success) {
            // Update local question count to reflect the increment
            setQuestionsRemaining(prevCount => Math.max(0, prevCount - 1));
          }
          
          // Set active citations for sidebar if available
          if (finalCitations && finalCitations.length > 0) {
            console.log('Setting active citations:', finalCitations);
            const citationsWithMetadata = finalCitations.map((citation, index) => {
              let url = citation;
              let text = citation;
              
              try {
                // Check if the citation contains a URL
                const urlMatch = citation.match(/https?:\/\/[^\s]+/);
                if (urlMatch) {
                  url = urlMatch[0];
                  // Extract some text from the citation if possible
                  const remainingText = citation.replace(url, '').trim();
                  text = remainingText || new URL(url).hostname;
                } else {
                  // Try to extract domain-like text
                  const domainMatch = citation.match(/[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}/);
                  if (domainMatch) {
                    url = `https://${domainMatch[0]}`;
                    text = citation;
                  }
                }
              } catch (e) {
                console.warn('Failed to parse citation URL:', e);
                // If URL parsing fails, make it searchable
                url = `https://www.google.com/search?q=${encodeURIComponent(citation)}`;
              }
              
              return {
                id: index.toString(),
                text: text || citation,
                url: url
              };
            });
            
            setActiveCitations(citationsWithMetadata);
            // Automatically show web sources when citations are available
            setShowWebSources(true);
            console.log('Web sources should be visible now:', citationsWithMetadata);
          } else {
            console.log('No citations found in the response');
            
            // If response contains [1], [2], etc. but no citations were extracted, create dummy citations
            const citationReferences = finalContent.match(/\[\d+\]/g);
            if (citationReferences && citationReferences.length > 0) {
              console.log('Found citation references but no citations object:', citationReferences);
              const dummyCitations = citationReferences.map((ref, index) => ({
                id: index.toString(),
                text: `Source ${ref}`,
                url: `https://www.google.com/search?q=${encodeURIComponent(userMessage.content)}`
              }));
              
              setActiveCitations(dummyCitations);
              setShowWebSources(true);
              console.log('Created dummy citations for references:', dummyCitations);
            }
          }
        }
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Create error message
        const errorMessage = {
          id: placeholderId,
          content: 'Sorry, I had trouble processing your request. Please try again later.',
          role: 'assistant' as const,
          timestamp: new Date().toISOString(),
          isStreaming: false
        };
        
        const finalMessages = updatedMessages.concat([errorMessage]);
        setMessages(finalMessages);
        
        // Save chat with error message to Supabase
        await saveChat({
          id: currentChatId,
          title: getMessagePreview(userMessage.content),
          messages: finalMessages,
          user_id: user.id,
          model: selectedModel
        });
      } finally {
        setIsStreaming(false);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setIsStreaming(false);
    }
  };

  // Get a preview of the message for the chat title
  const getMessagePreview = (content: string): string => {
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleNewChat = async () => {
    if (!user) return;
    
    // Generate a new chat ID
    const newChatId = uuidv4();
    
    // Initial welcome message
    const welcomeMessage = {
      id: uuidv4(),
      content: "Hello! I'm Scruvia AI. How can I help you with your taxation and financial analytics questions today?",
      role: 'assistant' as const,
      timestamp: new Date().toISOString()
    };
    
    // Reset messages
    setMessages([welcomeMessage]);
    
    // Update local storage with new chat
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, newChatId);
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([welcomeMessage]));
    } catch (error) {
      console.error('Error saving new chat to localStorage:', error);
    }
    
    // Save new chat to Supabase
    await saveChat({
      id: newChatId,
      title: "New Conversation",
      messages: [welcomeMessage],
      user_id: user.id,
      model: selectedModel
    });
    
    // Update active chat ID and redirect
    setActiveChatId(newChatId);
    router.push(`/chat/${newChatId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading state while auth is being checked
  if (isLoading && !bypassAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0c1220] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00c8ff]"></div>
        <p className="mt-4 text-white">Loading...</p>
        <button 
          onClick={() => setBypassAuthLoading(true)}
          className="mt-6 px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          Continue to Chat
        </button>
      </div>
    );
  }

  // Don't render anything if not authenticated and still checking
  if (!user && !bypassAuthLoading && !localStorage.getItem('userLoginPending')) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#0c1220] to-[#111827] text-white">
      {/* Chat sidebar - fixed width, not absolute position */}
      <div className={`w-72 border-r border-gray-700/50 bg-gray-900/80 transition-all duration-300 ${
        showSidebar ? 'md:w-72' : 'md:w-0'
      } md:block hidden h-full overflow-hidden`}>
        <ChatSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onNewChat={handleNewChat}
          activeChatId={activeChatId}
        />
      </div>

      {/* Mobile sidebar - absolute position with overlay */}
      <ChatSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onNewChat={handleNewChat}
        activeChatId={activeChatId}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header with sidebar toggle button */}
        <header className="flex items-center justify-between p-3 md:p-4 bg-gray-900/70 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 mr-3 text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-md transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] bg-clip-text text-transparent">
              Scruvia AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isPro={plan === 'pro' || plan === 'team'}
            />
            
            <div className="hidden md:flex items-center">
              <span className="text-gray-400 text-sm">
                {activeCitations.length > 0 && (
                  <>
                    <button 
                      className="text-[#00c8ff] hover:underline"
                      onClick={() => setShowWebSources(true)}
                    >
                      {activeCitations.length}
                    </button> sources
                    {/* Debug button */}
                    <button 
                      className="ml-4 text-yellow-400 hover:underline"
                      onClick={() => {
                        console.log('Debug - Citations:', activeCitations);
                        console.log('Debug - showWebSources:', showWebSources);
                        // Add sample citation if none exist
                        if (activeCitations.length === 0) {
                          const sampleCitation = {
                            id: "debug-1",
                            text: "Sample citation for debugging",
                            url: "https://example.com"
                          };
                          setActiveCitations([sampleCitation]);
                        }
                        // Force show web sources
                        setShowWebSources(true);
                      }}
                    >
                      View Sources
                    </button>
                  </>
                )}
              </span>
            </div>
          </div>
        </header>

        {/* Content area with message container and web sources */}
        <div className="flex-1 overflow-hidden flex">
          {/* Message container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages scrollable area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-[#9c6bff]/10 border border-[#9c6bff]/20'
                        : 'bg-gray-800/50 border border-gray-700/50'
                    }`}
                  >
                    {message.role === 'assistant' && message.isStreaming ? (
                      <div className="prose prose-invert">
                        <ThinkingContent 
                          content={message.content}
                          onCitationClick={() => setShowWebSources(true)} 
                        />
                        <div className="mt-2 flex items-center text-[#00c8ff]">
                          <div className="inline-block h-2 w-2 mr-2 bg-[#00c8ff] rounded-full animate-pulse"></div>
                          Generating response...
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-invert">
                        {message.role === 'assistant' ? (
                          <ThinkingContent 
                            content={message.content}
                            onCitationClick={() => setShowWebSources(true)}
                          />
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !match ? (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <CodeBlock className={`language-${match[1]}`}>
                                    {String(children).replace(/\n$/, '')}
                                  </CodeBlock>
                                )
                              },
                              // Add improved heading styles
                              h1(props: any) {
                                return <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />
                              },
                              h2(props: any) {
                                return <h2 className="text-xl font-bold mt-5 mb-3 text-white" {...props} />
                              },
                              h3(props: any) {
                                return <h3 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />
                              },
                              // Add table styling with simpler types
                              table(props: any) {
                                return (
                                  <div className="overflow-x-auto my-4 rounded-md border border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-700" {...props} />
                                  </div>
                                )
                              },
                              thead(props: any) {
                                return <thead className="bg-gray-800" {...props} />
                              },
                              tbody(props: any) {
                                return <tbody className="divide-y divide-gray-700 bg-gray-900/50" {...props} />
                              },
                              tr(props: any) {
                                return <tr className="hover:bg-gray-800/70 transition-colors" {...props} />
                              },
                              th(props: any) {
                                return <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" {...props} />
                              },
                              td(props: any) {
                                return <td className="px-4 py-3 text-sm text-gray-200" {...props} />
                              },
                              // Modified to properly detect citation references in text
                              p(props: any) {
                                return (
                                  <p {...props}>
                                    {React.Children.map(props.children, child => {
                                      if (typeof child === 'string') {
                                        // Split by citation pattern
                                        const parts = child.split(/(\[\d+\])/g);
                                        if (parts.length > 1) {
                                          return parts.map((part, i) => {
                                            if (part.match(/^\[\d+\]$/)) {
                                              return (
                                                <button 
                                                  key={i}
                                                  className="text-[#00c8ff] hover:underline cursor-pointer inline-block"
                                                  onClick={() => setShowWebSources(true)}
                                                >
                                                  {part}
                                                </button>
                                              );
                                            }
                                            return part;
                                          });
                                        }
                                      }
                                      return child;
                                    })}
                                  </p>
                                );
                              },
                              // Add back the link handling for regular links
                              a({href, children, ...props}: any) {
                                return (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#00c8ff] hover:underline"
                                    {...props}
                                  >
                                    {children}
                                  </a>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    )}
                    
                    {/* Citations button on mobile */}
                    {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                      <div className="mt-2 md:hidden">
                        <button
                          onClick={() => setShowWebSources(true)}
                          className="text-sm text-[#00c8ff] hover:underline flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {message.citations.length} Sources
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-400">
                      {formatTime(new Date(message.timestamp))}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area - Floating design */}
            <div className="py-4 px-4 relative">
              <div className="w-full max-w-4xl mx-auto bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-700/50 hover:border-gray-600/50 transition-all">
                <div className="flex items-end">
                  <textarea
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-gray-400 p-4 pr-12 resize-none h-[60px] max-h-[200px] overflow-y-auto"
                    placeholder="Ask about Indian tax laws, regulations, or get filing advice..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isStreaming}
                  />
                  <button
                    className={`p-3 mr-2 mb-2 rounded-lg ${
                      isStreaming || !input.trim()
                        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] text-white hover:opacity-90'
                    } transition-all`}
                    onClick={handleSendMessage}
                    disabled={isStreaming || !input.trim()}
                  >
                    {isStreaming ? (
                      <div className="h-5 w-5 border-2 border-gray-300 border-t-[#00c8ff] rounded-full animate-spin"></div>
                    ) : (
                      <SendIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {plan === 'free' && (
                  <div className="text-xs text-gray-400 pb-2 px-4 flex justify-between">
                    <span>
                      {questionsRemaining} of 10 free questions remaining
                    </span>
                    <Link href="/pricing" className="text-[#00c8ff] hover:underline">
                      Upgrade for unlimited
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Web search results sidebar */}
          {showWebSources && activeCitations.length > 0 && (
            <div className="w-96 border-l border-gray-700/50 bg-gray-900/80 backdrop-blur-sm overflow-y-auto hidden lg:block">
              <div className="p-4 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 flex justify-between items-center">
                <h3 className="font-medium text-white">Sources</h3>
                <button 
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all"
                  onClick={() => setShowWebSources(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <WebSearchResults citations={activeCitations} />
              </div>
            </div>
          )}
          
          {/* Mobile web search results overlay */}
          {showWebSources && activeCitations.length > 0 && (
            <div className="fixed inset-0 bg-gray-900/95 z-50 lg:hidden flex flex-col">
              <div className="p-4 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 flex justify-between items-center">
                <h3 className="font-medium text-white">Sources</h3>
                <button 
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all"
                  onClick={() => setShowWebSources(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <WebSearchResults citations={activeCitations} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
