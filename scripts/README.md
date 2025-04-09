# Smart Spend Scripts

This directory contains scripts for database migrations, seed data, and other utilities for the Smart Spend application.

## Running Migration Scripts

### Option 1: Using the Supabase CLI

If you have the Supabase CLI installed, you can run migrations directly:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```bash
   supabase login
   ```

3. Run a specific migration:
   ```bash
   supabase db execute --project-ref YOUR_PROJECT_REF < ./migrations/create_calendar_events_table.sql
   ```

### Option 2: Using the Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to your project
3. Go to the SQL Editor
4. Open and run the SQL files in the `migrations` directory manually

## Migration Order

When running migrations for the first time, follow this order:

1. `create_calendar_events_table.sql` - Creates the calendar events table

## Additional Scripts

Add more information about other scripts as they are created. 