import React from 'react';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children }) => {
  const language = className ? className.replace(/language-/, '') : '';
  
  return (
    <div className="relative">
      <pre className="rounded-md bg-gray-900 p-4 overflow-x-auto">
        {language && (
          <div className="absolute top-2 right-2 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
            {language}
          </div>
        )}
        <code className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock; 