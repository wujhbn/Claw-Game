# 專案交接總結：3D 多人連線夾娃娃機 (3D Multiplayer Claw Machine)

你好！這是一個以 React + Three.js + Socket.io 打造的全端 3D 多人連線夾娃娃機專案。請閱讀以下專案狀態以接續開發。

## 1. 核心功能與架構 (Core Features & Architecture)
目前專案已具備完整的 3D 物理引擎互動、多人連線排隊與遊玩機制。
核心元件 (`/src/components/`) 包含：
*   **`ClawMachine.tsx`**: 夾娃娃機的三維機台模型，具有物理碰撞剛體。外觀已客製化為「**暖橘色調**」，並在機台上以程式碼刻畫了包含熊熊、兔子與長尾山雀等可愛動物的 3D 彩繪裝飾。
*   **`UI.tsx`**: 負責遊戲主要的 2D UI 介面，包含連線狀態、排隊列表、自訂名稱輸入、遊戲搖桿與按鈕操作、計分與倒數計時等。
*   **`GameScene.tsx`**: 處理 Three.js 的 Canvas 設定、打光、以及 `Rapier` 物理世界的建置。
*   **`Claw.tsx`**: 爪子的 3D 模型與物理邏輯，包含移動與抓取（收合）的操作。
*   **`Prizes.tsx` & `ShimaEnaga.tsx`**: 娃娃機內的獎品模型（包含各種動物、多種顏色與**不同的大小比例 (scale)**）。
*   **後端系統 (`/server.ts`)**: 使用 Express + Socket.io 處理多人連線同步、排隊機制、獎品池生成（動態賦予大小與價值）與分數計算。

## 2. 目前使用的技術棧 (Tech Stack)
*   **前端**: React 18, Vite, Tailwind CSS (用於 2D UI)
*   **3D 與物理**: Three.js, `@react-three/fiber` (R3F), `@react-three/drei`, `@react-three/rapier` (物理引擎)
*   **狀態管理**: Zustand (`/src/store.ts`)
*   **後端**: Node.js, Express, `socket.io`
*   **開發語言**: TypeScript

## 3. 接下來馬上要做的下一步 / 已知 Bug (Next Steps & Bugs)
*   **🚨 核心待修復 Bug**: **「在電腦版瀏覽器打開時，會卡在進入遊戲前，無法點擊開始/加入遊戲按鈕」**。
    *   *AI 請注意*：這可能與 DOM 元素的 `pointer-events: none` 穿透問題、或是 React Drei 的 `<Html>` 或 overlay 層級擋住了底下 UI 的點擊事件有關。也可能是因為名稱修改或 Socket 連線尚未 ready 導致的狀態卡住。這是新對話的首要修復任務！

## 4. 關鍵規則與代碼邏輯 (Key Rules & Conventions)
*   **玩家名稱邏輯**: 已將玩家名稱輸入限制改為 **1-15 碼的大小寫英文字母**（原本為 3 碼大寫）。後端的限制與字串處理 (`server.ts` 內的 JOIN 事件) 以及前端的 input 限制都已經同步更新，後續開發請遵循這個 15 碼字母的規格。
*   **娃娃多樣性法則**: 每一局生成的娃娃不僅顏色和種類不同，**大小也不同**（透過 `scale` 參數處理，例如 0.6, 1.0, 1.5 等）。此邏輯在 `server.ts` 產生時給予，並由 `Prizes.tsx` 傳遞給 `ShimaEnaga.tsx` 渲染。
*   **機台外觀設計 (禁止改回藍色)**: 機台 `ClawMachine.tsx` 目前已經設計成充滿活力的**暖橘色/淡雅色調**，並配有程式刻出的立體動物五官與彩繪（絕對不可以把外觀改回單調的預設藍色或移除這些裝飾）。
*   **全端專案需重新啟動**: 如果修改了 `server.ts`，必須確保呼叫工具重新編譯/啟動伺服器才能生效。
