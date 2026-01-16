/**
 * BlogComments Component
 * Displays comments and comment form for blog articles
 * Requirements: 8.1, 8.2, 8.4, 8.5, 8.6
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Reply, AlertCircle, CheckCircle } from 'lucide-react';
import {
  postComment,
  getApprovedComments,
  countApprovedComments,
  type Comment,
  type CommentData,
  type ValidationError,
} from '@/services/commentService';

interface BlogCommentsProps {
  articleId: string;
}

interface CommentFormData {
  name: string;
  email: string;
  content: string;
  parentId?: string;
}

export function BlogComments({ articleId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [formData, setFormData] = useState<CommentFormData>({
    name: '',
    email: '',
    content: '',
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle'
  );
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = () => {
    const approvedComments = getApprovedComments(articleId);
    setComments(approvedComments);
    setCommentCount(countApprovedComments(articleId));
  };

  const handleInputChange = (field: keyof CommentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Имя должно быть короче 50 символов';
    } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-']+$/.test(formData.name)) {
      newErrors.name = 'Имя содержит недопустимые символы';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Пожалуйста, введите корректный email';
    }

    // Validate content
    if (!formData.content || formData.content.trim().length < 10) {
      newErrors.content = 'Комментарий должен содержать минимум 10 символов';
    } else if (formData.content.length > 1000) {
      newErrors.content = 'Комментарий должен быть короче 1000 символов';
    }

    // Validate CAPTCHA
    if (!captchaVerified) {
      newErrors.captcha = 'Пожалуйста, подтвердите что вы не робот';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitStatus('submitting');

    try {
      const commentData: CommentData = {
        name: formData.name,
        email: formData.email,
        content: formData.content,
        parentId: replyingTo || undefined,
      };

      await postComment(articleId, commentData);

      // Success
      setSubmitStatus('success');
      setFormData({ name: '', email: '', content: '' });
      setReplyingTo(null);
      setCaptchaVerified(false);

      // Reload comments (in real app, the new comment would be pending moderation)
      setTimeout(() => {
        loadComments();
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      if (error instanceof Error) {
        // Parse validation errors from service
        const errorMessage = error.message;
        if (errorMessage.includes('validation failed')) {
          setErrors({ general: 'Проверьте правильность заполнения полей' });
        } else {
          setErrors({ general: errorMessage });
        }
      }
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    // Scroll to form
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Simple CAPTCHA simulation (in production, use reCAPTCHA or similar)
  const handleCaptchaVerify = () => {
    const answer = prompt('Сколько будет 2 + 2?');
    if (answer === '4') {
      setCaptchaVerified(true);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.captcha;
        return newErrors;
      });
    } else {
      alert('Неверный ответ. Попробуйте снова.');
    }
  };

  return (
    <div className="mt-12 border-t pt-8">
      {/* Comment Count Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5" />
        <h3 className="text-xl font-semibold">
          Комментарии {commentCount > 0 && `(${commentCount})`}
        </h3>
      </div>

      {/* Comment Form */}
      <div id="comment-form" className="mb-8 p-6 bg-muted/50 rounded-lg">
        <h4 className="text-lg font-medium mb-4">
          {replyingTo ? 'Ответить на комментарий' : 'Оставить комментарий'}
        </h4>

        {replyingTo && (
          <div className="mb-4 p-3 bg-background rounded border">
            <p className="text-sm text-muted-foreground mb-2">Вы отвечаете на комментарий</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelReply}
              className="text-xs"
            >
              Отменить
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <Label htmlFor="name">Имя *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Ваше имя"
              className={errors.name ? 'border-destructive' : ''}
              disabled={submitStatus === 'submitting'}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className={errors.email ? 'border-destructive' : ''}
              disabled={submitStatus === 'submitting'}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Email не будет опубликован
            </p>
          </div>

          {/* Content Field */}
          <div>
            <Label htmlFor="content">Комментарий *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={e => handleInputChange('content', e.target.value)}
              placeholder="Ваш комментарий..."
              rows={4}
              className={errors.content ? 'border-destructive' : ''}
              disabled={submitStatus === 'submitting'}
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1">{errors.content}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formData.content.length}/1000 символов
            </p>
          </div>

          {/* CAPTCHA */}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCaptchaVerify}
              disabled={captchaVerified || submitStatus === 'submitting'}
            >
              {captchaVerified ? '✓ Проверка пройдена' : 'Я не робот'}
            </Button>
            {errors.captcha && (
              <p className="text-sm text-destructive mt-1">{errors.captcha}</p>
            )}
          </div>

          {/* General Errors */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {submitStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Комментарий отправлен! Он появится после модерации.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitStatus === 'submitting'}
            className="w-full sm:w-auto"
          >
            {submitStatus === 'submitting' ? 'Отправка...' : 'Отправить комментарий'}
          </Button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Пока нет комментариев. Будьте первым!
          </p>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              level={0}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  level: number;
}

function CommentItem({ comment, onReply, level }: CommentItemProps) {
  const maxNestingLevel = 3;
  const canReply = level < maxNestingLevel;

  return (
    <div
      className={`${level > 0 ? 'ml-8 mt-4' : ''} p-4 bg-muted/30 rounded-lg`}
      data-comment-id={comment.id}
    >
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium">{comment.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Comment Content */}
      <p className="text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>

      {/* Reply Button */}
      {canReply && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReply(comment.id)}
          className="text-xs"
        >
          <Reply className="w-3 h-3 mr-1" />
          Ответить
        </Button>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
