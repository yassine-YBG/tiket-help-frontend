// Values the backend accepts (keep in sync with backend utils/validation.js).
// The backend stores statuses in French; the UI shows English labels.

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPERADMIN];

export const isAdmin = (user) => !!user && ADMIN_ROLES.includes(user.role);

export const ROLE_LABELS = {
  user: 'User',
  admin: 'Admin',
  superadmin: 'Super admin',
};

export const TICKET_STATUSES = ['non résolu', 'en cours', 'résolu'];

export const STATUS_LABELS = {
  'non résolu': 'Open',
  'en cours': 'In progress',
  'résolu': 'Resolved',
};

export const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export const PRIORITY_LABELS = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

// Same limits as the backend upload middleware
export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'audio/mpeg', 'audio/wav',
  'video/mp4', 'video/quicktime',
];

export const MIN_PASSWORD_LENGTH = 6;

// Text limits shown in the forms (keeps requests small and readable)
export const LIMITS = {
  subject: 150,
  category: 50,
  description: 5000,
  message: 5000,
};

// Suggestions for the category field (free text is still allowed)
export const CATEGORY_SUGGESTIONS = ['YouTube', 'Spotify', 'Netflix', 'Account', 'Payment', 'Software', 'Other'];
