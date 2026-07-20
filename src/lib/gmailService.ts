import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');

let cachedToken: string | null = null;
let cachedEmail: string | null = null;

export const signInWithGoogleGmail = async (): Promise<{ token: string; email: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential || !credential.accessToken) {
      throw new Error('No access token returned from Google Sign-In.');
    }
    cachedToken = credential.accessToken;
    cachedEmail = result.user.email || null;
    return { token: cachedToken, email: cachedEmail || '' };
  } catch (error) {
    console.error('Error signing in with Google for Gmail:', error);
    throw error;
  }
};

export const getGmailToken = () => cachedToken;
export const getGmailEmail = () => cachedEmail;

export const logoutGmail = async () => {
  await signOut(auth);
  cachedToken = null;
  cachedEmail = null;
};

// Construct a raw MIME email (RFC 2822 compliant, base64url encoded)
export const makeMime = (to: string, from: string, subject: string, htmlContent: string) => {
  const str = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `Content-Type: text/html; charset="utf-8"`,
    `MIME-Version: 1.0`,
    ``,
    htmlContent,
  ].join('\r\n');

  // Base64url encode
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Send email via Gmail API
export const sendGmailMessage = async (
  token: string,
  to: string,
  from: string,
  subject: string,
  htmlContent: string
) => {
  const raw = makeMime(to, from, subject, htmlContent);
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail API error: ${response.status} - ${errText}`);
  }

  return response.json();
};
