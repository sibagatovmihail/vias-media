# Password-protecting the teacher view — deployment guide

This locks one or more pages behind a password. The protection runs **on Vercel's
servers**, so the password can't be found by viewing source or using DevTools, and
the lock can't be skipped from the browser.

## What each file does

| File | Role |
|------|------|
| `middleware.js` | Guards the protected pages. Runs on Vercel's edge before any file is served. Redirects logged-out visitors to the login page. |
| `login.html` | The styled sign-in page visitors see when not logged in. |
| `api/login.js` | Checks the password and issues a signed, HttpOnly session cookie. |
| `api/logout.js` | Clears the session cookie. |
| `teacher.html` | A demo protected page. Replace its contents with your real teacher view. |

## Two secrets you must set (environment variables)

| Variable | What it is | Example |
|----------|------------|---------|
| `TEACHER_PASSWORD` | The password the teacher types in. | `Falcon-Spring-2026` |
| `AUTH_SECRET` | A long random string used to sign the login cookie. **Not** something you type — just paste a random value. | run `openssl rand -hex 32` |

Generate a strong `AUTH_SECRET` on your machine:

```bash
openssl rand -hex 32
```

Copy the output — you'll paste it into Vercel in the steps below.

---

## Deploy — Option A: Vercel Dashboard (no command line)

1. **Push your project to GitHub** (or GitLab/Bitbucket) if it isn't already.
2. Go to **https://vercel.com/new** and **import** the repository.
3. Framework preset: choose **Other** (this is a static site). Leave build/output settings empty.
4. Before the first deploy, open **Environment Variables** and add both:
   - `TEACHER_PASSWORD` → your chosen password
   - `AUTH_SECRET` → the random string from `openssl rand -hex 32`
   (Apply them to **Production** — and Preview too if you want protection on preview URLs.)
5. Click **Deploy**.
6. Visit `https://your-project.vercel.app/teacher.html` → you should be redirected to
   the login page. Enter the password → you reach the teacher view.

> If you add the env vars *after* deploying, redeploy once so they take effect:
> Vercel → Project → **Deployments** → ⋯ on the latest → **Redeploy**.

---

## Deploy — Option B: Vercel CLI

```bash
# one-time
npm i -g vercel
vercel login

# from the project folder
vercel link            # link to a Vercel project (creates one if needed)

# add the secrets (paste the value when prompted; choose Production + Preview)
vercel env add TEACHER_PASSWORD
vercel env add AUTH_SECRET

# deploy to production
vercel --prod
```

Then open `https://your-project.vercel.app/teacher.html` to test.

---

## Choosing which pages are locked

Edit the `matcher` array at the top of `middleware.js`:

```js
export const config = {
  matcher: ['/teacher/:path*', '/teacher.html'],
};
```

- `'/teacher.html'` → locks that single page.
- `'/teacher/:path*'` → locks every page inside a `/teacher` folder.
- Add more entries for more pages, e.g. `'/grades.html'`.

**Do not** add `/login.html` or `/api/...` to the matcher — that would lock the
login page itself and create a redirect loop.

After editing, redeploy (`vercel --prod`, or push to your connected git branch).

---

## Changing the password later

Update the `TEACHER_PASSWORD` env var in Vercel (Dashboard → Settings → Environment
Variables, or `vercel env rm TEACHER_PASSWORD` then `vercel env add`), then redeploy.
Tip: rotating `AUTH_SECRET` instantly logs everyone out (all existing cookies become
invalid).

---

## How long does a login last?

8 hours, then the teacher is asked to sign in again. Change `SESSION_HOURS` at the
top of `api/login.js` to adjust.

---

## Local testing

Plain "open the HTML file" won't run the middleware or the `/api` functions. To test
the real flow locally:

```bash
vercel dev
```

Create a local `.env` (or run `vercel env pull`) so `TEACHER_PASSWORD` and
`AUTH_SECRET` are available, then visit `http://localhost:3000/teacher.html`.

---

## Reusing this on another website

Copy these into the other project and set the two env vars:

```
middleware.js
login.html
api/login.js
api/logout.js
```

Point the `matcher` in `middleware.js` at whatever you want to lock. Done.
