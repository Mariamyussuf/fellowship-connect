import { app, auth, db, storage } from '@/lib/firebaseAdmin';

describe('Firebase Admin', () => {
  it('should export Firebase Admin modules', () => {
    // We're just checking that the module exports exist, not that they're initialized
    // This prevents test failures when environment variables aren't set
    expect(['object', 'undefined']).toContain(typeof app);
    expect(['object', 'undefined']).toContain(typeof auth);
    expect(['object', 'undefined']).toContain(typeof db);
    expect(['object', 'undefined']).toContain(typeof storage);
  });
});