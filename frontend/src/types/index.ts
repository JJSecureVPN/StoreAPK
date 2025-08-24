export interface App {
  id: number;
  name: string;
  package_name: string;
  short_description?: string;
  long_description?: string;
  logo_url?: string;
  apk_url?: string;
  version?: string;
  size_mb?: number;
  category?: string;
  downloads: number;
  likes: number;
  created_at: string;
  updated_at?: string;
}

export interface Screenshot {
  id: number;
  app_id: number;
  image_url: string;
  position: number;
  created_at: string;
}

export interface Comment {
  id: number;
  app_id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface AppWithDetails extends App {
  screenshots?: Screenshot[];
  comments?: Comment[];
}

export interface LikeResponse {
  liked: boolean;
  likes: number;
}

export interface DownloadResponse {
  download_url: string;
  filename: string;
}

export interface UploadResponse {
  message: string;
  data: {
    logo_url?: string;
    apk_url?: string;
    size_mb?: string;
    screenshots?: Array<{
      image_url: string;
      position: number;
    }>;
  };
}
