---
title: 'Java Optional：什麼時候該用，什麼時候別亂包'
description: 'Optional 該用在回傳值上；當成欄位、參數，或亂用 of，反而更容易踩坑。'
pubDate: 2026-10-23
tags: ['Java', 'Optional']
draft: false
---

`Optional` 從 Java 8 進來之後，很多人想靠它一次解決 null 問題。結果常常是：到處包一層、序列化變麻煩、NPE 換成 `NoSuchElementException`——問題還是在。

Optional 本來是用在**回傳值**，提醒呼叫端「可能沒有」。它不是拿來當欄位型別，也不是參數型別。

## 正確：回傳值用 Optional

查詢可能找不到資料時，回傳 `Optional<T>`，再用 `map` / `flatMap` / `orElse` / `orElseThrow` 處理：

```java
public Optional<User> findById(long id) {
    return Optional.ofNullable(userRepository.find(id));
}

public String displayName(long id) {
    return findById(id)
            .map(User::name)
            .orElse("未知使用者");
}

public User requireUser(long id) {
    return findById(id)
            .orElseThrow(() -> new NotFoundException("user " + id));
}
```

呼叫端一看就知道「可能沒有」，也比较不容易忘記處理「找不到」的情況。

## 陷阱：當欄位、當參數、亂用 `of`

```java
// ❌ 不要把 Optional 當欄位或參數
public class Order {
    private Optional<String> couponCode; // 序列化、JPA、equals 都會變彆扭
}

public void applyCoupon(Optional<String> code) { // 呼叫端還是可能傳 null
    // ...
}

// ❌ value 可能是 null 時不要用 of
Optional.of(maybeNull); // NPE
```

實務上比較常見的寫法：

- **欄位／參數**：就讓它可為 null，或用空字串、空 list、`@Nullable` 標清楚。
- **值可能是 null**：用 `Optional.ofNullable(value)`，或先判斷再 `Optional.of`。
- **「沒有」就是空集合**：回傳 `List` / `Set` 時，寧願回傳空集合，也不要回傳 `Optional<List<T>>`。

```java
// ✅ 參數保持單純；沒有優惠券就傳 null，或另外做 overload
public void applyCoupon(@Nullable String code) {
    if (code == null || code.isBlank()) {
        return;
    }
    // ...
}
```

## 小結

**API 邊界**用 Optional 表示「可能沒有」；物件裡面的欄位、方法參數，就讓 null／空 list 自己講清楚就好。每次想包 `Optional` 時，先問一句：「這是回傳值的『有或沒有』，還是只是想躲 null？」

只有前者值得包一層。
