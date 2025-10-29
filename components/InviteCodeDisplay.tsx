import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export interface InviteCodeDisplayProps {
  code: string;
  className?: string;
}

export default function InviteCodeDisplay({ code, className }: InviteCodeDisplayProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopied(true);
      showToast('Invite code copied to clipboard!', 'success');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('Failed to copy invite code', 'error');
    }
  };

  return (
    <Card className={cn('max-w-md', className)}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Your Invite Code</h3>
          <p className="text-sm text-slate-400">Share this code with others to invite them</p>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
            <code className="flex-1 text-2xl font-mono font-bold text-cosmic-400 tracking-wider text-center">
              {code}
            </code>
          </div>
        </div>

        <Button
          onClick={handleCopy}
          variant="primary"
          size="md"
          className="w-full"
          aria-label="Copy invite code"
        >
          <span className="flex items-center justify-center gap-2">
            {copied ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy to Clipboard
              </>
            )}
          </span>
        </Button>
      </div>
    </Card>
  );
}
