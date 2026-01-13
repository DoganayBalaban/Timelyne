# Migration Notes

## UUID Extension
Migration'da UUID extension'ı aktifleştirin:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Partial Indexes (WHERE clauses)
Prisma schema'da WHERE clause'lu index'ler desteklenmediği için, aşağıdaki partial index'leri migration'da manuel olarak oluşturun:

```sql
-- Clients
CREATE INDEX idx_clients_user_active ON clients(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('english', name || ' ' || COALESCE(company, '')));

-- Projects
CREATE INDEX idx_projects_user_active ON projects(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status_active ON projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_deadline_active ON projects(deadline) WHERE status = 'active';

-- Tasks
CREATE INDEX idx_tasks_project_active ON tasks(project_id) WHERE deleted_at IS NULL;

-- Time Entries
CREATE INDEX idx_time_entries_user_date_active ON time_entries(user_id, date) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_entries_unbilled ON time_entries(project_id, billable, invoiced) WHERE invoiced = false;

-- Invoices
CREATE INDEX idx_invoices_user_active ON invoices(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_overdue ON invoices(due_date, status) WHERE status = 'sent';

-- Expenses
CREATE INDEX idx_expenses_user_date_active ON expenses(user_id, date) WHERE deleted_at IS NULL;

-- Refresh Tokens
CREATE INDEX idx_refresh_tokens_token_active ON refresh_tokens(token) WHERE revoked_at IS NULL;
```

## Constraints
Aşağıdaki constraint'leri migration'da ekleyin:

```sql
-- Projects
ALTER TABLE projects ADD CONSTRAINT check_budget_positive 
 CHECK (budget IS NULL OR budget > 0);

-- Time Entries
ALTER TABLE time_entries ADD CONSTRAINT check_duration_positive
 CHECK (duration_minutes IS NULL OR duration_minutes > 0);

-- Invoices
ALTER TABLE invoices ADD CONSTRAINT check_total_positive
 CHECK (total > 0);
ALTER TABLE invoices ADD CONSTRAINT check_due_after_issue
 CHECK (due_date >= issue_date);
```

## Triggers
Updated_at trigger'ları için:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
 NEW.updated_at = CURRENT_TIMESTAMP;
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Prevent Invoiced Time Entry Deletion
```sql
CREATE OR REPLACE FUNCTION prevent_invoiced_time_entry_deletion()
RETURNS TRIGGER AS $$
BEGIN
 IF OLD.invoiced = TRUE THEN
 RAISE EXCEPTION 'Cannot delete invoiced time entry';
 END IF;
 RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_invoiced_deletion BEFORE DELETE ON time_entries
 FOR EACH ROW EXECUTE FUNCTION prevent_invoiced_time_entry_deletion();
```

## Materialized View
Monthly stats için materialized view:

```sql
CREATE MATERIALIZED VIEW monthly_stats AS
SELECT
 user_id,
 DATE_TRUNC('month', date) as month,
 SUM(duration_minutes) / 60.0 as total_hours,
 SUM(CASE WHEN billable THEN duration_minutes ELSE 0 END) / 60.0 as billable_hours,
 COUNT(DISTINCT project_id) as active_projects,
 COUNT(*) as total_entries
FROM time_entries
WHERE deleted_at IS NULL
GROUP BY user_id, DATE_TRUNC('month', date);

CREATE UNIQUE INDEX idx_monthly_stats ON monthly_stats(user_id, month);

-- Refresh monthly stats (run daily via cron job)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_stats;
```
