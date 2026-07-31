<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# S.S. Pharmacy Admin Portal - Skill-Based Planning & Engineering Rules

## 1. Planning & Execution Workflow
Whenever a task prompt is received, adhere to the following workflow:
1. **Goal & Intent Extraction**: Thoroughly analyze and understand the prompt's underlying goal and intent.
2. **Related Skill Loading**: Identify and load all related domain skills required for the task.
3. **Implementation Plan Artifact**: Construct a structured `implementation_plan.md` artifact before taking action or writing code when needed.
4. **Verification Requirement**: Always verify code changes with `npm run build` to ensure 0 TypeScript or build errors before declaring success.
5. **Applied Skill Confirmation**: Explicitly list and confirm all domain skills applied during execution along with build verification results in the final turn summary.

## 2. Architecture & Design Principles
- **React Server Components (RSC)**: Respect server/client component boundaries. Use `'use client'` strictly when client-side interactivity, state, or hooks are required.
- **Accessibility & Touch Targets**: Enforce minimum 44x44px touch target sizing across all interactive controls and maintain WCAG AAA contrast compliance.
- **Standardized API Contracts**: Standardize API route responses using the `{ success: boolean, data?: any, error?: string }` envelope via `apiSuccess` and `apiError` helpers.
- **Error Resilience**: Wrap interactive client routes with `AdminErrorBoundary` to prevent crash cascades and preserve user state.
