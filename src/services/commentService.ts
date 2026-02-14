/**
 * Comment Service
 * Handles comment validation, posting, moderation, and counting
 */

export interface CommentData {
  name: string;
  email: string;
  content: string;
  parentId?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  author: {
    name: string;
    email: string;
  };
  content: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  replies: Comment[];
  parentId?: string;
}

export type ModerationAction = 'approve' | 'reject' | 'spam';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// In-memory storage for comments (in production, this would be a database)
const commentsStore: Map<string, Comment[]> = new Map();
let commentIdCounter = 1;

/**
 * Validates comment data
 * Requirements: 8.2
 */
export function validateComment(comment: CommentData): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate name: 2-50 characters, no special characters except spaces, hyphens, apostrophes
  if (!comment.name || comment.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters',
      code: 'INVALID_NAME',
    });
  } else if (comment.name.length > 50) {
    errors.push({
      field: 'name',
      message: 'Name must be less than 50 characters',
      code: 'INVALID_NAME',
    });
  } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-']+$/.test(comment.name)) {
    errors.push({
      field: 'name',
      message: 'Name contains invalid characters',
      code: 'INVALID_NAME',
    });
  }

  // Validate email: Valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!comment.email || !emailRegex.test(comment.email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address',
      code: 'INVALID_EMAIL',
    });
  }

  // Validate content: 10-1000 characters (after trimming)
  const trimmedContent = comment.content ? comment.content.trim() : '';
  if (!trimmedContent || trimmedContent.length < 10) {
    errors.push({
      field: 'content',
      message: 'Comment must be at least 10 characters',
      code: 'CONTENT_TOO_SHORT',
    });
  } else if (trimmedContent.length > 1000) {
    errors.push({
      field: 'content',
      message: 'Comment must be less than 1000 characters',
      code: 'CONTENT_TOO_LONG',
    });
  }

  // Basic spam detection (simple patterns)
  const spamPatterns = [
    /viagra/i,
    /cialis/i,
    /casino/i,
    /\b(buy|cheap|discount)\s+(now|here)\b/i,
    /(http|https):\/\/.*\.(ru|com|net).*\.(ru|com|net)/i, // Multiple domains
  ];

  if (spamPatterns.some(pattern => pattern.test(comment.content))) {
    errors.push({
      field: 'content',
      message: 'Comment flagged as spam',
      code: 'SPAM_DETECTED',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Posts a new comment
 * Requirements: 8.1, 8.2
 */
export async function postComment(
  articleId: string,
  commentData: CommentData
): Promise<Comment> {
  // Validate comment
  const validation = validateComment(commentData);
  if (!validation.isValid) {
    throw new Error(
      `Comment validation failed: ${validation.errors.map(e => e.message).join(', ')}`
    );
  }

  // Create new comment
  const newComment: Comment = {
    id: `comment-${commentIdCounter++}`,
    articleId,
    author: {
      name: commentData.name.trim(),
      email: commentData.email.trim().toLowerCase(),
    },
    content: commentData.content.trim(),
    createdAt: new Date(),
    status: 'pending', // All comments start as pending moderation
    replies: [],
    parentId: commentData.parentId,
  };

  // Store comment
  const articleComments = commentsStore.get(articleId) || [];
  
  if (commentData.parentId) {
    // This is a reply - add it to the parent comment's replies
    const parentComment = findCommentById(articleComments, commentData.parentId);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }
    parentComment.replies.push(newComment);
  } else {
    // This is a top-level comment
    articleComments.push(newComment);
  }
  
  commentsStore.set(articleId, articleComments);

  return newComment;
}

/**
 * Replies to an existing comment (nested comments)
 * Requirements: 8.5
 */
export async function replyToComment(
  commentId: string,
  replyData: CommentData
): Promise<Comment> {
  // Find the parent comment
  let parentComment: Comment | null = null;
  let articleId: string | null = null;

  for (const [artId, comments] of commentsStore.entries()) {
    parentComment = findCommentById(comments, commentId);
    if (parentComment) {
      articleId = artId;
      break;
    }
  }

  if (!parentComment || !articleId) {
    throw new Error('Parent comment not found');
  }

  // Post the reply with parentId set
  return postComment(articleId, {
    ...replyData,
    parentId: commentId,
  });
}

/**
 * Moderates a comment (approve, reject, or mark as spam)
 * Requirements: 8.3
 */
export async function moderateComment(
  commentId: string,
  action: ModerationAction
): Promise<void> {
  let comment: Comment | null = null;

  // Find the comment across all articles
  for (const comments of commentsStore.values()) {
    comment = findCommentById(comments, commentId);
    if (comment) break;
  }

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Update comment status based on action
  switch (action) {
    case 'approve':
      comment.status = 'approved';
      break;
    case 'reject':
      comment.status = 'rejected';
      break;
    case 'spam':
      comment.status = 'spam';
      break;
  }
}

/**
 * Gets all comments for an article
 * Requirements: 8.1
 */
export function getComments(articleId: string): Comment[] {
  return commentsStore.get(articleId) || [];
}

/**
 * Gets only approved comments for an article
 */
export function getApprovedComments(articleId: string): Comment[] {
  const comments = getComments(articleId);
  return filterApprovedComments(comments);
}

/**
 * Counts total comments for an article (including nested replies)
 * Requirements: 8.6
 */
export function countComments(articleId: string, includeReplies = true): number {
  const comments = getApprovedComments(articleId);
  
  if (!includeReplies) {
    return comments.length;
  }

  return countCommentsRecursive(comments);
}

/**
 * Counts approved comments for an article
 * Requirements: 8.6
 */
export function countApprovedComments(articleId: string): number {
  return countComments(articleId, true);
}

/**
 * Gets all pending comments (for moderation)
 * Requirements: 8.3
 */
export function getPendingComments(): Comment[] {
  const allPending: Comment[] = [];

  for (const comments of commentsStore.values()) {
    allPending.push(...findCommentsByStatus(comments, 'pending'));
  }

  return allPending;
}

/**
 * Helper function to recursively count comments including replies
 */
function countCommentsRecursive(comments: Comment[]): number {
  let count = 0;
  
  for (const comment of comments) {
    count++; // Count this comment
    if (comment.replies && comment.replies.length > 0) {
      count += countCommentsRecursive(comment.replies); // Count replies recursively
    }
  }
  
  return count;
}

/**
 * Helper function to find a comment by ID (searches recursively)
 */
function findCommentById(comments: Comment[], commentId: string): Comment | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentById(comment.replies, commentId);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Helper function to filter only approved comments (recursively)
 */
function filterApprovedComments(comments: Comment[]): Comment[] {
  return comments
    .filter(comment => comment.status === 'approved')
    .map(comment => ({
      ...comment,
      replies: filterApprovedComments(comment.replies),
    }));
}

/**
 * Helper function to find comments by status (recursively)
 */
function findCommentsByStatus(
  comments: Comment[],
  status: Comment['status']
): Comment[] {
  const result: Comment[] = [];

  for (const comment of comments) {
    if (comment.status === status) {
      result.push(comment);
    }
    
    if (comment.replies && comment.replies.length > 0) {
      result.push(...findCommentsByStatus(comment.replies, status));
    }
  }

  return result;
}

/**
 * Clears all comments (for testing purposes)
 */
export function clearAllComments(): void {
  commentsStore.clear();
  commentIdCounter = 1;
}
