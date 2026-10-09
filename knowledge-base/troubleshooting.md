---
slug: troubleshooting
title: Troubleshooting
product: one-flame-records
domain: oneflamerecords.com
audience: customer
intent: [support, troubleshooting, errors]
keywords: [not working, page not found, 404, no email, form won't send, can't log in, broken link]
answers:
  - "The page I clicked says not found — why?"
  - "I did not receive my signup email."
  - "The contact form will not send."
verified: 2026-08-11
confidence: verified
voice_safe: true
sources:
  - Projects/one flame app/src/app/(public)/contact/actions.ts
  - Projects/one flame app/src/app/(public)/signup/[code]/page.tsx
  - https://www.oneflamerecords.com/sitemap.xml
---

## Short answer

Most problems on the One Flame Records site fall into three groups: a page that cannot be found, an email that never arrived, or a form that refuses to send. Each has a simple first step — reload from the main navigation, check your spam folder, or check the required fields. If none of that works, use the contact form and a person will pick it up.

## Details

**A page says it cannot be found.** The site's sitemap currently lists a news article that is not actually published, so a search-engine link can lead to a missing page. Known site issue. Navigate from the main menu instead, or use the search icon in the header.

**A page looks empty.** Releases and News have nothing published yet, and the Lounge photo gallery is marked "photos coming soon". That is not a fault. See [[releases-and-videos]].

**No signup or invitation email arrived.** Check spam and promotions folders first. If the address is already registered you will be told so; use the login page's password reset instead.

**The contact form will not send.** Name, email address and message are all required, and the email address must be valid. If it still fails you will see "Failed to send your message. Please try again." — the message did not reach the label, so try again shortly or use the published email address.

**An application link says "Link expired."** Those links are deactivated after a while. Ask the label for a current code.

**You cannot log in.** Use the "forgot password" option on the login page to have a reset link emailed. See [[accounts-and-access]].

## Common questions

**Is the site down?** The assistant cannot check. If pages will not load at all, try again shortly and then report it through the contact form.

**Why did my newsletter signup seem to do nothing?** If your address was already subscribed the site accepts it quietly rather than telling you. You are on the list.

## Escalate

Escalate anything still broken after the first step above, plus every account lockout, missing invitation, and report of wrong data. Give the contact form as the route to a human.

## Do not say

- Do not promise that a message, application or signup was received. The assistant cannot confirm it.
- Do not give a support phone number or a support hours window. Neither exists.
- Do not claim a fix, a timescale for a fix, or that an issue has been reported to the team.
