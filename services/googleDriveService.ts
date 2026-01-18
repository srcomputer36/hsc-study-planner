
/**
 * Google Drive API Service for Master File Synchronization
 */

const DRIVE_FILE_NAME = 'HSC_STUDY_MASTER_BACKUP.json';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

export interface DriveStatus {
  isConnected: boolean;
  lastSynced?: string;
  email?: string;
  fileId?: string;
}

export function getStoredClientId(): string {
  return localStorage.getItem('hsc_google_client_id') || '';
}

export async function authenticateGoogleDrive(): Promise<string> {
  const clientId = getStoredClientId();
  
  if (!clientId || clientId.length < 10) {
    throw new Error("Client ID পাওয়া যায়নি! দয়া করে সেটিংসের ২য় ধাপে আপনার Client ID দিয়ে সেভ করুন।");
  }

  return new Promise((resolve, reject) => {
    try {
      if (!(window as any).google || !(window as any).google.accounts) {
        throw new Error("গুগল সার্ভিস লোড হয়নি। দয়া করে পেজটি রিফ্রেশ দিন।");
      }

      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: DRIVE_SCOPE,
        callback: (response: any) => {
          if (response.error) {
            if (response.error === 'popup_closed_by_user') {
              reject(new Error("পপআপ উইন্ডোটি বন্ধ হয়ে গেছে। এটি সাধারণত তখনই হয় যখন গুগল আপনার এই সাইটটিকে (Origin URL) চিনতে পারে না।"));
            } else {
              reject(new Error(response.error_description || response.error || "গুগল কানেকশনে সমস্যা হয়েছে।"));
            }
          } else {
            resolve(response.access_token);
          }
        },
        error_callback: (err: any) => {
          // GIS error_callback handles fatal internal errors
          reject(new Error(err.message || "পপআপ ওপেন হতে বাধা পেয়েছে। ব্রাউজার পপআপ ব্লকার চেক করুন।"));
        }
      });
      
      // Force prompt to ensure the user sees the account selector
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      reject(err);
    }
  });
}

export async function findMasterFile(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${DRIVE_FILE_NAME}' and trashed=false`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  } catch (e) {
    console.error("Find file failed", e);
    return null;
  }
}

export async function uploadMasterFile(accessToken: string, content: string, fileId?: string): Promise<string> {
  const metadata = {
    name: DRIVE_FILE_NAME,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'application/json' }));

  const url = fileId 
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  
  const method = fileId ? 'PATCH' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.id;
}

export async function downloadMasterFile(accessToken: string, fileId: string): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) throw new Error("Download failed");
  return await response.text();
}
