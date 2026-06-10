import { env } from '@/envs/tools';

const RAGFLOW_API_URL = env.RAGFLOW_API_URL || process.env.RAGFLOW_API_URL || 'http://ragflow-api:9382';
const RAGFLOW_API_KEY = env.RAGFLOW_API_KEY || process.env.RAGFLOW_API_KEY || '';

interface RagflowKnowledgeBase {
  id: string;
  name: string;
  chunk_num: number;
  token_num: number;
  create_date: string;
  update_date: string;
}

interface RagflowChunk {
  id: string;
  content: string;
  similarity: number;
  document_id: string;
  document_name: string;
  knowledgebase_id: string;
}

interface RagflowConversation {
  id: string;
  name: string;
  create_date: string;
  update_date: string;
}

interface RagflowChatAnswer {
  answer: string;
  reference: {
    chunks: RagflowChunk[];
  };
}

class RagflowService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = RAGFLOW_API_URL;
    this.apiKey = RAGFLOW_API_KEY;
  }

  private getHeaders(maasJwt?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (maasJwt) {
      headers['X-Maas-JWT'] = maasJwt;
    } else if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async listKnowledgeBases(userId: string, tenantId?: number): Promise<RagflowKnowledgeBase[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/dataset?page=1&page_size=50`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        console.error('[RagflowService] listKnowledgeBases failed:', response.status);
        return [];
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('[RagflowService] listKnowledgeBases error:', error);
      return [];
    }
  }

  async retrieve(
    userId: string,
    knowledgeBaseId: string,
    query: string,
    topK: number = 5,
    similarityThreshold: number = 0.2,
  ): Promise<RagflowChunk[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/retrieval`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          dataset_id: knowledgeBaseId,
          question: query,
          top_k: topK,
          similarity_threshold: similarityThreshold,
        }),
      });
      if (!response.ok) {
        console.error('[RagflowService] retrieve failed:', response.status);
        return [];
      }
      const data = await response.json();
      return data.data?.chunks || [];
    } catch (error) {
      console.error('[RagflowService] retrieve error:', error);
      return [];
    }
  }

  async createConversation(
    userId: string,
    knowledgeBaseId: string,
    name?: string,
  ): Promise<RagflowConversation | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/conversation`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          dataset_id: knowledgeBaseId,
          name: name || `MaaS KB Chat - ${knowledgeBaseId}`,
        }),
      });
      if (!response.ok) {
        console.error('[RagflowService] createConversation failed:', response.status);
        return null;
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('[RagflowService] createConversation error:', error);
      return null;
    }
  }

  async chat(
    userId: string,
    conversationId: string,
    question: string,
    knowledgeBaseId: string,
  ): Promise<RagflowChatAnswer | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/conversation/${conversationId}/completion`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          question,
          dataset_ids: [knowledgeBaseId],
        }),
      });
      if (!response.ok) {
        console.error('[RagflowService] chat failed:', response.status);
        return null;
      }
      // ragflow returns streaming response, parse the final answer
      const text = await response.text();
      const lines = text.split('\n').filter((l) => l.trim());
      let answer = '';
      let reference: any = { chunks: [] };

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.answer) answer += parsed.answer;
          if (parsed.reference) reference = parsed.reference;
        } catch {
          // skip non-JSON lines
        }
      }

      return { answer, reference };
    } catch (error) {
      console.error('[RagflowService] chat error:', error);
      return null;
    }
  }
}

export const ragflowService = new RagflowService();