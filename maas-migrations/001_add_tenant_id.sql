-- MaaS 多租户数据隔离迁移脚本 - lobehub
-- 为核心业务表添加 tenant_id 字段
-- 执行前提：lobehub 数据库已初始化
-- 幂等性：使用 IF NOT EXISTS 和 ADD COLUMN IF NOT EXISTS（PostgreSQL 12+）

-- users 表：添加 tenant_id
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tenant_id') THEN
        ALTER TABLE users ADD COLUMN tenant_id BIGINT DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id);

-- agents 表：添加 tenant_id
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'tenant_id') THEN
        ALTER TABLE agents ADD COLUMN tenant_id BIGINT DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents (tenant_id);

-- sessions（对话）表：添加 tenant_id
-- 注意：lobehub 中对话数据表名可能为 sessions 或 topics
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'tenant_id') THEN
        ALTER TABLE sessions ADD COLUMN tenant_id BIGINT DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_tenant_id ON sessions (tenant_id);

-- messages 表：添加 tenant_id
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'tenant_id') THEN
        ALTER TABLE messages ADD COLUMN tenant_id BIGINT DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_tenant_id ON messages (tenant_id);

-- knowledge_bases 表：添加 tenant_id
-- lobehub 的知识库相关表名需要根据实际 schema 调整
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_bases' AND column_name = 'tenant_id') THEN
        ALTER TABLE knowledge_bases ADD COLUMN tenant_id BIGINT DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_knowledge_bases_tenant_id ON knowledge_bases (tenant_id);

-- files 表：添加 tenant_id
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'tenant_id') THEN
        ALTER TABLE files ADD COLUMN tenant_id BIGINT DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_files_tenant_id ON files (tenant_id);

-- 验证迁移
SELECT table_name, column_name FROM information_schema.columns
WHERE column_name = 'tenant_id' AND table_schema = 'public'
ORDER BY table_name;