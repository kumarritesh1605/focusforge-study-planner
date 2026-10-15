# FocusForge — Advanced To-Do App for GitHub Pages

FocusForge is a responsive, dark-mode productivity dashboard for tasks, exam prep and personal routines. It uses **GitHub Pages** to host the front end and **Supabase** for cloud accounts and database storage.

## Features

- Email/password sign-up and sign-in
- Cloud-synced tasks and mock exam scores
- Task priorities, categories, due dates, notes and statuses
- Recurring tasks (daily, weekly, monthly): completing a repeating task creates its next occurrence
- Kanban board, task search/filters and calendar
- Pomodoro focus timer with browser notification when a session ends
- Mock score history, averages and best score
- Completion analytics, daily streak and category breakdown
- Browser reminders for tasks while the site is open
- Upcoming exams widget on the home dashboard with countdowns and per-exam Oliveboard, Testbook and Guidely score fields
- JSON export and import/restore
- Responsive layout for mobile and desktop

## Important limitations

- GitHub Pages is static hosting. Supabase supplies cloud authentication and database storage.
- The Pomodoro completed-session count is stored locally in the current browser; tasks, mock scores and upcoming exam tracker entries are cloud-synced.
- Browser reminders work only after permission is granted and while the page is open. They are not server push notifications and are not guaranteed if the browser/device suspends the page.
- Calendar shows tasks with due dates; it is not a Google Calendar integration.
- This starter version does not have drag-and-drop Kanban; use each card's status selector.
- Do not put a Supabase `service_role` key in this site. Only use the anon/public key with Row Level Security enabled.

---

## Beginner-friendly setup

### 1. Create a GitHub repository

1. Sign in to GitHub.
2. Click **New repository**.
3. Name it `focusforge-todo` (or any name you like).
4. Set it to **Public** if you are using GitHub Free Pages in a standard account setup.
5. Click **Create repository**.

### 2. Create your Supabase project

