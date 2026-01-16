/**
 * Comment Moderation Interface
 * Allows moderators to approve, reject, or mark comments as spam
 * Requirements: 8.3, 8.7
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, Bell } from 'lucide-react';
import {
  getPendingComments,
  moderateComment,
  type Comment,
  type ModerationAction,
} from '@/services/commentService';

export function CommentModeration() {
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadPendingComments();
  }, []);

  const loadPendingComments = () => {
    const comments = getPendingComments();
    setPendingComments(comments);
  };

  const handleModerate = async (commentId: string, action: ModerationAction) => {
    setLoading(true);
    try {
      await moderateComment(commentId, action);

      // Show success notification
      const actionText =
        action === 'approve' ? 'одобрен' : action === 'reject' ? 'отклонен' : 'помечен как спам';
      setNotification({
        type: 'success',
        message: `Комментарий ${actionText}`,
      });

      // Send notification to moderators (in production, this would be an API call)
      sendModeratorNotification(commentId, action);

      // Reload pending comments
      loadPendingComments();

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ошибка модерации',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendModeratorNotification = (commentId: string, action: ModerationAction) => {
    // In production, this would send a notification via email, push notification, etc.
    console.log(`[Notification] Comment ${commentId} was ${action}ed by moderator`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Модерация комментариев</h1>
        <p className="text-muted-foreground">
          Управление комментариями, ожидающими модерации
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <Alert
          variant={notification.type === 'error' ? 'destructive' : 'default'}
          className="mb-6"
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ожидают модерации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingComments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Уведомления</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Включены для модераторов
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Статус</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={pendingComments.length > 0 ? 'default' : 'secondary'}>
              {pendingComments.length > 0 ? 'Требуется внимание' : 'Все проверено'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Pending Comments List */}
      <div className="space-y-4">
        {pendingComments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Нет комментариев на модерации</p>
              <p className="text-sm text-muted-foreground">
                Все комментарии проверены
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingComments.map(comment => (
            <CommentModerationCard
              key={comment.id}
              comment={comment}
              onModerate={handleModerate}
              loading={loading}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentModerationCardProps {
  comment: Comment;
  onModerate: (commentId: string, action: ModerationAction) => void;
  loading: boolean;
}

function CommentModerationCard({ comment, onModerate, loading }: CommentModerationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{comment.author.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{comment.author.email}</p>
          </div>
          <Badge variant="outline">Ожидает</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Comment Content */}
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>

        {/* Comment Metadata */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <span>
            Статья: <span className="font-medium">{comment.articleId}</span>
          </span>
          <span>
            Дата:{' '}
            <span className="font-medium">
              {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </span>
          {comment.parentId && (
            <span>
              <Badge variant="secondary" className="text-xs">
                Ответ
              </Badge>
            </span>
          )}
        </div>

        {/* Moderation Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onModerate(comment.id, 'approve')}
            disabled={loading}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Одобрить
          </Button>
          <Button
            onClick={() => onModerate(comment.id, 'reject')}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Отклонить
          </Button>
          <Button
            onClick={() => onModerate(comment.id, 'spam')}
            disabled={loading}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Спам
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
