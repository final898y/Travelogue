import { describe, it, expect, vi } from "vitest";
import fftest from "firebase-functions-test";
import * as myFunctions from "./index.js";

// 初始化 firebase-functions-test (Offline mode)
const test = fftest();

// 模擬 Firestore
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ exists: false })),
        set: vi.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

// 模擬 fetch (Bank of Taiwan CSV)
const mockCsvData = `幣別,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天
USD,本行買入,31.33,31.655,31.662,31.605,31.536,31.47,31.391,31.348,31.291,本行賣出,32.0,31.805,31.766,31.717,31.655,31.596,31.523,31.488,31.437
JPY,本行買入,0.191,0.1978,0.1986,0.1986,0.1988,0.1989,0.199,0.1991,0.1992,本行賣出,0.2038,0.2028,0.2027,0.2029,0.2031,0.2032,0.2034,0.2036,0.2038`;

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(mockCsvData),
  } as Response),
);

describe("Cloud Functions: getExchangeRate", () => {
  const wrapped = test.wrap(myFunctions.getExchangeRate);

  it("當未登入時應拋出 unauthenticated 錯誤", async () => {
    const data = { from: "TWD", to: "JPY" };
    // 不傳入 auth
    await expect(wrapped({ data })).rejects.toThrow(/請先登入/);
  });

  it("當參數缺失時應拋出 invalid-argument 錯誤", async () => {
    const data = { from: "TWD" };
    const auth = { uid: "test-user-123" };
    await expect(wrapped({ data, auth })).rejects.toThrow(/缺少必要的幣別參數/);
  });

  it("從台幣 (TWD) 換算為日圓 (JPY) 應計算正確", async () => {
    const data = { from: "TWD", to: "JPY" };
    const auth = { uid: "test-user-123" };

    // 預期 JPY 即期賣出為 0.2028 (第 13 欄)
    // TWD -> JPY: rate = 1 / 0.2028 ≈ 4.930966
    const result = await wrapped({ data, auth });

    expect(result.from).toBe("TWD");
    expect(result.to).toBe("JPY");
    expect(result.provider).toBe("Bank of Taiwan");
    expect(result.rate).toBeCloseTo(4.930966, 6);
  });

  it("從美金 (USD) 換算為台幣 (TWD) 應計算正確", async () => {
    const data = { from: "USD", to: "TWD" };
    const auth = { uid: "test-user-123" };

    // 預期 USD 即期賣出為 31.805 (第 13 欄)
    // USD -> TWD: rate = 31.805
    const result = await wrapped({ data, auth });

    expect(result.rate).toBe(31.805);
  });

  it("跨幣別換算 (USD -> JPY) 應計算正確", async () => {
    const data = { from: "USD", to: "JPY" };
    const auth = { uid: "test-user-123" };

    // USD(31.805) / JPY(0.2028) ≈ 156.82938855...
    // toFixed(6) -> 156.829389
    const result = await wrapped({ data, auth });

    expect(result.rate).toBe(156.829389);
  });
});
