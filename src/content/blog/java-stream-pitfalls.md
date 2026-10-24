---
title: 'Java Stream：副作用、重複消費與平行化的陷阱'
description: 'Stream 不適合邊跑邊改外面的狀態、同一個只能用一次，也別隨便加 parallel()。'
pubDate: 2026-10-24
tags: ['Java', 'Stream']
draft: false
---

`Stream` 拿來過濾、轉換、聚合很方便，但也容易踩三個坑：在 pipeline 裡改外面的狀態、同一個 Stream 用兩次，還有隨便加 `parallel()`。

Stream 適合寫「資料怎麼轉」，不適合一邊跑一邊改外面的變數或集合。

## 正確：轉換寫在 stream 裡，最後再收結果

把轉換留在 stream 裡，最後用 `collect` 或 `toList` 收起來：

```java
List<String> activeEmails = users.stream()
        .filter(User::active)
        .map(User::email)
        .filter(email -> email != null && !email.isBlank())
        .distinct()
        .toList();
```

若是「對每個元素做事」（寫檔、打 API、改資料庫），用傳統 `for` 通常比較好讀，例外跟中斷也好處理。

## 陷阱：副作用、重複消費、盲目 parallel

```java
// ❌ 在 forEach 裡改外面的 list——不好讀，開 parallel 時還可能出問題
List<String> emails = new ArrayList<>();
users.stream()
        .filter(User::active)
        .forEach(u -> emails.add(u.email()));

// ❌ 同一個 Stream 只能消費一次
Stream<User> stream = users.stream().filter(User::active);
long count = stream.count();
List<User> list = stream.toList(); // IllegalStateException

// ❌ 資料量小，或有共享可變狀態時，別亂加 parallel
users.parallelStream()
        .forEach(u -> sharedCounter.incrementAndGet());
```

建議這樣寫：

```java
// ✅ 用 collect / toList 產出新的 list
List<String> emails = users.stream()
        .filter(User::active)
        .map(User::email)
        .toList();

// ✅ 要兩次結果就開兩條 stream，或先收成中間結果
List<User> active = users.stream().filter(User::active).toList();
long count = active.size();

// ✅ parallel 要資料量夠大，而且 pipeline 裡沒有共享可變狀態；先測再加
long sum = values.parallelStream()
        .mapToLong(Long::longValue)
        .sum();
```

`parallel()` 會用到共同的 ForkJoinPool。list 很短、做的是 I/O，或 pipeline 裡有鎖／共享變數時，常常更慢，也更難除錯。

## 小結

**先寫對，再談效能。** Stream 拿來轉換跟聚合；有副作用就用迴圈；同一個 Stream 不要用兩次；要不要 parallel，先測過真的有比較快、而且資料量夠大再考慮。

寫完 pipeline 後問自己一句：「拿掉 `parallel()`，結果還對不對？加上去之後，測起來真的比較快嗎？」
