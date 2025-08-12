export interface App {
  id?: number;
  name: string;
  package_name: string;
  short_description?: string;
  long_description?: string;
  logo_url?: string;
  apk_url?: string;
  version?: string;
  size_mb?: number;
  downloads?: number;
  likes?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Screenshot {
  id?: number;
  app_id: number;
  image_url: string;
  position?: number;
  created_at?: Date;
}

export interface Comment {
  id?: number;
  app_id: number;
  username: string;
  content: string;
  created_at?: Date;
}

export interface UserLike {
  id?: number;
  app_id: number;
  username: string;
  ip_address?: string;
  created_at?: Date;
}

export interface Download {
  id?: number;
  app_id: number;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export interface AppWithDetails extends App {
  screenshots?: Screenshot[];
  comments?: Comment[];
}
