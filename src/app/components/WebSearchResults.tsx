import React from 'react';

interface Citation {
  id: string;
  text: string;
  url: string;
}

interface WebSearchResultsProps {
  citations: Citation[];
}

// Helper function to extract URL from citation text
const extractUrl = (text: string): string => {
  try {
    // Try to find a URL pattern in the text
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) return urlMatch[0];
    
    // If no URL found, see if it's just a domain
    const domainMatch = text.match(/[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}/);
    if (domainMatch) return `https://${domainMatch[0]}`;
    
    // Fall back to making a Google search for the text
    return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
  } catch (e) {
    return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
  }
};

// Helper function to get favicon for URL
const getFavicon = (url: string): string => {
  try {
    const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    const domain = domainMatch ? domainMatch[1] : new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (e) {
    return '';
  }
};

// Helper function to get display text for the citation
const getDisplayText = (text: string): string => {
  // Remove the URL from the display text if it's just a URL
  if (text.match(/^https?:\/\/[^\s]+$/)) {
    try {
      const url = new URL(text);
      return url.hostname;
    } catch {
      return text;
    }
  }
  return text;
};

// Extract hostname from URL with error handling
const getHostname = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    // If URL parsing fails, try to extract the domain another way
    const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    if (match) return match[1];
    return url;
  }
};

// Parse citation text to extract more information
const parseCitation = (citation: Citation): Citation => {
  const url = citation.url && citation.url !== citation.text 
    ? citation.url 
    : extractUrl(citation.text);
    
  return {
    ...citation,
    url,
    text: getDisplayText(citation.text)
  };
};

const WebSearchResults: React.FC<WebSearchResultsProps> = ({ citations }) => {
  if (!citations || citations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No sources available for this response.
      </div>
    );
  }

  // Parse citations to extract more information
  const parsedCitations = citations.map(parseCitation);

  return (
    <div className="space-y-4">
      {parsedCitations.map((citation) => (
        <a
          key={citation.id}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={getFavicon(citation.url) || ''} 
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="text-xs text-blue-400 truncate flex-1">
              {getHostname(citation.url)}
            </div>
          </div>
          <div className="text-sm text-gray-300">
            {citation.text}
          </div>
        </a>
      ))}
    </div>
  );
};

export default WebSearchResults;
