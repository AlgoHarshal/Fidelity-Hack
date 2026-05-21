# Project Context: IntentEdge

## Overview
This is a full-stack project built for a Fidelity Hackathon. The application is named **IntentEdge**, an "Investor Intent Intelligence Engine" designed to track behavioral events, score intent, and trigger nudges/emails based on user actions.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router, Recharts, Lucide React.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Nodemailer (for triggering behavioral emails).

## Deployment Status
- **Frontend**: Deployed on **Vercel** (`https://intentedge.vercel.app`).
- **Backend**: Deployed on **Render** (Free Tier Web Service).
- **Database**: Hosted on **MongoDB Atlas** (Free Tier M0 Cluster).
- **Communication**: Frontend communicates with the backend via REST API (`/api/*` routes). CORS is successfully configured on the backend to allow requests from the Vercel frontend domain.

## Current Known Limitation / Active Issue
We recently encountered a deployment issue regarding email functionality:
1. **The Goal**: The backend uses `nodemailer` to trigger recovery/nudge emails via `smtp.gmail.com` on port 465.
2. **The IPv6 Issue (Resolved)**: Node.js 17+ was initially throwing `ENETUNREACH` trying to connect to Google's IPv6 SMTP address. This was fixed by adding `dns.setDefaultResultOrder('ipv4first');` in `backend/utils/mailer.js`.
3. **The Render Firewall Issue (Current)**: After fixing the IPv6 issue, we received `ETIMEDOUT` errors. This is because **Render's Free Tier strictly blocks all outbound SMTP traffic** (Ports 25, 465, 587) as a spam prevention measure.
4. **Current Workaround**: The codebase has a built-in mock fallback. By removing `EMAIL_USER` and `EMAIL_PASS` from Render's environment variables, the system gracefully bypasses the SMTP connection and prints `[Mock Email]` to the server console instead. This is currently being utilized to keep the app functional for the hackathon demo.

## Key Files for Reference
- `backend/server.js`: Main Express entry point, configures CORS for Vercel, and mounts API routes.
- `backend/utils/mailer.js`: Contains the Nodemailer transport setup, the IPv4 DNS fix, and the mock email fallback logic.
- `frontend/.env` (and Vercel Env Vars): Defines `VITE_API_URL` pointing to the deployed Render backend URL (e.g., `https://<backend-name>.onrender.com/api`).
