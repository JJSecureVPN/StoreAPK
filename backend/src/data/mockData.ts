// Mock data for when database is not available
export const mockApps = [
  {
    id: 1,
    name: 'WhatsApp Messenger',
    package_name: 'com.whatsapp',
    short_description: 'Mensajería instantánea simple, segura y confiable',
    long_description: 'WhatsApp Messenger es una aplicación de mensajería GRATUITA disponible para Android y otros smartphones. WhatsApp te permite enviar y recibir mensajes, llamadas, fotos, videos, documentos y mensajes de voz.',
    logo_url: 'https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN=w240-h480',
    apk_url: '/uploads/apks/whatsapp.apk',
    version: '2.23.15.76',
    size_mb: 65.2,
    category: 'Comunicación',
    downloads: 5000000000,
    likes: 12500000,
    created_at: new Date('2023-01-15T10:00:00Z'),
    updated_at: new Date('2023-08-12T15:30:00Z')
  },
  {
    id: 2,
    name: 'Instagram',
    package_name: 'com.instagram.android',
    short_description: 'Crea y comparte fotos, historias y reels con amigos',
    long_description: 'Instagram de Meta te conecta con amigos y te permite compartir lo que haces o ver qué está pasando en el mundo. Explora nuestra comunidad donde puedes ser tú mismo y compartir desde tus momentos cotidianos hasta los más destacados de tu vida.',
    logo_url: 'https://play-lh.googleusercontent.com/ZyWNGIfzUyoajtFcD7NhMksHEZh37f-MkHVGr5Yfefa-IX7yj9SMfI82Z7a2wpdKCA=w240-h480',
    apk_url: '/uploads/apks/instagram.apk',
    version: '295.0.0.32.123',
    size_mb: 89.5,
    category: 'Multimedia',
    downloads: 2000000000,
    likes: 8200000,
    created_at: new Date('2023-02-10T14:20:00Z'),
    updated_at: new Date('2023-08-11T09:15:00Z')
  },
  {
    id: 3,
    name: 'TikTok',
    package_name: 'com.zhiliaoapp.musically',
    short_description: 'Videos cortos divertidos para descubrir y crear',
    long_description: 'TikTok es el destino líder para videos móviles de formato corto. Nuestra misión es inspirar creatividad y traer alegría. TikTok tiene oficinas globales que incluyen Los Ángeles, Nueva York, Londres, París, Berlín, Dubái, Singapur, Yakarta, Seúl y Tokio.',
    logo_url: 'https://play-lh.googleusercontent.com/z5jVRNKR3LC3lYhUKcfOzJEKpu5-_Wn0hj5cCEq6_-p6rTUCHMlH5j2lMOUwIXcpDA=w240-h480',
    apk_url: '/uploads/apks/tiktok.apk',
    version: '31.5.4',
    size_mb: 156.8,
    category: 'Entretenimiento',
    downloads: 3500000000,
    likes: 15600000,
    created_at: new Date('2023-03-05T11:45:00Z'),
    updated_at: new Date('2023-08-10T16:22:00Z')
  },
  {
    id: 4,
    name: 'YouTube',
    package_name: 'com.google.android.youtube',
    short_description: 'Reproduce videos, música y contenido en vivo',
    long_description: 'Obtén la aplicación oficial de YouTube para teléfonos y tablets Android. Descubre qué está viendo el mundo: desde los videos musicales más populares hasta las tendencias en videojuegos, entretenimiento, noticias y mucho más.',
    logo_url: 'https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc=w240-h480',
    apk_url: '/uploads/apks/youtube.apk',
    version: '18.33.40',
    size_mb: 118.7,
    category: 'Entretenimiento',
    downloads: 10000000000,
    likes: 25000000,
    created_at: new Date('2023-01-20T08:30:00Z'),
    updated_at: new Date('2023-08-12T12:00:00Z')
  },
  {
    id: 5,
    name: 'Spotify',
    package_name: 'com.spotify.music',
    short_description: 'Música y podcasts',
    long_description: 'Spotify es un servicio de música digital que te da acceso a millones de canciones. Escucha la música que más te gusta donde y cuando quieras. Descubre música nueva cada día con Daily Mix, Discover Weekly y Release Radar.',
    logo_url: 'https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5eSaf4-qMMZdwEDKI5VEmKAXfzOqbiaeAsqqrEBCTdIEs=w240-h480',
    apk_url: '/uploads/apks/spotify.apk',
    version: '8.8.52.488',
    size_mb: 78.3,
    category: 'Multimedia',
    downloads: 1000000000,
    likes: 6800000,
    created_at: new Date('2023-02-28T13:15:00Z'),
    updated_at: new Date('2023-08-09T10:45:00Z')
  },
  {
    id: 6,
    name: 'Telegram',
    package_name: 'org.telegram.messenger',
    short_description: 'Mensajería rápida y segura',
    long_description: 'Telegram es una aplicación de mensajería con enfoque en la velocidad y seguridad. Es súper rápida, simple, segura y gratuita. Telegram entrega mensajes más rápido que cualquier otra aplicación.',
    logo_url: 'https://play-lh.googleusercontent.com/ZU9cSsyIJZo6Oy7HTHiEPwZg0m2Crep-d5ZrfajqtsH-qgUXSqKpNA2FpPDTn-7qA5Q=w240-h480',
    apk_url: '/uploads/apks/telegram.apk',
    version: '10.0.7',
    size_mb: 52.1,
    category: 'Comunicación',
    downloads: 500000000,
    likes: 4200000,
    created_at: new Date('2023-03-12T16:40:00Z'),
    updated_at: new Date('2023-08-08T14:20:00Z')
  }
];

