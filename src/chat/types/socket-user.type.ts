export interface SocketUser {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

export type AuthenticatedSocketData = {
  user?: SocketUser;
};
