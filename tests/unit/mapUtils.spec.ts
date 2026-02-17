import { describe, it, expect } from "vitest";
import { getGoogleMapsUrl } from "../../src/utils/mapUtils";

describe("Map Utils", () => {
  it("應優先使用 Place ID 生成連結", () => {
    const loc = {
      title: "描述標題",
      subtitle: "淺草寺",
      placeId: "ChIJVcXzIfGOGBgRxbZldgjJ4Z8",
      coordinates: { lat: 10, lng: 20 },
    };
    const url = getGoogleMapsUrl(loc);
    expect(url).toContain("query_place_id=ChIJVcXzIfGOGBgRxbZldgjJ4Z8");
    expect(url).toContain("query=%E6%B7%BA%E8%8D%89%E5%AF%BA");
  });

  it("若無 Place ID應使用座標", () => {
    const loc = {
      subtitle: "無名地點",
      coordinates: { lat: 35.7133, lng: 139.7958 },
    };
    const url = getGoogleMapsUrl(loc);
    expect(url).toContain("query=35.7133,139.7958");
  });

  it("若無精確資訊應使用地點名稱與地址搜尋", () => {
    const loc = {
      subtitle: "東京鐵塔",
      address: "港區芝公園",
    };
    const url = getGoogleMapsUrl(loc);
    expect(url).toContain(
      "query=%E6%9D%B1%E4%BA%AC%E9%90%B5%E5%A1%94%20%E6%B8%AF%E5%8D%80%E8%8A%9D%E5%85%AC%E5%9C%92",
    );
  });
});
