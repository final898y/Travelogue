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
  mapUrl?: string; // 外部地圖連結 (優先採用)
}

export function getGoogleMapsUrl(location: MapLocation): string {
  const { subtitle, address, placeId, coordinates, mapUrl } = location;

  // 1. 絕對優先級：若已有完整的地圖連結，直接返回
  if (mapUrl && mapUrl.startsWith("http")) {
    return mapUrl;
  }

  const baseUrl = "https://www.google.com/maps/search/?api=1";

  // 2. 優先級：Place ID (最精準)
  if (placeId) {
    return `${baseUrl}&query=${encodeURIComponent(subtitle)}&query_place_id=${placeId}`;
  }

  // 3. 次優先級：座標 (經緯度)
  if (coordinates) {
    return `${baseUrl}&query=${coordinates.lat},${coordinates.lng}`;
  }

  // 4. 備案：搜尋模式 (地點名稱 + 地址)
  const searchQuery = address ? `${subtitle} ${address}` : subtitle;
  return `${baseUrl}&query=${encodeURIComponent(searchQuery)}`;
}