1. Open [Supabase](https://supabase.com/) and create an account or sign in.
2. Create a new project, choose a name and set a strong database password. Save that password somewhere safe.
3. Wait for the project to finish provisioning.
4. In the Supabase dashboard, open **SQL Editor** → **New query**.
5. Open `supabase_schema.sql` from this project, copy all of it, paste it into the SQL Editor, then click **Run**.
6. Open **Project Settings** → **API** (or **Data API / API Keys**, depending on dashboard layout).
7. Copy the **Project URL** and the **anon/public** API key. Do not copy the `service_role` or secret key.

### 3. Add your Supabase keys

1. Open `index.html` in a text editor.
2. Near the bottom, find these lines:

   ```js
   const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
   const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
   ```

3. Replace the placeholder text with your actual Project URL and anon/public key, keeping the quotation marks.
4. Save the file.

The anon/public key is designed for client-side use **only when Row Level Security is enabled** and policies are correct. The SQL script in this project enables RLS and restricts each row to its owner. Never publish a service-role key.

### 4. Upload the files to GitHub

1. Open your new GitHub repository.
2. Click **Add file** → **Upload files**.
3. Upload `index.html` and `supabase_schema.sql`. You can upload `README.md` too.
4. Click **Commit changes**.

### 5. Enable GitHub Pages

1. In the repository, open **Settings**.
2. Select **Pages** in the left sidebar.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/(root)`.
5. Click **Save**.
6. Wait a minute or two. The Pages section will show your website URL, usually:
   `https://YOUR-USERNAME.github.io/focusforge-todo/`

Open that URL on your phone or computer.

### 6. Configure Supabase Auth for the published URL

1. In Supabase, open **Authentication** → **URL Configuration**.
2. Set **Site URL** to your published GitHub Pages URL.
3. Add the same URL to **Redirect URLs** if the dashboard asks for it.
4. For a GitHub Pages project site, include the full path ending in `/`, e.g. `https://YOUR-USERNAME.github.io/focusforge-todo/`.
5. Email confirmation may be enabled by default. If you sign up, check your inbox and confirm before signing in. You can configure confirmation behavior in Supabase Auth settings.

### 7. Test it

1. Visit the published URL.
2. Create an account with your email and a password of at least six characters.
3. Sign in, add a test task, then refresh the page. The task should still be there.
4. Try a mock score, Kanban status change, recurring task, add an upcoming exam, enter platform scores and export a JSON backup.
5. Sign in from another browser/device to verify cloud sync.

## Updating the app later

Edit `index.html` in GitHub by opening it and clicking the pencil icon, or upload a replacement. Commit the change; GitHub Pages will redeploy automatically.

## Troubleshooting

- **“Setup required”**: Supabase URL/key placeholders were not replaced, or the CDN is blocked.
- **Invalid API key / Failed to fetch**: check the Project URL and anon/public key, and make sure your network can access Supabase.
- **relation does not exist**: run `supabase_schema.sql` in the correct Supabase project's SQL Editor.
- **permission denied / RLS error**: verify the SQL policies ran and you are signed in. Do not disable RLS as a workaround.
- **Sign-up says check email**: confirm your email before signing in.
- **Pages shows 404**: ensure `index.html` is in the repository root and Pages is configured for `main` / `/(root)`.
- **Notifications don't appear**: allow notifications in browser settings. Some mobile browsers require the website to be installed or open; this starter app does not provide server-side push notifications.
- **Wrong time for reminder**: set the task reminder using the device's local time and verify the device clock/time zone.

## Files

- `index.html` — complete app
- `supabase_schema.sql` — database tables and row-level security
- `README.md` — this guide

## Upload mock data and use AI analysis

The Mock score tracker now supports CSV, Excel (`.xlsx` / `.xls`) and JSON uploads. It previews the valid rows before import. The simplest spreadsheet columns are:

| exam | date | score | max_score | correct | wrong | notes |
|---|---|---:|---:|---:|---:|---|
| IBPS Clerk Mains | 2026-10-15 | 68.5 | 100 | 78 | 22 | GA and DI need revision |

Common column names such as `test name`, `marks`, `total marks`, and `test date` are also supported. The app imports scores into your signed-in account; it does not automatically log in to Oliveboard, Testbook or Guidely or scrape their private dashboards. Export a score report from the provider and upload it here. Section-wise columns are preserved only if included in the notes field by your exported data; the AI will not infer missing sectional performance.

### Enable the ChatGPT-powered analysis securely

The AI button calls a Supabase Edge Function, which calls OpenAI. **Do not put an OpenAI API key in `index.html` or anywhere in your public GitHub repository.**

1. Make sure your Supabase project is set up and the app is signed in.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and sign in: `supabase login`.
3. Link your local project from the project folder: `supabase link --project-ref YOUR_PROJECT_REF` (find the ref in the Supabase project URL/dashboard).
4. Set your private OpenAI key as a Supabase secret: `supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY`.
5. Deploy the function from this project folder: `supabase functions deploy analyze-mocks`.
6. Refresh your GitHub Pages app, open **Mock score tracker**, upload or save a few scores, then press **Analyse with AI**.

You need an OpenAI API key with API billing/credits enabled; ChatGPT Plus/Go subscription access does not itself include OpenAI API usage. The AI analysis sends the most recent 80 mock records (exam name, date, scores, correct/wrong counts and notes) to OpenAI when you click the button. Avoid putting passwords, account IDs, or other sensitive personal information in mock notes. You can continue to use uploads and the ordinary score tracker even if you do not configure AI.

If the AI button reports that the function is missing, check that `supabase/functions/analyze-mocks/index.ts` was included in your project folder and the function deployment completed successfully. The Edge Function checks that the caller is signed in and keeps the OpenAI key server-side.

## Daily study planner and weekend revision

The Overview dashboard includes a daily study planner. It creates a weekday routine and makes **Saturday and Sunday revision-first days**. The weekend plan prioritizes revisiting the week's mistake list, re-solving wrong questions without solutions, sectional practice, and a weekly review.

To make the planner target your actual weak areas:

1. After each mock, save it in **Mock score tracker** (or upload your score file).
2. In **Notes / weak areas**, list the specific topics you got wrong, separated by commas or semicolons. Example: `DI caselet, syllogism, error spotting, banking awareness`.
3. On the Overview page, tap **Build today's plan** to refresh the plan from mock notes saved in the last 14 days and open tasks labelled as mistakes/revision.
4. Tap **Add plan to tasks** to save the suggested blocks as dated tasks; tick them off as you finish them.
5. Use **Analyse with AI** in Mock score tracker for the deeper ChatGPT-powered analysis and broader 7-day recommendations.

The planner cannot know the exact question/topic you missed unless it appears in your mock notes or mistake/revision tasks. If your score export includes section-wise results, include those in the notes too. The planner is a lightweight rule-based daily plan; the separate AI analysis is the feature that sends your mock history to OpenAI.
