# Specification

## Summary
**Goal:** Fix account creation/onboarding so newly authenticated Internet Identity users can proceed without a misleading “Failed to login” error and without requiring any admin-only initialization.

**Planned changes:**
- Adjust authenticated actor initialization to avoid calling privileged/secret initialization APIs when required parameters (e.g., secret) are missing/empty, and ensure failures in privileged init do not block normal user login/onboarding.
- Update backend access control so a first-time, authenticated principal can complete onboarding in a fresh session without manual/admin-only steps and without unauthorized traps.
- Improve onboarding UI error handling to clearly distinguish login/session issues from profile-creation failures, preserving the existing “Username taken” message and adding clear English guidance for unauthorized/session-expired cases.

**User-visible outcome:** New users can sign in with Internet Identity, reach the onboarding form, and submit it successfully; if something fails, the app shows a clear, accurate error message instead of “Failed to login.”
