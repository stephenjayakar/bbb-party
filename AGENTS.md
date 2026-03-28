<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

Deployment notes:
- This app deploys as a Vite app on Vercel, not Next.js.
- Keep Vercel Node configured to `22.x` for this project.
- `VITE_CONVEX_URL` must be present in Vercel project env vars for preview and production deploys, or the app will fall back to its local setup message.
- Follow code changes with `vercel deploy --yes`, then make a git commit and push the branch unless the user says not to.
<!-- convex-ai-end -->
