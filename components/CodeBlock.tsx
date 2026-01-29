
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-4 group">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyToClipboard}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-gray-700 max-h-[500px]">
        <div className="flex justify-between mb-2 text-xs text-gray-500 uppercase tracking-wider">
          <span>{language}</span>
        </div>
        <pre className="text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
