import { z } from 'zod';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { ragflowService } from '@/server/services/ragflow';

const ragflowProcedure = authedProcedure;

export const ragflowRouter = router({
  // 获取知识库列表
  listKnowledgeBases: ragflowProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ragflowService.listKnowledgeBases(ctx.userId, input.tenantId);
    }),

  // 在知识库中检索相关文档
  retrieve: ragflowProcedure
    .input(
      z.object({
        knowledgeBaseId: z.string(),
        query: z.string(),
        topK: z.number().default(5),
        similarityThreshold: z.number().default(0.2),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ragflowService.retrieve(
        ctx.userId,
        input.knowledgeBaseId,
        input.query,
        input.topK,
        input.similarityThreshold,
      );
    }),

  // 创建对话（关联知识库）
  createConversation: ragflowProcedure
    .input(
      z.object({
        knowledgeBaseId: z.string(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ragflowService.createConversation(ctx.userId, input.knowledgeBaseId, input.name);
    }),

  // 在知识库对话中提问
  chat: ragflowProcedure
    .input(
      z.object({
        conversationId: z.string(),
        question: z.string(),
        knowledgeBaseId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ragflowService.chat(
        ctx.userId,
        input.conversationId,
        input.question,
        input.knowledgeBaseId,
      );
    }),
});