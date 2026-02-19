export interface Server {
  id: number;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Channel {
  id: number;
  server_id: number;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  display_name: string;
  user_id: string;
  channel_id: number;
  created_at: string;
  failed?: boolean;
}