// In-memory storage for user-uploaded apps when database is not available
export let userUploadedApps: any[] = [];

// Function to add a new app to the in-memory storage
export const addMockApp = (appData: any) => {
  console.log('Adding app to in-memory storage:', appData);
  userUploadedApps.push(appData);
  console.log('Total apps in memory now:', userUploadedApps.length);
};

// Function to update an existing app in the in-memory storage
export const updateMockApp = (packageName: string, appData: any) => {
  console.log('Updating app in in-memory storage:', packageName);
  const index = userUploadedApps.findIndex(app => app.package_name === packageName);
  if (index !== -1) {
    userUploadedApps[index] = { ...userUploadedApps[index], ...appData };
    console.log('App updated successfully');
    return userUploadedApps[index];
  }
  return null;
};

// Function to get all apps (prioritize user uploaded, fallback to mock)
export const getAllMockApps = () => {
  // If there are user-uploaded apps, return only those
  if (userUploadedApps.length > 0) {
    console.log('Returning user-uploaded apps only:', userUploadedApps.length, 'apps');
    return userUploadedApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  // If no user-uploaded apps, return mock apps as examples
  console.log('No user-uploaded apps found, returning mock apps:', mockApps.length, 'apps');
  return mockApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Function to find an app by package name in user uploaded apps
export const findMockAppByPackageName = (packageName: string) => {
  return userUploadedApps.find(app => app.package_name === packageName);
};

export const mockComments = [
  {
    id: 1,
    app_id: 1,
    username: 'Carlos123',
    content: '¡Excelente aplicación! La uso todos los días.',
    created_at: new Date('2023-08-10T10:15:00Z')
  },
  {
    id: 2,
    app_id: 1,
    username: 'Maria_Dev',
    content: 'Muy útil para mantenerme en contacto con la familia.',
    created_at: new Date('2023-08-11T14:30:00Z')
  },
  {
    id: 3,
    app_id: 2,
    username: 'PhotoLover',
    content: 'Me encanta compartir mis fotos aquí.',
    created_at: new Date('2023-08-09T18:45:00Z')
  },
  {
    id: 4,
    app_id: 3,
    username: 'DanceFan',
    content: 'Los videos son súper entretenidos!',
    created_at: new Date('2023-08-12T09:20:00Z')
  }
];

export const mockScreenshots = [
  {
    id: 1,
    app_id: 1,
    image_url: 'https://play-lh.googleusercontent.com/WPaGEI2z_SdGTDNRnH-8rJ8RzG_SZCKnJUh6dXQn2q4B8I7XVF_qDKkCBzX_8vZbgQ=w526-h296',
    position: 0,
    created_at: new Date('2023-01-15T10:00:00Z')
  },
  {
    id: 2,
    app_id: 1,
    image_url: 'https://play-lh.googleusercontent.com/REqYyNnJm-P9-m9z2rTm2k7X-VY4v9FZF-nT5D_cX8nQ2qRJ6Uf_8QpG9VsD-X2Y=w526-h296',
    position: 1,
    created_at: new Date('2023-01-15T10:00:00Z')
  }
];
