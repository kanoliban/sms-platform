'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { toast } from '@/components/ui/toast';

export interface ShareSpaceModalProps {
  open: boolean;
  onClose: () => void;
  space: {
    id: string;
    name: string;
    url: string;
  };
}

type SharePlatform = 'twitter' | 'linkedin' | 'whatsapp' | 'facebook' | 'email' | 'copy';

interface ShareOption {
  platform: SharePlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const shareOptions: ShareOption[] = [
  {
    platform: 'twitter',
    label: 'Twitter',
    color: '#1DA1F2',
    bgColor: 'rgba(29, 161, 242, 0.15)',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    bgColor: 'rgba(10, 102, 194, 0.15)',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    bgColor: 'rgba(37, 211, 102, 0.15)',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    bgColor: 'rgba(24, 119, 242, 0.15)',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    platform: 'email',
    label: 'Email',
    color: 'var(--text-secondary)',
    bgColor: 'var(--bg-subtle)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    platform: 'copy',
    label: 'Copy Link',
    color: 'var(--primary)',
    bgColor: 'var(--primary-muted)',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
];

export function ShareSpaceModal({ open, onClose, room }: ShareSpaceModalProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = useCallback((platform: SharePlatform): string | null => {
    const text = `Join me at ${space.name}!`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(room.url);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'email':
        return `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`;
      case 'copy':
        return null;
      default:
        return null;
    }
  }, [space.name, room.url]);

  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(room.url);
        setCopied(true);
        toast({
          variant: 'success',
          title: 'Link copied!',
          description: 'The space link has been copied to your clipboard.',
        });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast({
          variant: 'error',
          title: 'Failed to copy',
          description: 'Could not copy the link to clipboard.',
        });
      }
      return;
    }

    const url = getShareUrl(platform);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  }, [room.url, getShareUrl, toast]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: space.name,
          text: `Join me at ${space.name}!`,
          url: room.url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast({
            variant: 'error',
            title: 'Share failed',
            description: 'Could not share the space.',
          });
        }
      }
    }
  }, [space.name, room.url, toast]);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(room.url);
      setCopied(true);
      toast({
        variant: 'success',
        title: 'Link copied!',
        description: 'The space link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to copy',
        description: 'Could not copy the link to clipboard.',
      });
    }
  }, [room.url, toast]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          <span>Share Room</span>
        </div>
      }
      description={`Invite people to ${space.name}`}
    >
      <div className="space-y-6">
        {/* Native Share Button (mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleNativeShare}
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" />
            </svg>
            Share
          </Button>
        )}

        {/* Share Icons Grid */}
        <div>
          <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)] mb-3">
            Share via
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.platform}
                type="button"
                onClick={() => handleShare(option.platform)}
                className="
                  flex flex-col items-center gap-2 p-4
                  rounded-[var(--radius-lg)]
                  bg-[var(--bg-subtle)]
                  border border-[var(--border-subtle)]
                  hover:border-[var(--border-hover)]
                  hover:bg-[var(--bg-surface-hover)]
                  transition-all duration-[var(--duration-normal)]
                  group
                "
              >
                <div
                  className="
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    transition-transform duration-[var(--duration-normal)]
                    group-hover:scale-110
                  "
                  style={{
                    backgroundColor: option.bgColor,
                    color: option.color,
                  }}
                >
                  {option.icon}
                </div>
                <span className="text-[var(--text-xs)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {option.platform === 'copy' && copied ? 'Copied!' : option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* URL Input with Copy */}
        <div>
          <label className="block text-[var(--text-sm)] font-medium text-[var(--text-secondary)] mb-2">
            Room Link
          </label>
          <div className="flex gap-2">
            <Input
              value={room.url}
              readOnly
              className="flex-1"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant={copied ? 'primary' : 'secondary'}
              onClick={handleCopyUrl}
              className="min-w-[80px]"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ShareSpaceModal;
