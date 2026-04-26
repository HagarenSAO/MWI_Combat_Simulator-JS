# 修改計畫：修復掉落物的隨機種子同步問題

## 1. 總結
本計畫的目標是修正 `calcDropMaps()` 函數在結算掉落物時沒有使用正確隨機種子的問題。我們會透過在該函數開頭加入重置亂數狀態的邏輯，確保它能接續使用戰鬥模擬器 (`combatSimulator.js`) 結束時保存的種子 (`simResult.seed`)。

## 2. 當前狀態分析
- 在 `src/combatsimulator/combatSimulator.js` 的第 261 行，戰鬥模擬結束時已經有將當前的種子狀態存入 `this.simResult.seed = getSeed();`。
- 但是在 `src/main.js` 的 `calcDropMaps()` 函數中，結算掉落物並呼叫 `random()` 時，並沒有使用這個保存下來的種子，導致掉落物結果無法保持固定。
- `reset` 函數已經在 `src/main.js` 的第 1 行被引入 (`import { random, reset } from "./random.js";`)，可以直接使用。

## 3. 預計修改
**檔案：** `src/main.js`

**修改內容：**
在 `calcDropMaps(simResult, playerToDisplay)` 函數的最前面，加上以下程式碼：
```javascript
    if (simResult.seed !== undefined) {
        reset(simResult.seed);
    }
```

**修改原因：**
這樣一來，`main.js` 在計算掉落物（呼叫 `random()` 決定掉落機率與數量）之前，就會把亂數產生器的狀態重置為該場戰鬥結束時的狀態。如此便能確保每一次給定相同的初始 Seed，除了戰鬥過程相同外，連掉落物的結果也能完美重現。

## 4. 假設與決策
- **決策：** 完全依照使用者的指示，僅在 `calcDropMaps()` 最前面加入 `reset(simResult.seed)` 的邏輯，不修改 `worker.js` 或其他按鈕事件。
- **假設：** 使用者了解在「模擬多個區域」的情況下，單純依賴 `simResult.seed` 可能會因為 Worker 執行順序不同而有不可預測的狀況，但目前使用者明確要求以此方式實作，因此我們會嚴格遵守這個指示。

## 5. 驗證步驟
1. 修改 `src/main.js` 並儲存。
2. 執行 `npm run build` 確保專案編譯成功且無語法錯誤。
