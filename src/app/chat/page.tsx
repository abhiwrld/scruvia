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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
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
      setActiveChatId(chatId);
      loadChatHistory(chatId);
    } else if (user && !params?.id) {
      // If no specific chat ID, initialize with welcome message
      setMessages([{
        id: uuidv4(),
        content: "Hello! I'm Scruvia AI. How can I help you with your taxation and financial analytics questions today?",
        role: 'assistant',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [params, user]);
  
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
        setMessages(currentChat.messages);
      } else {
        console.error("Chat not found:", chatId);
        // Redirect to main chat page if chat doesn't exist
        router.push('/chat');
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
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
      setMessages([...updatedMessages, placeholderMessage]);
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
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === placeholderId 
                  ? { ...msg, content: streamContent } 
                  : msg
              )
            );
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
            // Uncomment the following line if you want to automatically show web sources when citations are available
            // setShowWebSources(true);
          } else {
            console.log('No citations found in the response');
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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c1220] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00c8ff]"></div>
        <p className="mt-4 text-white">Loading...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
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
                        <div className="mt-2 flex items-center text-[#00c8ff]">
                          <div className="inline-block h-2 w-2 mr-2 bg-[#00c8ff] rounded-full animate-pulse"></div>
                          Generating response...
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-invert">
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
            <div className="w-96 border-l border-gray-700/50 bg-gray-900/50 backdrop-blur-sm overflow-y-auto hidden lg:block">
              <div className="p-4 bg-gray-800/70 backdrop-blur-sm border-b border-gray-700/50 flex justify-between items-center">
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
              <div className="p-4 bg-gray-800/70 backdrop-blur-sm border-b border-gray-700/50 flex justify-between items-center">
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
