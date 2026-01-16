/**
 * Unit Tests for BlogComments Component
 * Requirements: 8.2, 8.5
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlogComments } from '@/components/blog/BlogComments';
import * as commentService from '@/services/commentService';

// Mock the comment service
vi.mock('@/services/commentService', () => ({
  postComment: vi.fn(),
  getApprovedComments: vi.fn(),
  countApprovedComments: vi.fn(),
  validateComment: vi.fn(),
}));

describe('BlogComments Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(commentService.getApprovedComments).mockReturnValue([]);
    vi.mocked(commentService.countApprovedComments).mockReturnValue(0);
    
    // Mock scrollIntoView for jsdom
    Element.prototype.scrollIntoView = vi.fn();
    
    // Mock window.prompt and window.alert for CAPTCHA tests
    window.prompt = vi.fn();
    window.alert = vi.fn();
  });

  describe('Form Validation', () => {
    test('displays error when name is too short', async () => {
      render(<BlogComments articleId="test-article" />);

      const nameInput = screen.getByLabelText(/имя/i);
      const submitButton = screen.getByRole('button', { name: /отправить комментарий/i });

      await userEvent.type(nameInput, 'A');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/имя должно содержать минимум 2 символа/i)).toBeInTheDocument();
      });
    });

    test('displays error when name is too long', async () => {
      render(<BlogComments articleId="test-article" />);

      const nameInput = screen.getByLabelText(/имя/i);
      const submitButton = screen.getByRole('button', { name: /отправить комментарий/i });

      await userEvent.type(nameInput, 'A'.repeat(51));
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/имя должно быть короче 50 символов/i)).toBeInTheDocument();
      });
    });

    test('displays error when email is invalid', async () => {
      render(<BlogComments articleId="test-article" />);

      const submitButton = screen.getByRole('button', { name: /отправить комментарий/i });

      // Submit empty form - should show all validation errors including email
      await userEvent.click(submitButton);

      // All validation errors should appear
      await waitFor(() => {
        expect(screen.getByText(/имя должно содержать минимум 2 символа/i)).toBeInTheDocument();
        expect(screen.getByText(/пожалуйста, введите корректный email/i)).toBeInTheDocument();
        expect(screen.getByText(/комментарий должен содержать минимум 10 символов/i)).toBeInTheDocument();
        expect(screen.getByText(/подтвердите что вы не робот/i)).toBeInTheDocument();
      });
    });

    test('displays error when content is too short', async () => {
      render(<BlogComments articleId="test-article" />);

      const contentInput = screen.getByLabelText(/комментарий/i);
      const submitButton = screen.getByRole('button', { name: /отправить комментарий/i });

      await userEvent.type(contentInput, 'Short');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/комментарий должен содержать минимум 10 символов/i)
        ).toBeInTheDocument();
      });
    });

    test('displays error when content is too long', async () => {
      render(<BlogComments articleId="test-article" />);

      const contentInput = screen.getByLabelText(/комментарий/i);
      const submitButton = screen.getByRole('button', { name: /отправить комментарий/i });

      // Use paste instead of type for long text (much faster)
      const longText = 'A'.repeat(1001);
      await userEvent.click(contentInput);
      await userEvent.paste(longText);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/комментарий должен быть короче 1000 символов/i)
        ).toBeInTheDocument();
      });
    });

    test('displays error when CAPTCHA is not verified', async () => {
      render(<BlogComments articleId="test-article" />);

      const nameInput = screen.getByLabelText(/имя/i);
      const emailInput = screen.getByLabelText(/email/i);
      const contentInput = screen.getByLabelText(/комментарий/i);
      const submitButton = screen.getByRole('button', { name: /отправить комментарий/i });

      await userEvent.type(nameInput, 'John Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(contentInput, 'This is a valid comment with enough text');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/подтвердите что вы не робот/i)).toBeInTheDocument();
      });
    });

    test('clears error when user starts typing', async () => {
      render(<BlogComments articleId="test-article" />);

      const nameInput = screen.getByLabelText(/имя/i);
      const submitButton = screen.getByRole('button', { name: /отправить комментарий/i });

      // Trigger validation error by submitting empty form
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/имя должно содержать минимум 2 символа/i)).toBeInTheDocument();
      });

      // Start typing
      await userEvent.type(nameInput, 'John');

      // Error should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText(/имя должно содержать минимум 2 символа/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Comment Display', () => {
    test('displays "no comments" message when there are no comments', () => {
      vi.mocked(commentService.getApprovedComments).mockReturnValue([]);
      vi.mocked(commentService.countApprovedComments).mockReturnValue(0);

      render(<BlogComments articleId="test-article" />);

      expect(screen.getByText(/пока нет комментариев/i)).toBeInTheDocument();
    });

    test('displays comment count in header', () => {
      const mockComments = [
        {
          id: 'comment-1',
          articleId: 'test-article',
          author: { name: 'John Doe', email: 'john@example.com' },
          content: 'Great article!',
          createdAt: new Date(),
          status: 'approved' as const,
          replies: [],
        },
      ];

      vi.mocked(commentService.getApprovedComments).mockReturnValue(mockComments);
      vi.mocked(commentService.countApprovedComments).mockReturnValue(1);

      render(<BlogComments articleId="test-article" />);

      expect(screen.getByText(/комментарии \(1\)/i)).toBeInTheDocument();
    });

    test('displays comments with author name and content', () => {
      const mockComments = [
        {
          id: 'comment-1',
          articleId: 'test-article',
          author: { name: 'John Doe', email: 'john@example.com' },
          content: 'This is a test comment',
          createdAt: new Date('2024-01-15T10:00:00'),
          status: 'approved' as const,
          replies: [],
        },
      ];

      vi.mocked(commentService.getApprovedComments).mockReturnValue(mockComments);
      vi.mocked(commentService.countApprovedComments).mockReturnValue(1);

      render(<BlogComments articleId="test-article" />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    test('displays nested replies', () => {
      const mockComments = [
        {
          id: 'comment-1',
          articleId: 'test-article',
          author: { name: 'John Doe', email: 'john@example.com' },
          content: 'Parent comment',
          createdAt: new Date(),
          status: 'approved' as const,
          replies: [
            {
              id: 'comment-2',
              articleId: 'test-article',
              author: { name: 'Jane Smith', email: 'jane@example.com' },
              content: 'Reply to parent',
              createdAt: new Date(),
              status: 'approved' as const,
              replies: [],
              parentId: 'comment-1',
            },
          ],
        },
      ];

      vi.mocked(commentService.getApprovedComments).mockReturnValue(mockComments);
      vi.mocked(commentService.countApprovedComments).mockReturnValue(2);

      render(<BlogComments articleId="test-article" />);

      expect(screen.getByText('Parent comment')).toBeInTheDocument();
      expect(screen.getByText('Reply to parent')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Nested Replies', () => {
    test('shows reply button for comments', () => {
      const mockComments = [
        {
          id: 'comment-1',
          articleId: 'test-article',
          author: { name: 'John Doe', email: 'john@example.com' },
          content: 'Test comment',
          createdAt: new Date(),
          status: 'approved' as const,
          replies: [],
        },
      ];

      vi.mocked(commentService.getApprovedComments).mockReturnValue(mockComments);
      vi.mocked(commentService.countApprovedComments).mockReturnValue(1);

      render(<BlogComments articleId="test-article" />);

      const replyButtons = screen.getAllByRole('button', { name: /ответить/i });
      expect(replyButtons.length).toBeGreaterThan(0);
    });

    test('shows "replying to" message when reply button is clicked', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          articleId: 'test-article',
          author: { name: 'John Doe', email: 'john@example.com' },
          content: 'Test comment',
          createdAt: new Date(),
          status: 'approved' as const,
          replies: [],
        },
      ];

      vi.mocked(commentService.getApprovedComments).mockReturnValue(mockComments);
      vi.mocked(commentService.countApprovedComments).mockReturnValue(1);

      render(<BlogComments articleId="test-article" />);

      const replyButton = screen.getAllByRole('button', { name: /ответить/i })[0];
      await userEvent.click(replyButton);

      await waitFor(() => {
        expect(screen.getByText(/вы отвечаете на комментарий/i)).toBeInTheDocument();
      });
    });

    test('can cancel reply', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          articleId: 'test-article',
          author: { name: 'John Doe', email: 'john@example.com' },
          content: 'Test comment',
          createdAt: new Date(),
          status: 'approved' as const,
          replies: [],
        },
      ];

      vi.mocked(commentService.getApprovedComments).mockReturnValue(mockComments);
      vi.mocked(commentService.countApprovedComments).mockReturnValue(1);

      render(<BlogComments articleId="test-article" />);

      // Click reply
      const replyButton = screen.getAllByRole('button', { name: /ответить/i })[0];
      await userEvent.click(replyButton);

      await waitFor(() => {
        expect(screen.getByText(/вы отвечаете на комментарий/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /отменить/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/вы отвечаете на комментарий/i)).not.toBeInTheDocument();
      });
    });

    test('displays deeply nested replies up to 3 levels', () => {
      const mockComments = [
        {
          id: 'comment-1',
          articleId: 'test-article',
          author: { name: 'Level 0', email: 'level0@example.com' },
          content: 'Level 0 comment',
          createdAt: new Date(),
          status: 'approved' as const,
          replies: [
            {
              id: 'comment-2',
              articleId: 'test-article',
              author: { name: 'Level 1', email: 'level1@example.com' },
              content: 'Level 1 reply',
              createdAt: new Date(),
              status: 'approved' as const,
              replies: [
                {
                  id: 'comment-3',
                  articleId: 'test-article',
                  author: { name: 'Level 2', email: 'level2@example.com' },
                  content: 'Level 2 reply',
                  createdAt: new Date(),
                  status: 'approved' as const,
                  replies: [
                    {
                      id: 'comment-4',
                      articleId: 'test-article',
                      author: { name: 'Level 3', email: 'level3@example.com' },
                      content: 'Level 3 reply',
                      createdAt: new Date(),
                      status: 'approved' as const,
                      replies: [],
                      parentId: 'comment-3',
                    },
                  ],
                  parentId: 'comment-2',
                },
              ],
              parentId: 'comment-1',
            },
          ],
        },
      ];

      vi.mocked(commentService.getApprovedComments).mockReturnValue(mockComments);
      vi.mocked(commentService.countApprovedComments).mockReturnValue(4);

      render(<BlogComments articleId="test-article" />);

      // All levels should be displayed
      expect(screen.getByText('Level 0 comment')).toBeInTheDocument();
      expect(screen.getByText('Level 1 reply')).toBeInTheDocument();
      expect(screen.getByText('Level 2 reply')).toBeInTheDocument();
      expect(screen.getByText('Level 3 reply')).toBeInTheDocument();
    });
  });

  describe('Character Counter', () => {
    test('displays character count for comment content', async () => {
      render(<BlogComments articleId="test-article" />);

      const contentInput = screen.getByLabelText(/комментарий/i) as HTMLTextAreaElement;

      await userEvent.type(contentInput, 'Test comment');

      // userEvent.type adds characters one by one, so the final text might be different
      // Check that the counter shows the actual length
      const actualLength = contentInput.value.length;
      expect(screen.getByText(new RegExp(`${actualLength}/1000 символов`, 'i'))).toBeInTheDocument();
    });

    test('updates character count as user types', async () => {
      render(<BlogComments articleId="test-article" />);

      const contentInput = screen.getByLabelText(/комментарий/i) as HTMLTextAreaElement;

      await userEvent.type(contentInput, 'Hello');
      let actualLength = contentInput.value.length;
      expect(screen.getByText(new RegExp(`${actualLength}/1000 символов`, 'i'))).toBeInTheDocument();

      await userEvent.type(contentInput, ' World');
      actualLength = contentInput.value.length;
      expect(screen.getByText(new RegExp(`${actualLength}/1000 символов`, 'i'))).toBeInTheDocument();
    });
  });
});
