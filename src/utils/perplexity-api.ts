// Perplexity API integration for Scruvia

// Model options
export type PerplexityModel = 'sonar' | 'sonar-reasoning-pro';

// Model display names
export const MODEL_DISPLAY_NAMES: Record<PerplexityModel, string> = {
  'sonar': 'ScruviaAI',
  'sonar-reasoning-pro': 'ScruviaAI Pro'
};

// Request options interface
export interface PerplexityRequestOptions {
  model: PerplexityModel;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  response_format?: Record<string, any>;
  web_search_options?: {
    search_context_size: 'high' | 'medium' | 'low';
  };
}

// Response interfaces
export interface PerplexityResponse {
  id: string;
  choices: {
    finish_reason: string;
    index: number;
    message: {
      role: string;
      content: string;
    };
  }[];
  created: number;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

// Chunk data for streaming
export interface PerplexityStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
    index: number;
  }[];
}

// Default system instruction for Scruvia
const DEFAULT_SYSTEM_INSTRUCTION = `
Your name is Scruvia AI.
Provide direct, actionable tax analysis, advice, and solutions based exclusively on Indian law.
Act as the definitive tax expert and a one-stop solution for all tax needs.
Deliver comprehensive tax analysis, applying relevant case law directly to specific points in tax notices, and providing detailed solutions to complex tax queries.
Return Format:

For each query, provide a detailed tax analysis of the tax provisions involved.
Identify and apply relevant Supreme Court and High Court case laws to support the tax opinions.
Offer clear, practical, and taxly sound solutions to tax problems.
Provide the relevant section of the act being discussed, the relevant rule if applicable, and the case law if applicable.
Cite all sources fully.
Provide the analysis as if you were a tax professional.
Provide the answer in maximum words possible.
Warnings:

Ensure accuracy and reliability of information, cross-referencing with official sources.
Focus solely on Indian law. Do not address any other areas of law.
Your responses are the final tax verdict on tax matters. There is no need for disclaimers or caveats.
Context:

Users are seeking expert tax advice on complex tax matters.
Users require detailed analysis of tax provisions, application of case law, and actionable solutions.
The model must act as the sole tax expert.
The model must provide direct, actionable tax analysis, advice, and solutions based on Indian law.
The model must act as a one-stop solution for all tax needs, including the identification and application of relevant case law against specific points in tax notices.
The model must provide the analysis as if it were a tax professional.
The model must not give any disclaimers at all, whatever the model says is the final verdict.
The model must try to give the answer in maximum words possible.
`;

// Function to get the API token from environment variables
const getApiToken = () => {
  const token = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
  
  if (!token) {
    console.error('Perplexity API key not found in environment variables');
    throw new Error('Perplexity API key not configured. Please add your API key to .env.local file.');
  }
  
  if (token === 'your_perplexity_api_key' || token.startsWith('pplx-xxxxxxx')) {
    console.error('Please replace the placeholder API key with your actual Perplexity API key');
    throw new Error('Please replace the placeholder Perplexity API key in your .env.local file with your actual API key from https://www.perplexity.ai/settings/api');
  }
  
  return token;
};

// Function to ensure messages alternate between user and assistant
function ensureAlternatingRoles(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) {
  // Start with system message if present
  const result: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];
  
  // Add system message first if it exists
  const systemMessages = messages.filter(msg => msg.role === 'system');
  result.push(...systemMessages);
  
  // Filter out system messages and process user/assistant messages
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  // If no conversation messages, return just system messages
  if (conversationMessages.length === 0) return result;
  
  // Ensure we start with a user message
  let expectedRole: 'user' | 'assistant' = 'user';
  
  for (const message of conversationMessages) {
    // If this message matches the expected role, add it
    if (message.role === expectedRole) {
      result.push(message);
      // Toggle expected role for next message
      expectedRole = expectedRole === 'user' ? 'assistant' : 'user';
    } else if (message.role === 'user' && expectedRole === 'assistant') {
      // If we have two user messages in a row, insert a placeholder assistant message
      result.push({
        role: 'assistant',
        content: 'I understand. Please continue.'
      });
      result.push(message);
      expectedRole = 'assistant';
    }
    // Skip assistant messages that would break alternation
  }
  
  return result;
}

