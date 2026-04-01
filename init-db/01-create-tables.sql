-- ============================================
-- AI Code Review Pipeline - Database Schema
-- ============================================

CREATE TABLE IF NOT EXISTS code_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number INTEGER NOT NULL,
    repo VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    branch VARCHAR(255),
    title TEXT,
    sha VARCHAR(40),
    security_score INTEGER CHECK (security_score BETWEEN 0 AND 100),
    performance_score INTEGER CHECK (performance_score BETWEEN 0 AND 100),
    practices_score INTEGER CHECK (practices_score BETWEEN 0 AND 100),
    composite_score INTEGER CHECK (composite_score BETWEEN 0 AND 100),
    verdict VARCHAR(20) CHECK (verdict IN ('APPROVE', 'REQUEST_CHANGES', 'REJECT')),
    security_findings JSONB DEFAULT '[]',
    performance_findings JSONB DEFAULT '[]',
    practices_findings JSONB DEFAULT '[]',
    ai_model VARCHAR(50) DEFAULT 'claude-sonnet-4-6',
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_code_reviews_repo ON code_reviews(repo);
CREATE INDEX idx_code_reviews_author ON code_reviews(author);
CREATE INDEX idx_code_reviews_verdict ON code_reviews(verdict);
CREATE INDEX idx_code_reviews_created ON code_reviews(created_at DESC);
CREATE INDEX idx_code_reviews_composite ON code_reviews(composite_score);
