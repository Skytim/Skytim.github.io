---
title: '【範例】C# async/await：避免常見的 fire-and-forget 陷阱'
description: '範例文章：以 C# 程式碼說明 async/await 的基本用法，以及為什麼不該忽略 await 回傳的 Task。'
pubDate: 2026-10-20
updatedDate: 2026-10-21
tags: ['範例', 'C#', '.NET']
draft: false
---

> **注意：** 以下內容為教學範例，非 production 完整實作。

在 ASP.NET 或背景工作中，`async/await` 幾乎是日常。最常見的問題不是語法，而是**沒有 await 就放行 Task**，導致例外被吞掉或請求提早結束。

## 正確：await 完成再繼續

```csharp
public async Task<User?> GetUserAsync(int id, CancellationToken cancellationToken)
{
    var response = await _httpClient.GetAsync($"/api/users/{id}", cancellationToken);
    response.EnsureSuccessStatusCode();

    return await response.Content.ReadFromJsonAsync<User>(cancellationToken: cancellationToken);
}
```

`await` 會在 I/O 完成前讓出執行緒，但不會阻塞執行緒池——這正是 async 在伺服器端的價值。

## 陷阱：fire-and-forget

```csharp
// ❌ 不要這樣做：例外可能變成 UnobservedTaskException
_ = SendAuditLogAsync(userId);

public async Task SendAuditLogAsync(int userId)
{
    await _queue.PublishAsync(new AuditEvent(userId));
}
```

若 audit 失敗你應該知道。較安全的做法包括：

- 在 HTTP 請求路徑上 **await** 關鍵工作；
- 或使用 `BackgroundService` / 訊息佇列，並在邊界記錄失敗；
- 若真的必須 detach，使用明確的錯誤處理（例如 `Task.Run` 包裝並 log），而不是裸 `_ = task`。

## 小結

`async/await` 讓非同步程式碼讀起來像同步，但**Task 的生命週期仍然要管理**。寫 API 時，問自己一句：「如果這個 Task 失敗，誰負責記錄與重試？」

---

這篇範例主要展示**程式碼區塊**在淺色 / 深色模式下的 Shiki 高亮效果。正式文章請刪除【範例】標記並替換成你的內容。
