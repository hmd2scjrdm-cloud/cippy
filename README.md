# Cippy Malaysia

Cippy Malaysia is a static launch site for a Korean-inspired fashion brand in Malaysia.

## Local Preview

Open `index.html` directly in a browser, or run any static file server from this folder.

## Deploy

This project can be deployed as a static site on GitHub Pages, Vercel, Netlify, or Cloudflare Pages.

For GitHub Pages, push this folder to a repository and enable the included workflow in `.github/workflows/pages.yml`.

## Firebase + Gmail Order Email

The site uses Firebase Auth for customer email verification and Gmail SMTP for order confirmation emails. Add these environment variables in Vercel before deploying:

```txt
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_APP_ID=
GMAIL_USER=
GMAIL_APP_PASSWORD=
ORDER_NOTIFY_EMAIL=
```

Notes:

- Enable Email/Password sign-in in Firebase Authentication.
- Add `cippy.vercel.app` to Firebase Authentication authorized domains.
- `GMAIL_APP_PASSWORD` must be a Google App Password, not the normal Gmail password.
- `ORDER_NOTIFY_EMAIL` is where Cippy receives a copy of each order.
