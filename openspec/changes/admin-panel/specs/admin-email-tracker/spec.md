## ADDED Requirements

### Requirement: Email send log table
A table `admin_email_log` SHALL store a record each time the send-email Edge Function successfully sends an email, capturing: recipient email, email type, and timestamp.

#### Scenario: Email log entry created
- **WHEN** send-email Edge Function successfully sends an email
- **THEN** a row is inserted into `admin_email_log` with recipient, type, and current timestamp

### Requirement: Admin can view email send statistics
The admin panel SHALL display: count of emails sent in the last 1 hour, count in the last 24 hours, and a list of recent email log entries. The panel SHALL also display the Supabase free-tier limits (3/hour, ~50/day) as reference, with a visual indicator (green/yellow/red) based on hourly usage.

#### Scenario: Stats within limit
- **WHEN** fewer than 2 emails have been sent in the last hour
- **THEN** the hourly indicator SHALL show green

#### Scenario: Stats near limit
- **WHEN** 2 emails have been sent in the last hour
- **THEN** the hourly indicator SHALL show yellow

#### Scenario: Stats at limit
- **WHEN** 3 or more emails have been sent in the last hour
- **THEN** the hourly indicator SHALL show red with a warning message

#### Scenario: Note on coverage
- **WHEN** the admin views the email stats
- **THEN** a note SHALL indicate that Supabase system emails (signup confirmations) are not tracked here