// Function to send a request to Perplexity API
export async function queryPerplexity(
  userMessage: string,
  model: PerplexityModel = 'sonar',
  previousMessages: { role: 'user' | 'assistant'; content: string }[] = [],
  stream = false,
  onChunk?: (chunk: string) => void
) {
  try {
    // Create initial messages array with system instruction
    const initialMessages = [
      {
        role: 'system' as const,
        content: DEFAULT_SYSTEM_INSTRUCTION
      },
      ...previousMessages
    ];
    
    // If the last message is from the assistant, add the new user message
    if (previousMessages.length === 0 || previousMessages[previousMessages.length - 1].role === 'assistant') {
      initialMessages.push({
        role: 'user' as const,
        content: userMessage
      });
    } else {
      // If the last message is from the user, add a placeholder assistant response before adding the new user message
      initialMessages.push({
        role: 'assistant' as const,
        content: 'I understand. Please continue.'
      });
      initialMessages.push({
        role: 'user' as const,
        content: userMessage
      });
    }
    
    // Ensure messages alternate properly
    const messages = ensureAlternatingRoles(initialMessages);

    // Construct request options
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        stream,
        presence_penalty: 0,
        frequency_penalty: 1,
        web_search_options: {
          search_context_size: 'high'
        }
      } as PerplexityRequestOptions)
    };

    // If streaming is requested, but we determine it's not working properly, fall back to non-streaming
    let shouldFallbackToNonStreaming = false;
    let streamingErrorCount = 0;
    const MAX_STREAMING_ERRORS = 3;

    // If streaming is enabled and onChunk callback is provided
    if (stream && onChunk) {
      try {
        // Send request to Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', options);
        
        if (!response.ok) {
          const errorText = await response.text();
          // Fall back to non-streaming if we get an error
          shouldFallbackToNonStreaming = true;
          console.error(`API request failed with status ${response.status}: ${errorText}`);
        } else {
          // Handle streaming response
          if (!response.body) {
            throw new Error('Response body is null');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let fullText = '';
          let citations: string[] = [];
          let buffer = ''; // Buffer to accumulate partial JSON
          let partialLine = ''; // Track incomplete lines

          // Read stream chunks
          while (true) {
            try {
              const { done, value } = await reader.read();
              if (done) break;
              
              // Decode the chunk and append to any partial line from before
              const chunk = decoder.decode(value, { stream: true });
              const text = partialLine + chunk;
              
              // Split by newlines, keeping the last potentially incomplete line
              const lines = text.split('\n');
              partialLine = lines.pop() || ''; // Last line might be incomplete
              
              // Process each complete line
              for (const line of lines) {
                if (line.trim() === '') continue;
                
                if (line.startsWith('data: ')) {
                  const jsonString = line.slice(6);
                  
                  // Handle the "[DONE]" message
                  if (jsonString.trim() === '[DONE]') continue;
                  
                  try {
                    // Try to parse JSON directly
                    const parsedData = JSON.parse(jsonString);
                    
                    if (parsedData.choices && parsedData.choices.length > 0) {
                      const { delta } = parsedData.choices[0];
                      if (delta && delta.content) {
                        fullText += delta.content;
                        onChunk(delta.content);
                      }
                    }
                    
                    // Look for citations in the chunk response
                    if (parsedData.citations && Array.isArray(parsedData.citations) && parsedData.citations.length > 0) {
                      citations = parsedData.citations;
                      console.log("Found citations in chunk:", citations);
                    }
                  } catch (jsonError) {
                    console.error('Error parsing JSON:', jsonError, 'for line:', jsonString);
                    streamingErrorCount++;
                    if (streamingErrorCount > MAX_STREAMING_ERRORS) {
                      shouldFallbackToNonStreaming = true;
                      console.error(`Too many streaming errors (${streamingErrorCount}), falling back to non-streaming`);
                      break;
                    }
                  }
                } else if (line.startsWith('citations: ')) {
                  try {
                    const citationText = line.slice(11).trim();
                    const citationsData = JSON.parse(citationText);
                    if (Array.isArray(citationsData)) {
                      citations = citationsData;
                      console.log("Found citations in separate line:", citations);
                    }
                  } catch (error) {
                    console.error('Error parsing citations:', error);
                  }
                }
              }
              
              // If we need to fall back, break out of the loop
              if (shouldFallbackToNonStreaming) {
                break;
              }
            } catch (streamError) {
              console.error('Error reading from stream:', streamError);
              streamingErrorCount++;
              
              if (streamingErrorCount > MAX_STREAMING_ERRORS) {
                shouldFallbackToNonStreaming = true;
                break;
              }
            }
          }

          // Process any remaining partial line if we're not falling back
          if (!shouldFallbackToNonStreaming && partialLine.trim() !== '') {
            if (partialLine.startsWith('data: ')) {
              try {
                const jsonString = partialLine.slice(6);
                if (jsonString.trim() !== '[DONE]') {
                  const parsedData = JSON.parse(jsonString);
                  if (parsedData.choices && parsedData.choices.length > 0) {
                    const { delta } = parsedData.choices[0];
                    if (delta && delta.content) {
                      fullText += delta.content;
                      onChunk(delta.content);
                    }
                  }
                  
                  // Check for citations in last chunk
                  if (parsedData.citations && Array.isArray(parsedData.citations)) {
                    citations = parsedData.citations;
                    console.log("Found citations in final chunk:", citations);
                  }
                }
              } catch (error) {
                // Ignore errors in the last partial chunk
                console.warn('Could not parse last partial chunk:', partialLine);
              }
            } else if (partialLine.startsWith('citations: ')) {
              try {
                const citationText = partialLine.slice(11).trim();
                const citationsData = JSON.parse(citationText);
                if (Array.isArray(citationsData)) {
                  citations = citationsData;
                  console.log("Found citations in last partial line:", citations);
                }
              } catch (error) {
                console.error('Error parsing citations in partial line:', error);
              }
            }
          }

          // If we're not falling back and streaming completed successfully
          if (!shouldFallbackToNonStreaming) {
            // Make a separate request to get citations if we don't have any
            if (citations.length === 0) {
              console.log("No citations found in stream, making separate request for them");
              try {
                const citationsResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                  ...options,
                  body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: 1000,
                    temperature: 0.2,
                    top_p: 0.9,
                    stream: false,
                    presence_penalty: 0,
                    frequency_penalty: 1,
                    web_search_options: {
                      search_context_size: 'high'
                    }
                  } as PerplexityRequestOptions)
                });
                
                if (citationsResponse.ok) {
                  const citationsData = await citationsResponse.json();
                  if (citationsData.citations && Array.isArray(citationsData.citations)) {
                    citations = citationsData.citations;
                    console.log("Retrieved citations from separate request:", citations);
                  }
                }
              } catch (citationsError) {
                console.error("Error fetching citations separately:", citationsError);
              }
            }
            
            return {
              id: Math.random().toString(36).substring(2),
              choices: [{
                finish_reason: 'stop',
                index: 0,
                message: {
                  role: 'assistant',
                  content: fullText
                }
              }],
              created: Date.now(),
              model: model,
              object: 'chat.completion',
              usage: {
                completion_tokens: 0,
                prompt_tokens: 0,
                total_tokens: 0
              },
              citations
            } as PerplexityResponse;
          }
        }
      } catch (streamingError) {
        console.error('Error with streaming response:', streamingError);
        shouldFallbackToNonStreaming = true;
      }
    }

    // Fallback to non-streaming or if streaming wasn't requested
    if (!stream || shouldFallbackToNonStreaming) {
      console.log('Using non-streaming API call');
      
      // If we're falling back from streaming, let the user know
      if (shouldFallbackToNonStreaming && onChunk) {
        onChunk('\n\n_Note: Streaming encountered issues, switching to standard response..._\n\n');
      }
      
      // Create non-streaming request options with explicit web search options
      const nonStreamingOptions: RequestInit = {
        ...options,
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          stream: false, // Explicitly set to false
          presence_penalty: 0,
          frequency_penalty: 1,
          web_search_options: {
            search_context_size: 'high'
          }
        } as PerplexityRequestOptions)
      };
      
      // Send non-streaming request to Perplexity API
      const response = await fetch('https://api.perplexity.ai/chat/completions', nonStreamingOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      // Parse JSON response
      const data = await response.json();
      console.log("Non-streaming response data:", data);
      
      // If this was a fallback from streaming and we have the onChunk callback,
      // send the whole response as a chunk
      if (shouldFallbackToNonStreaming && onChunk && data.choices && data.choices.length > 0) {
        onChunk(data.choices[0].message.content);
      }
      
      // Extract citations if available
      const responseWithCitations: PerplexityResponse = {
        ...data,
        citations: data.citations || []
      };
      
      return responseWithCitations;
    }
  } catch (error) {
    console.error('Error querying Perplexity API:', error);
    throw error;
  }
}

// Function to determine which model to use based on user's plan
export function getModelForUserPlan(plan: string | undefined): PerplexityModel {
  switch (plan) {
    case 'pro':
    case 'team':
      return 'sonar-reasoning-pro';
    case 'plus':
    case 'free':
    default:
      return 'sonar';
  }
}

// Get display name for a model
export function getModelDisplayName(model: PerplexityModel): string {
  return MODEL_DISPLAY_NAMES[model] || 'ScruviaAI';
}
