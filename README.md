# AI Code Review Pipeline

An intelligent, automated code review system powered by **Gemini AI** that analyzes GitHub Pull Requests for security vulnerabilities, performance issues, and best practices — then posts review feedback directly on the PR.

## Architecture

```
[GitHub PR Webhook] → [Validate] → [Extract PR Data] → [Fetch Diff]
                                                            ↓
                                                   [Prepare AI Requests]
                                          ┌─────────────────┼─────────────────┐
                                    [AI Security]    [AI Performance]    [AI Best Practices]
                                          └─────────────────┼─────────────────┘
                                                     [Merge Results]
                                                            ↓
                                                   [Compute Score 0-100]
                                                            ↓
                                                   [Store in PostgreSQL]
                                                            ↓
                                                     [Switch Decision]
                                          ┌─────────────────┼─────────────────┐
                                     [Approve]     [Request Changes]      [Reject]
                                          └─────────────────┼─────────────────┘
                                                     [Respond 200]
```

**18 nodes** | **Double-diamond pattern** | **3 parallel AI agents** | **Weighted scoring**

## What It Does

1. **Receives** a GitHub webhook when a PR is opened
2. **Fetches** the full diff via GitHub API
3. **Prepares** specialized prompts with strict scoring rubrics
4. **Analyzes in parallel** with 3 specialized AI agents (Gemini 2.5 Flash):
   - **Security**: SQL injection, XSS, secret exposure, OWASP Top 10
   - **Performance**: N+1 queries, memory leaks, blocking I/O, missing pagination
   - **Best Practices**: SOLID violations, error handling, naming, complexity
5. **Computes** a weighted composite score: `security x 0.4 + performance x 0.3 + practices x 0.3`
6. **Stores** full audit trail in PostgreSQL (scores + JSONB findings)
7. **Routes** the decision: Approve (>=80), Request Changes (50-79), Reject (<50)
8. **Posts** a detailed review comment on the GitHub PR

## Tech Stack

| Component | Technology |
|---|---|
| Workflow Engine | n8n (self-hosted) |
| AI Analysis | Google Gemini 2.5 Flash |
| Source Control | GitHub REST API v3 |
| Database | PostgreSQL 16 |
| Infrastructure | Docker Compose |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Vata74/ai-code-review-pipeline.git
cd ai-code-review-pipeline

# 2. Configure environment
cp .env.example .env
# Edit .env with your passwords

# 3. Start services
docker compose up -d

# 4. Open n8n
# http://localhost:5678

# 5. Import the workflow
# Menu > Import from File > workflows/ai-code-review-pipeline.json

# 6. Configure credentials in n8n:
#    - GitHub API Token (Header Auth)
#    - Gemini API Key (in workflow node URLs)
#    - PostgreSQL connection
```

## Credentials Setup

| Credential | Type | Configuration |
|---|---|---|
| GitHub API Token | Header Auth | `Authorization: Bearer ghp_YOUR_TOKEN` |
| Gemini API Key | URL parameter | Replace `YOUR_GEMINI_API_KEY` in AI node URLs |
| PostgreSQL | Postgres | Host: `n8n-postgres`, Port: `5432`, DB/User/Pass from `.env` |

## Database Schema

```sql
CREATE TABLE code_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number INTEGER NOT NULL,
    repo VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    composite_score INTEGER CHECK (composite_score BETWEEN 0 AND 100),
    verdict VARCHAR(20) CHECK (verdict IN ('APPROVE', 'REQUEST_CHANGES', 'REJECT')),
    security_findings JSONB,
    performance_findings JSONB,
    practices_findings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Scoring Logic

| Score | Verdict | Action |
|---|---|---|
| >= 80 | APPROVE | Auto-approve PR |
| 50-79 | REQUEST_CHANGES | Post findings, request fixes |
| < 50 | REJECT | Block with critical findings |

**Override**: Any critical security finding forces REJECT regardless of composite score.

## License

MIT
