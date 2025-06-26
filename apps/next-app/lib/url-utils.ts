// ===============================================
// UTILIDADES PARA MANEJO DE URLs
// ===============================================

/**
 * Normaliza una URL agregando https:// si no tiene protocolo
 */
export function normalizeUrl(url: string): string {
  if (!url || url.trim() === '') return '';
  
  const trimmedUrl = url.trim();
  
  // Si ya tiene protocolo, devolverla tal como está
  if (trimmedUrl.match(/^https?:\/\//i)) {
    return trimmedUrl;
  }
  
  // Si empieza con www., agregar https://
  if (trimmedUrl.match(/^www\./i)) {
    return `https://${trimmedUrl}`;
  }
  
  // Si contiene un punto y parece ser un dominio, agregar https://
  if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
    return `https://${trimmedUrl}`;
  }
  
  // Para otros casos (como @usuario), devolverla tal como está
  return trimmedUrl;
}

/**
 * Valida si una URL es válida (más permisiva que la validación estándar)
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') return true; // URLs vacías son válidas
  
  const normalizedUrl = normalizeUrl(url);
  
  try {
    // Intentar crear un objeto URL para validar
    new URL(normalizedUrl);
    return true;
  } catch {
    // Si no es una URL válida, verificar si es un username/handle válido
    const trimmedUrl = url.trim();
    
    // Validar usernames de redes sociales (@usuario o usuario)
    if (trimmedUrl.match(/^@?[a-zA-Z0-9._-]+$/)) {
      return true;
    }
    
    // Validar dominios simples (ejemplo.com)
    if (trimmedUrl.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      return true;
    }
    
    return false;
  }
}

/**
 * Convierte un username a URL completa para una red social específica
 */
export function socialUrlFromUsername(username: string, platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'): string {
  if (!username || username.trim() === '') return '';
  
  const cleanUsername = username.trim().replace(/^@/, '');
  
  const baseUrls = {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    linkedin: 'https://linkedin.com/in/'
  };
  
  return `${baseUrls[platform]}${cleanUsername}`;
}

/**
 * Extrae el username de una URL de red social
 */
export function extractUsernameFromSocialUrl(url: string): string {
  if (!url || url.trim() === '') return '';
  
  // Si ya es un username, devolverlo
  if (url.match(/^@?[a-zA-Z0-9._-]+$/)) {
    return url.replace(/^@/, '');
  }
  
  // Extraer de URLs
  const patterns = [
    /(?:instagram\.com\/|facebook\.com\/|twitter\.com\/|linkedin\.com\/in\/)([a-zA-Z0-9._-]+)/i,
    /(?:instagram\.com\/|facebook\.com\/|twitter\.com\/|linkedin\.com\/company\/)([a-zA-Z0-9._-]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return url;
} 