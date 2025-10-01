import { 
  signupSchema, 
  loginSchema, 
  createQRSessionSchema,
  createPrayerRequestSchema,
  createWelfareSupportSchema
} from '@/lib/schemas';

describe('Zod Schemas', () => {
  describe('signupSchema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        fullName: 'Test User'
      };

      expect(() => signupSchema.parse(invalidData)).toThrow();
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        fullName: 'Test User'
      };

      expect(() => signupSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty full name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: ''
      };

      expect(() => signupSchema.parse(invalidData)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createQRSessionSchema', () => {
    it('should validate correct QR session data', () => {
      const validData = {
        title: 'Test Session',
        location: 'Main Hall',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString()
      };

      expect(() => createQRSessionSchema.parse(validData)).not.toThrow();
    });

    it('should reject missing title', () => {
      const invalidData = {
        location: 'Main Hall',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString()
      };

      expect(() => createQRSessionSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createPrayerRequestSchema', () => {
    it('should validate correct prayer request data', () => {
      const validData = {
        title: 'Test Prayer Request',
        description: 'This is a test prayer request'
      };

      expect(() => createPrayerRequestSchema.parse(validData)).not.toThrow();
    });

    it('should reject missing title', () => {
      const invalidData = {
        description: 'This is a test prayer request'
      };

      expect(() => createPrayerRequestSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createWelfareSupportSchema', () => {
    it('should validate correct welfare support data', () => {
      const validData = {
        title: 'Test Support Request',
        description: 'This is a test support request',
        category: 'financial',
        urgency: 'medium'
      };

      expect(() => createWelfareSupportSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid category', () => {
      const invalidData = {
        title: 'Test Support Request',
        description: 'This is a test support request',
        category: 'invalid-category',
        urgency: 'medium'
      };

      expect(() => createWelfareSupportSchema.parse(invalidData)).toThrow();
    });
  });
});