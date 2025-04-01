"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import React from 'react';

interface ThinkingContentProps {
  content: string;
  onCitationClick?: () => void;
}

export default function ThinkingContent({ content, onCitationClick }: ThinkingContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse the content to extract thinking process and final response
  const parseContent = () => {
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
    const thinkingContent = thinkMatch ? thinkMatch[1].trim() : null;
    
    // Get the final response (everything after </think> or the whole content if no think tags)
    let finalResponse = content;
    if (thinkingContent) {
      finalResponse = content.split(/<\/think>/i)[1]?.trim() || '';
    } else if (content.includes('<think>')) {
      // Handle incomplete think tag
      finalResponse = content.split(/<think>/i)[0]?.trim() || content;
    }

    return {
      thinkingContent,
      finalResponse
    };
  };

  const { thinkingContent, finalResponse } = parseContent();

  // Common components configuration for ReactMarkdown
  const markdownComponents = {
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
                        onClick={onCitationClick}
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
  };

  // Only render the dropdown if there is thinking content
  if (!thinkingContent) {
    return (
      <div className="prose prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="prose prose-invert">
      {/* Thinking process dropdown */}
      <div className="mb-4 border border-gray-700 rounded-md overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex justify-between items-center bg-gray-800/70 hover:bg-gray-700/70 transition"
        >
          <span className="font-medium flex items-center">
            <svg 
              className="w-4 h-4 mr-2 text-[#00c8ff]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
            Thinking Process
          </span>
          <svg 
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-gray-900/40 border-t border-gray-700">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {thinkingContent}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Final response */}
      {finalResponse && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {finalResponse}
        </ReactMarkdown>
      )}
    </div>
  );
} 