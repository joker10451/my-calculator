import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlogShare } from '@/components/blog/BlogShare';
import type { BlogPost } from '@/types/blog';
import { shareTrackingService } from '@/services/shareTrackingService';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock shareTrackingService
vi.mock('@/services/shareTrackingService', () => ({
  shareTrackingService: {
    trackShare: vi.fn(),
    getShareCount: vi.fn(() => 0),
  },
}));

describe('BlogShare Component Unit Tests', () => {
  const mockPost: BlogPost = {
    id: '1',
    slug: 'test-article',
    title: 'Test Article Title',
    excerpt: 'Test article excerpt for sharing',
    content: 'Test content',
    author: { name: 'Test Author' },
    publishedAt: '2026-01-01T00:00:00Z',
    category: {
      id: '1',
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test description',
      color: '#000000',
      seo: {},
    },
    tags: ['test'],
    seo: {},
    readingTime: 5,
    isPublished: true,
    isFeatured: false,
  };

  let clipboardWriteTextSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open
    vi.stubGlobal('open', vi.fn());
    // Mock clipboard API using vi.spyOn
    clipboardWriteTextSpy = vi.fn(() => Promise.resolve());
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: {
        writeText: clipboardWriteTextSpy,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Share Dialog Opening', () => {
    test('should render share button', () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      expect(shareButton).toBeInTheDocument();
    });

    test('should open dialog when share button is clicked', async () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('Поделиться статьей')).toBeInTheDocument();
      });
    });

    test('should display all sharing options in dialog', async () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('ВКонтакте')).toBeInTheDocument();
        expect(screen.getByText('Telegram')).toBeInTheDocument();
        expect(screen.getByText('WhatsApp')).toBeInTheDocument();
        expect(screen.getByText(/скопировать ссылку/i)).toBeInTheDocument();
      });
    });
  });

  describe('Copy Link Functionality', () => {
    test('should copy link to clipboard when copy button is clicked', async () => {
      const { toast } = await import('sonner');
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copyButton = screen.getByText(/скопировать ссылку/i);
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(clipboardWriteTextSpy).toHaveBeenCalledWith(
          expect.stringContaining('/blog/test-article')
        );
        expect(toast.success).toHaveBeenCalledWith('Ссылка скопирована в буфер обмена');
      });
    });

    test('should track share event when link is copied', async () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copyButton = screen.getByText(/скопировать ссылку/i);
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(shareTrackingService.trackShare).toHaveBeenCalledWith(
          '1',
          'test-article',
          'copy_link'
        );
      });
    });

    test('should show success feedback after copying', async () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copyButton = screen.getByText(/скопировать ссылку/i);
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Ссылка скопирована!')).toBeInTheDocument();
      });
    });

    test('should handle clipboard error gracefully', async () => {
      const { toast } = await import('sonner');
      // Mock clipboard to reject
      clipboardWriteTextSpy.mockRejectedValueOnce(new Error('Clipboard error'));

      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copyButton = screen.getByText(/скопировать ссылку/i);
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Не удалось скопировать ссылку');
      });
    });
  });

  describe('Share Count Display', () => {
    test('should not display share count when shareCount < 10', () => {
      render(<BlogShare post={mockPost} shareCount={5} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      expect(shareButton.textContent).not.toContain('(5)');
    });

    test('should display share count when shareCount >= 10', () => {
      render(<BlogShare post={mockPost} shareCount={15} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      expect(shareButton.textContent).toContain('(15)');
    });

    test('should display share count for exactly 10 shares', () => {
      render(<BlogShare post={mockPost} shareCount={10} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      expect(shareButton.textContent).toContain('(10)');
    });

    test('should display large share counts correctly', () => {
      render(<BlogShare post={mockPost} shareCount={1234} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      expect(shareButton.textContent).toContain('(1234)');
    });
  });

  describe('Social Platform Sharing', () => {
    test('should open VK share dialog when VK button is clicked', async () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const vkButton = screen.getByText('ВКонтакте');
        fireEvent.click(vkButton);
      });

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('vk.com/share.php'),
        '_blank',
        'width=600,height=400'
      );
      expect(shareTrackingService.trackShare).toHaveBeenCalledWith('1', 'test-article', 'vk');
    });

    test('should open Telegram share dialog when Telegram button is clicked', async () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const telegramButton = screen.getByText('Telegram');
        fireEvent.click(telegramButton);
      });

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('t.me/share/url'),
        '_blank',
        'width=600,height=400'
      );
      expect(shareTrackingService.trackShare).toHaveBeenCalledWith('1', 'test-article', 'telegram');
    });

    test('should open WhatsApp share dialog when WhatsApp button is clicked', async () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const whatsappButton = screen.getByText('WhatsApp');
        fireEvent.click(whatsappButton);
      });

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('wa.me'),
        '_blank',
        'width=600,height=400'
      );
      expect(shareTrackingService.trackShare).toHaveBeenCalledWith('1', 'test-article', 'whatsapp');
    });

    test('should close dialog after sharing to social platform', async () => {
      render(<BlogShare post={mockPost} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('Поделиться статьей')).toBeInTheDocument();
      });

      const vkButton = screen.getByText('ВКонтакте');
      fireEvent.click(vkButton);

      await waitFor(() => {
        expect(screen.queryByText('Поделиться статьей')).not.toBeInTheDocument();
      });
    });
  });

  describe('URL Encoding', () => {
    test('should properly encode article title in share URLs', async () => {
      const postWithSpecialChars = {
        ...mockPost,
        title: 'Тест: "Специальные" символы & знаки',
      };

      render(<BlogShare post={postWithSpecialChars} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const vkButton = screen.getByText('ВКонтакте');
        fireEvent.click(vkButton);
      });

      const openCall = (window.open as any).mock.calls[0][0];
      expect(openCall).toContain(encodeURIComponent(postWithSpecialChars.title));
    });

    test('should properly encode article URL in share links', async () => {
      const postWithSpecialSlug = {
        ...mockPost,
        slug: 'test-article-2026',
      };

      render(<BlogShare post={postWithSpecialSlug} />);
      
      const shareButton = screen.getByRole('button', { name: /поделиться/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const telegramButton = screen.getByText('Telegram');
        fireEvent.click(telegramButton);
      });

      const openCall = (window.open as any).mock.calls[0][0];
      expect(openCall).toContain(encodeURIComponent(`/blog/${postWithSpecialSlug.slug}`));
    });
  });
});
