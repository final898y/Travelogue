/**
 * Google Maps URL Generator
 * 遵循官方 Universal Links 規範，採防禦性優先級生成連結。
 */
export interface MapLocation {
  title?: string; // 描述性標題 (可選)
  subtitle: string; // 精確地點名稱 (必填，用於搜尋)
  address?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export function getGoogleMapsUrl(location: MapLocation): string {
  const baseUrl = "https://www.google.com/maps/search/?api=1";
  const { subtitle, address, placeId, coordinates } = location;

  // 1. 優先級：Place ID (最精準)
  if (placeId) {
    return `${baseUrl}&query=${encodeURIComponent(subtitle)}&query_place_id=${placeId}`;
  }

  // 2. 次優先級：座標 (經緯度)
  if (coordinates) {
    return `${baseUrl}&query=${coordinates.lat},${coordinates.lng}`;
  }

  // 3. 備案：搜尋模式 (地點名稱 + 地址)
  const searchQuery = address ? `${subtitle} ${address}` : subtitle;
  return `${baseUrl}&query=${encodeURIComponent(searchQuery)}`;
}
