import { describe, it, expect } from "vitest";
import { getGoogleMapsUrl, type MapLocation } from "../../src/utils/mapUtils";

describe("getGoogleMapsUrl", () => {
  const BASE_URL = "https://www.google.com/maps/search/?api=1";

  // --- 1. 測試優先級邏輯 (Priority Logic) ---
  describe("Priority Logic", () => {
    const fullLocation: MapLocation = {
      subtitle: "完整地點",
      address: "完整地址",
      placeId: "FULL_PLACE_ID",
      coordinates: { lat: 1, lng: 1 },
      mapUrl: "https://custom.map/link",
    };

    it("P1: 應絕對優先返回 `mapUrl` (如果它是有效的 http 連結)", () => {
      const url = getGoogleMapsUrl(fullLocation);
      expect(url).toBe("https://custom.map/link");
    });

    it("P1 Edge: 如果 `mapUrl` 不是有效的 http 連結，應忽略並降級", () => {
      const url = getGoogleMapsUrl({
        ...fullLocation,
        mapUrl: "not-a-valid-url",
      });
      // 應降級至 P2 (Place ID)
      expect(url).toContain("query_place_id=FULL_PLACE_ID");
    });

    it("P2: 應優先使用 `placeId`，即使 `coordinates` 和 `address` 存在", () => {
      const url = getGoogleMapsUrl({
        subtitle: "有 Place ID 的地點",
        address: "一個地址",
        placeId: "SOME_PLACE_ID",
        coordinates: { lat: 10, lng: 20 },
      });
      expect(url).toBe(
        `${BASE_URL}&query=${encodeURIComponent("有 Place ID 的地點")}&query_place_id=SOME_PLACE_ID`,
      );
    });

    it("P3: 在沒有 `placeId` 的情況下，應優先使用 `coordinates`", () => {
      const url = getGoogleMapsUrl({
        subtitle: "有座標的地點",
        address: "一個地址",
        coordinates: { lat: 35.123, lng: 139.456 },
      });
      expect(url).toBe(`${BASE_URL}&query=35.123,139.456`);
    });

    it("P4: 作為最後的備案，應使用 `subtitle` 和 `address` 進行搜尋", () => {
      const url = getGoogleMapsUrl({
        subtitle: "僅有地址",
        address: "日本東京都",
      });
      expect(url).toBe(
        `${BASE_URL}&query=${encodeURIComponent("僅有地址 日本東京都")}`,
      );
    });

    it("P4: 如果 `address` 不存在，應僅使用 `subtitle` 搜尋", () => {
      const url = getGoogleMapsUrl({
        subtitle: "僅有標題",
      });
      expect(url).toBe(`${BASE_URL}&query=${encodeURIComponent("僅有標題")}`);
    });
  });

  // --- 2. 測試邊界值與無效輸入 (Edge Cases & Invalid Inputs) ---
  describe("Edge Cases and Invalid Inputs", () => {
    it("當 `subtitle` 為空字串時，仍應能使用 `placeId`", () => {
      const url = getGoogleMapsUrl({
        subtitle: "",
        placeId: "EMPTY_SUBTITLE_PLACE_ID",
      });
      expect(url).toBe(
        `${BASE_URL}&query=&query_place_id=EMPTY_SUBTITLE_PLACE_ID`,
      );
    });

    it("當 `subtitle` 為空字串且無其他資訊時，應產生一個空的搜尋", () => {
      const url = getGoogleMapsUrl({ subtitle: "" });
      expect(url).toBe(`${BASE_URL}&query=`);
    });

    it("當可選屬性為 `null` 或 `undefined` 時，應能平穩降級", () => {
      // placeId is null, should fall back to coordinates
      let url = getGoogleMapsUrl({
        subtitle: "地點",
        placeId: null as any,
        coordinates: { lat: 10, lng: 20 },
      });
      expect(url).toBe(`${BASE_URL}&query=10,20`);

      // coordinates is undefined, should fall back to address search
      url = getGoogleMapsUrl({
        subtitle: "地點",
        address: "地址",
        coordinates: undefined,
      });
      expect(url).toBe(`${BASE_URL}&query=${encodeURIComponent("地點 地址")}`);
    });

    it("應正確處理 `coordinates` 為 0 的情況", () => {
      const url = getGoogleMapsUrl({
        subtitle: "赤道與本初子午線的交點",
        coordinates: { lat: 0, lng: 0 },
      });
      expect(url).toBe(`${BASE_URL}&query=0,0`);
    });

    it("如果 `location` 物件為空 (違反 TS 但 JS 中可能)，應回退到一個查詢 'undefined' 的 URL", () => {
      // 這是 JS 的預期行為，因為 `undefined` 會被轉為字串 "undefined"
      const url = getGoogleMapsUrl({} as MapLocation);
      expect(url).toBe(`${BASE_URL}&query=undefined`);
    });
  });

  // --- 3. 測試數據處理 (Data Handling) ---
  describe("Data Handling", () => {
    it("應正確編碼搜尋查詢中的特殊字元", () => {
      const url = getGoogleMapsUrl({
        subtitle: "名稱含 & 和 ?",
        address: "地址含 / 和 空格",
      });
      const expectedQuery = encodeURIComponent(
        "名稱含 & 和 ? 地址含 / 和 空格",
      );
      expect(url).toBe(`${BASE_URL}&query=${expectedQuery}`);
    });
  });
});
