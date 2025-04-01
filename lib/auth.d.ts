export function getToken(): string | null;
export function getUserIdFromHeader(authHeader: string | null): string | null;
export function isAdmin(userId: string | number): Promise<boolean>;
export function getUserById(userId: string | number): any;
export function isLoggedIn(): boolean;
export function getCurrentUser(): any;
export function hasRole(role: string): boolean;
export function hasPermission(permissionCategory: string, action: string): boolean;
export function setLogin(userData: any, token: string): void;
export function logout(): void;
export function verifyCredentials(email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
}>; 