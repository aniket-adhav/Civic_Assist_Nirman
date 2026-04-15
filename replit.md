# CivicAssist

A community-driven platform for citizens to report and track local civic issues (potholes, street lighting, waste management, etc.). Features social interactions like liking, commenting, and sharing reported issues, as well as viewing trending problems in the community.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Language:** TypeScript / JSX
- **Styling:** Tailwind CSS + Shadcn/UI components
- **State Management:** React Context API (AppContext, ThemeContext)
- **Authentication:** Firebase Phone Auth OTP
- **Routing:** Custom manual routing via `currentPage` state
- **Form Handling:** react-hook-form + zod
- **Icons:** Lucide React

## Runtime

- Development workflow: `npm run dev` (Vite)
- Web preview port: 5000
- Frontend entry: `src/main.jsx`
- App root: `src/App.jsx`

## File Structure

- `src/user/` — User (citizen) screens: `LoginPage.jsx`
- `src/admin/` — Admin screens: `AdminLogin.jsx`, `AdminDashboard.jsx`, `AdminSidebar.jsx`
- `src/screens/` — Shared/citizen app screens (CommunityFeed, ReportIssue, MyReports, etc.)
- `src/components/ui/` — Reusable Shadcn/UI primitives
- `src/components/civic/` — Feature components (AppSidebar, IssueCard, CommentModal, Notification)
- `src/context/` — Global state (AppContext, ThemeContext)
- `src/data/dummyIssues.js` — Mock data

## Architecture Notes

- Pure client-side application with no backend
- Firebase Phone Auth powers citizen OTP login in `AppContext.jsx`; issue submission still uses local mock state via `Promise` timeouts
- Dark/light mode support via `next-themes` and CSS variables
- Shadcn/UI components in `src/components/ui/`
- Route-aware loading skeletons live in `src/components/civic/AppSkeleton.jsx` and are shown during initial app load and short page transitions for clearer perceived loading and accessibility
- Feed post cards support a feed-only clickable variant that opens `src/screens/IssueDetail.jsx` with hero image, share/view-image actions, map-style location panel, support controls, and comments while leaving Trending Issues unchanged

## Deployment

- Build command: `npm run build` → outputs to `dist/`
- Deployment target: static site
