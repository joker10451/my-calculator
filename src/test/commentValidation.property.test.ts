/**
 * Property-Based Tests for Comment System
 * Feature: blog-development
 * Tests Properties 26 and 27 from design document
 */

import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  validateComment,
  postComment,
  countApprovedComments,
  moderateComment,
  clearAllComments,
  type CommentData,
} from '../services/commentService';

describe('Property Tests: Comment Validation', () => {
  beforeEach(() => {
    clearAllComments();
  });

  afterEach(() => {
    clearAllComments();
  });

  test('Property 26: Comment Validation - valid name and email are accepted', () => {
    // Feature: blog-development, Property 26: Comment Validation
    fc.assert(
      fc.property(
        // Generate valid names: 2-50 characters, letters and spaces (trimmed)
        fc.stringMatching(/^[a-zA-Zа-яА-ЯёЁ\s\-']{2,50}$/).map(s => s.trim()).filter(s => s.length >= 2 && s.length <= 50),
        // Generate valid emails
        fc.emailAddress(),
        // Generate valid content: 10-1000 characters with actual text (not just whitespace)
        fc.string({ minLength: 10, maxLength: 1000 }).map(s => s.trim()).filter(s => {
          // Filter out spam patterns and ensure content has actual text
          const spamPatterns = [
            /viagra/i,
            /cialis/i,
            /casino/i,
            /\b(buy|cheap|discount)\s+(now|here)\b/i,
          ];
          return s.length >= 10 && s.length <= 1000 && !spamPatterns.some(pattern => pattern.test(s));
        }),
        (name, email, content) => {
          const comment: CommentData = {
            name,
            email,
            content,
          };

          const result = validateComment(comment);

          // Valid comments should pass validation
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 26: Comment Validation - invalid name is rejected', () => {
    // Feature: blog-development, Property 26: Comment Validation
    fc.assert(
      fc.property(
        // Generate invalid names: too short (< 2 chars) or too long (> 50 chars) or with invalid characters
        fc.oneof(
          fc.string({ maxLength: 1 }), // Too short
          fc.string({ minLength: 51, maxLength: 100 }), // Too long
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => /[^a-zA-Zа-яА-ЯёЁ\s\-']/.test(s)) // Invalid chars
        ),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 1000 }),
        (name, email, content) => {
          const comment: CommentData = {
            name,
            email,
            content,
          };

          const result = validateComment(comment);

          // Invalid names should fail validation
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'name')).toBe(true);
          expect(result.errors.some(e => e.code === 'INVALID_NAME')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 26: Comment Validation - invalid email is rejected', () => {
    // Feature: blog-development, Property 26: Comment Validation
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Zа-яА-ЯёЁ\s\-']{2,50}$/),
        // Generate invalid emails
        fc.oneof(
          fc.string().filter(s => !s.includes('@')), // No @ symbol
          fc.string().filter(s => s.includes('@') && !s.includes('.')), // No domain
          fc.constant(''), // Empty
          fc.constant('invalid@'), // Incomplete
          fc.constant('@invalid.com') // No local part
        ),
        fc.string({ minLength: 10, maxLength: 1000 }),
        (name, email, content) => {
          const comment: CommentData = {
            name,
            email,
            content,
          };

          const result = validateComment(comment);

          // Invalid emails should fail validation
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'email')).toBe(true);
          expect(result.errors.some(e => e.code === 'INVALID_EMAIL')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 26: Comment Validation - content length validation', () => {
    // Feature: blog-development, Property 26: Comment Validation
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Zа-яА-ЯёЁ\s\-']{2,50}$/).map(s => s.trim()).filter(s => s.length >= 2),
        fc.emailAddress(),
        // Generate invalid content: too short (< 10 chars after trim) or too long (> 1000 chars)
        fc.oneof(
          fc.string({ maxLength: 9 }).map(s => s.trim()), // Too short after trim
          fc.string({ minLength: 1001, maxLength: 2000 }) // Too long
        ),
        (name, email, content) => {
          const comment: CommentData = {
            name,
            email,
            content,
          };

          const result = validateComment(comment);

          // Invalid content length should fail validation
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'content')).toBe(true);
          expect(
            result.errors.some(
              e => e.code === 'CONTENT_TOO_SHORT' || e.code === 'CONTENT_TOO_LONG'
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Comment Count Accuracy', () => {
  beforeEach(() => {
    clearAllComments();
  });

  afterEach(() => {
    clearAllComments();
  });

  test('Property 27: Comment Count Accuracy - count equals approved comments', async () => {
    // Feature: blog-development, Property 27: Comment Count Accuracy
    fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z]{3,20}$/), // Минимум 3 символа
            email: fc.emailAddress(),
            content: fc.string({ minLength: 10, maxLength: 100 }).map(s => {
              // Ensure content is valid and doesn't contain spam patterns
              const cleaned = s.trim();
              if (cleaned.length < 10) {
                return 'Valid comment content that is long enough';
              }
              return cleaned;
            }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (comments) => {
          // Генерируем уникальный articleId для каждого теста
          const articleId = `article-${Date.now()}-${Math.random()}`;
          
          // Post all comments
          const postedComments = [];
          for (const comment of comments) {
            try {
              const posted = await postComment(articleId, comment);
              postedComments.push(posted);
            } catch (error) {
              // Skip invalid comments
              continue;
            }
          }

          // Approve all comments
          for (const comment of postedComments) {
            await moderateComment(comment.id, 'approve');
          }

          // Count should equal number of approved comments
          const count = countApprovedComments(articleId);
          expect(count).toBe(postedComments.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 27: Comment Count Accuracy - count includes nested replies', async () => {
    // Feature: blog-development, Property 27: Comment Count Accuracy
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }), // number of top-level comments
        fc.integer({ min: 1, max: 2 }), // number of replies per comment
        async (numComments, numReplies) => {
          // Генерируем уникальный articleId для каждого теста
          const articleId = `article-${Date.now()}-${Math.random()}`;
          let totalExpected = 0;

          // Create top-level comments
          for (let i = 0; i < numComments; i++) {
            try {
              const comment = await postComment(articleId, {
                name: `User ${i}`,
                email: `user${i}@example.com`,
                content: `This is comment ${i} with enough text to pass validation requirements`,
              });
              await moderateComment(comment.id, 'approve');
              totalExpected++;

              // Add replies to this comment
              for (let j = 0; j < numReplies; j++) {
                try {
                  const reply = await postComment(articleId, {
                    name: `Replier ${j}`,
                    email: `replier${j}@example.com`,
                    content: `This is reply ${j} to comment ${i} with enough text to pass validation`,
                    parentId: comment.id,
                  });
                  await moderateComment(reply.id, 'approve');
                  totalExpected++;
                } catch (error) {
                  // Skip invalid replies
                  continue;
                }
              }
            } catch (error) {
              // Skip invalid comments
              continue;
            }
          }

          // Count should include all comments and replies
          const count = countApprovedComments(articleId);
          expect(count).toBe(totalExpected);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 27: Comment Count Accuracy - only approved comments are counted', async () => {
    // Feature: blog-development, Property 27: Comment Count Accuracy
    fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z]{3,20}$/), // Минимум 3 символа
            email: fc.emailAddress(),
            content: fc.constant('Valid comment content that is long enough for validation'),
            shouldApprove: fc.boolean(),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (comments) => {
          // Генерируем уникальный articleId для каждого теста
          const articleId = `article-${Date.now()}-${Math.random()}`;
          let expectedApproved = 0;

          // Post and moderate comments
          for (const comment of comments) {
            try {
              const posted = await postComment(articleId, {
                name: comment.name,
                email: comment.email,
                content: comment.content,
              });

              if (comment.shouldApprove) {
                await moderateComment(posted.id, 'approve');
                expectedApproved++;
              } else {
                // Randomly reject or mark as spam
                await moderateComment(posted.id, Math.random() > 0.5 ? 'reject' : 'spam');
              }
            } catch (error) {
              // Skip invalid comments
              continue;
            }
          }

          // Count should only include approved comments
          const count = countApprovedComments(articleId);
          expect(count).toBe(expectedApproved);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 27: Comment Count Accuracy - count is zero for articles with no approved comments', async () => {
    // Feature: blog-development, Property 27: Comment Count Accuracy
    fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z]{3,20}$/), // Минимум 3 символа
            email: fc.emailAddress(),
            content: fc.constant('Valid comment content that is long enough for validation'),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (comments) => {
          // Генерируем уникальный articleId для каждого теста
          const articleId = `article-${Date.now()}-${Math.random()}`;
          
          // Post all comments but don't approve any (or reject/spam them)
          for (const comment of comments) {
            try {
              const posted = await postComment(articleId, comment);
              // Reject or mark as spam
              await moderateComment(posted.id, Math.random() > 0.5 ? 'reject' : 'spam');
            } catch (error) {
              // Skip invalid comments
              continue;
            }
          }

          // Count should be zero
          const count = countApprovedComments(articleId);
          expect(count).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});
