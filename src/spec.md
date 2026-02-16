# Specification

## Summary
**Goal:** Build LensGram as a username-discovery messenger with Internet Identity auth, onboarding profiles, follow-gated 1:1 chat, and call-request signaling.

**Planned changes:**
- Add Internet Identity authentication and require a signed-in Principal for all features; associate all stored data to the caller Principal and reject anonymous access.
- Implement first-time onboarding to collect and persist display name, email, and a case-insensitively unique username (with clear English errors on conflicts).
- Add user discovery by exact username search, showing a result card with username and display name (never exposing email).
- Implement follow/connection requests (send, prevent duplicates, accept/reject) and enforce that only accepted connections can chat or create call requests; show clear connection status in UI.
- Implement 1:1 messaging for connected users with conversation threads, persisted messages, author attribution, and human-readable timestamps.
- Implement call requests (signaling only) in chat: request/accept/decline/end with persisted call status transitions (requested/accepted/declined/ended/missed).
- Create main navigation and pages: Onboarding, Discover, Requests (incoming/outgoing), Chats list, Chat detail (with call controls), with routing that blocks access until onboarding is complete.
- Apply a coherent Tailwind-based visual theme across all pages using existing UI components, avoiding blue/purple as primary brand colors.
- Add and use generated static brand assets (logo + icon) in the UI (header/nav and a visible mark on login/onboarding).

**User-visible outcome:** Users can sign in with Internet Identity, create a profile (name/email/unique username), find others by username, send/accept follow requests, and once connected, chat 1:1 and manage call requests with clear status updates.
