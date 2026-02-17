import { describe, it, expect } from "vitest";
import { app, db, auth, storage } from "../../src/services/firebase";

// 注意：這裡測試的是初始化後的物件是否存在，而非真正的網路連線
describe("Firebase Service Initialization", () => {
  it("應該成功初始化 Firebase App", () => {
    expect(app).toBeDefined();
    expect(app.name).toBe("[DEFAULT]");
  });

  it("應該成功匯出 Firestore 實例", () => {
    expect(db).toBeDefined();
    expect(db.type).toBe("firestore");
  });

  it("應該成功匯出 Auth 實例", () => {
    expect(auth).toBeDefined();
  });

  it("應該成功匯出 Storage 實例", () => {
    expect(storage).toBeDefined();
  });
});
