---
title: "数组 Array"
aliases:
  - 数组
  - Array
  - Static Array
  - 静态数组
  - Contiguous Memory
tags:
  - DSA
  - Data-Structures
  - Array
  - Interview-Prep
created: 2026-10-20
publish: true
---

# 📏 数组 Array

> [!abstract] TL;DR
> 数组是一块**连续内存**，存放**同类型**元素。因为地址可以直接算出来，按下标读写是 O(1)；但中间插入/删除要整体平移，是 O(n)。Java 的 `int[]` 长度固定，`ArrayList` 是在它上面做的“满了就扩容”的动态数组。
> An array is one **contiguous block of memory** holding elements of the **same type**. Because an element's address can be computed directly, indexed read/write is O(1); inserting or deleting in the middle shifts everything after it, which is O(n). Java's `int[]` has a fixed length; `ArrayList` is a dynamic array built on top of one that grows when full.

## 1. 🎯 核心概念 Overview

### 1.1 连续内存与 O(1) 访问 Contiguous memory and O(1) access

```
int[] a = {5, 8, 2, 7};    // 每个 int 4 字节 4 bytes per int

地址 address:  1000   1004   1008   1012
             ┌──────┬──────┬──────┬──────┐
             │  5   │  8   │  2   │  7   │
             └──────┴──────┴──────┴──────┘
下标 index:     0      1      2      3
```

第 `i` 个元素的地址 = **起始地址 + i × 元素大小**。`a[2]` 就是 `1000 + 2 × 4 = 1008`，一次乘法加法就能定位，不管数组多长。这就是“随机访问 random access”是 O(1) 的原因，也是下标从 **0** 开始的原因（下标就是偏移量 offset）。
The address of element `i` is **base + i × element size**. `a[2]` is at `1000 + 2 × 4 = 1008`: one multiply and one add, however long the array is. That's why random access is O(1), and why indices start at **0** (the index *is* the offset).

> [!tip] 连续内存的隐藏好处：缓存友好 The hidden perk: cache-friendly
> CPU 读内存时一次加载一整条 cache line（通常 64 字节），所以读 `a[0]` 时 `a[1..15]` 往往也一起进了缓存。顺序遍历数组因此比遍历链表快得多，即使两者都是 O(n)。详见 [[Computer Architecture]] 里的内存层级。
> The CPU loads memory a whole cache line at a time (usually 64 bytes), so reading `a[0]` often brings `a[1..15]` into cache too. Scanning an array is therefore much faster than walking a linked list, even though both are O(n). See the memory hierarchy in [[Computer Architecture]].

### 1.2 静态数组 vs 动态数组 Static vs dynamic arrays

| | 静态数组 Static array | 动态数组 Dynamic array |
| --- | --- | --- |
| Java | `int[]`, `String[]` | `ArrayList<E>` |
| C++ | `int a[10]`, `std::array` | `std::vector` |
| Python | （没有内置 none built in） | `list` |
| 长度 Length | 创建时固定 fixed at creation | 可增长 grows as needed |
| 末尾追加 Append | 没有空位就不行 only if there's room | 均摊 O(1) amortized |
| 实现 How | 一块连续内存 one block | 静态数组 + size/capacity，满了翻倍复制 a static array + size/capacity, doubled and copied when full |

动态数组的扩容细节、为什么翻倍是均摊 O(1)，见 [[Design Dynamic Array|Design Dynamic Array]] 和 [[复杂度分析 Big-O|复杂度分析 Big-O]]。
For how dynamic arrays grow and why doubling is amortized O(1), see [[Design Dynamic Array|Design Dynamic Array]] and [[复杂度分析 Big-O|Big-O analysis]].

## 2. 🧠 什么时候用 When to Use

- ✅ 需要按下标快速读写 Fast access by index
- ✅ 主要在**末尾**增删 Adding/removing mostly at the **end** ([[栈 Stack|栈 stack]] 就常用数组实现 stacks are usually array-backed)
- ✅ 需要顺序遍历、对缓存友好 Sequential scans, cache-friendly
- ✅ 数据有序时可以二分查找 O(log n) Binary search once sorted
- ❌ 频繁在**头部或中间**插入/删除，考虑链表或双端队列（`ArrayDeque`） → Frequent inserts/deletes at the **front or middle**: consider a linked list or deque (`ArrayDeque`)
- ❌ 按值查找很频繁，考虑哈希表 → Frequent lookups by value: consider a hash map

- 🔎 题目信号 Signals: “原地”、“O(1) 额外空间”、“返回新长度”，通常意味着要用 [[双指针 Two Pointers|双指针 Two Pointers]] 在数组内部覆盖写入。
  "In place", "O(1) extra space" and "return the new length" usually mean [[双指针 Two Pointers|two pointers]] overwriting inside the array.
  "In place", "O(1) extra space" or "return the new length" usually means overwriting within the array using [[双指针 Two Pointers|two pointers]].

## 3. ⚙️ 原理 How It Works

### 3.1 中间插入：从后往前挪 Inserting in the middle: shift from the back

在下标 `k` 插入 `x`，要先把 `[k, size)` 整体右移一格。**必须从后往前挪**，否则前面的值会把后面的覆盖掉。
To insert `x` at index `k`, shift `[k, size)` right by one first. **Shift from the back**, or each write overwrites the value you haven't moved yet.

```
插入 9 到 k = 1  insert 9 at k = 1      size = 4, capacity ≥ 5

[5, 8, 2, 7, _]
[5, 8, 2, 7, 7]   a[4] = a[3]
[5, 8, 2, 2, 7]   a[3] = a[2]
[5, 8, 8, 2, 7]   a[2] = a[1]
[5, 9, 8, 2, 7]   a[1] = 9
```

### 3.2 中间删除：从前往后挪 Deleting in the middle: shift from the front

删除下标 `k`，把 `(k, size)` 整体左移一格，这次**从前往后**挪。
To delete index `k`, shift `(k, size)` left by one, this time **front to back**.

## 4. 💻 模板代码 Code Template

```java
// 在下标 k 插入 x（假设还有空位） Insert x at index k (assumes there's room)
void insert(int[] a, int size, int k, int x) {
    for (int i = size; i > k; i--) {  // 从后往前 back to front
        a[i] = a[i - 1];
    }
    a[k] = x;
    // 调用方负责 size++ caller does size++
}

// 删除下标 k Delete index k
void delete(int[] a, int size, int k) {
    for (int i = k; i < size - 1; i++) {  // 从前往后 front to back
        a[i] = a[i + 1];
    }
    // 调用方负责 size-- caller does size--
}
```

> [!note] Java 数组常用工具 Handy Java array tools
> | 写法 Code | 作用 What it does |
> | --- | --- |
> | `new int[n]` | 长度 `n`，全部为默认值：数字 0、`boolean` 为 `false`、对象为 `null` Length `n`, all defaults: 0, `false`, or `null` |
> | `a.length` | 长度，是字段不是方法（`list.size()` 才是方法） A field, not a method (`list.size()` is the method) |
> | `Arrays.copyOf(a, newLen)` | 复制并改变长度，多出的补 0 Copies with a new length, padding with 0 |
> | `System.arraycopy(src, sp, dst, dp, len)` | 批量复制，源和目标重叠时也正确 bulk copy, correct even when ranges overlap |
> | `Arrays.fill(a, v)` | 全部设为 `v` set every slot to `v` |
> | `Arrays.sort(a)` | 排序，`int[]` 用双轴快排 sorts; dual-pivot quicksort for `int[]` |
> | `Arrays.toString(a)` | 调试打印 print for debugging (`System.out.println(a)` 只会打印地址样的哈希 prints a hash-like id) |

## 5. ⏱️ 复杂度 Complexity

| 操作 Operation | 静态数组 Static | 动态数组 Dynamic (`ArrayList`) |
| --- | --- | --- |
| 按下标读/写 Get/set by index | O(1) | O(1) |
| 末尾追加 Append | O(1)（有空位时 if there's room） | 均摊 O(1)，扩容的那一次是 O(n) Amortized O(1); O(n) for the push that resizes |
| 删除末尾 Remove last | O(1) | O(1) |
| 头部/中间插入 Insert at front/middle | O(n) | O(n) |
| 头部/中间删除 Delete at front/middle | O(n) | O(n) |
| 按值查找（无序） Search by value (unsorted) | O(n) | O(n) |
| 按值查找（有序） Search by value (sorted) | O(log n) 二分 binary search | O(log n) |

🗄️ Space: O(n)。动态数组最多浪费约一半（翻倍时）的空位。 O(n); a doubling dynamic array wastes up to about half its slots.

## 6. ⚠️ 常见坑 Common Pitfalls

- **差一错误 Off-by-one:** 最后一个元素是 `a[a.length - 1]`；循环用 `i < n` 而不是 `i <= n` → the last element is `a[a.length - 1]`; loop with `i < n`.
- **size ≠ capacity:** 动态数组里 `[size, capacity)` 的格子是垃圾数据，不能读 → in a dynamic array, slots in `[size, capacity)` are garbage.
- **平移方向 Shift direction:** 插入从后往前，删除从前往后（3.1、3.2） → insert back-to-front, delete front-to-back.
- **原地覆盖前先保存 Save before overwriting:** 如 [[Replace Elements with Greatest Element on Right Side|1299]] 要先存 `temp` 再写 `arr[i]` → e.g. 1299 saves `temp` before writing `arr[i]`.
- **遍历时删除 Removing while iterating:** 在 `for-each` 里调用 `list.remove(...)` 通常会抛 `ConcurrentModificationException`；用快慢指针原地过滤，或用 `Iterator.remove()` / `removeIf` → use read/write pointers, `Iterator.remove()` or `removeIf`.
- **`int[]` 不能直接放进 `List`:** `Arrays.asList(intArray)` 得到的是 `List<int[]>`，只有一个元素 → gives a `List<int[]>` with one element; use `Arrays.stream(a).boxed().toList()` (Java 16+，结果不可修改 unmodifiable; 旧版本 older: `.collect(Collectors.toList())`).

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么数组按下标访问是 O(1)，而链表是 O(n)？ Why is indexed access O(1) for arrays but O(n) for linked lists?

> [!success]- 答案 Answer
> 数组连续存放，`a[i]` 的地址 = 起始地址 + i × 元素大小，一步算出。链表节点散落在内存各处，只能从头顺着 `next` 走 `i` 步。
> Arrays are contiguous, so `a[i]`'s address is base + i × size, computed in one step. Linked-list nodes are scattered, so you must follow `next` `i` times from the head.

**Q2.** 在数组头部插入为什么是 O(n)？ Why is inserting at the front O(n)?

> [!success]- 答案 Answer
> 所有现有元素都要右移一格腾出位置，共 n 次移动。若经常需要头部操作，用 `ArrayDeque`（环形数组，头尾都是均摊 O(1)）。
> Every existing element shifts right by one to make room: n moves. For frequent front operations, use `ArrayDeque` (a circular array with amortized O(1) at both ends).

**Q3.** 中间插入时为什么要从后往前挪？ Why shift from the back when inserting?

> [!success]- 答案 Answer
> 从前往后的话，`a[k+1] = a[k]` 会先覆盖掉原来的 `a[k+1]`，后面复制的全是同一个值。从后往前，每个位置被覆盖前都已经被复制走了。
> Front-to-back, `a[k+1] = a[k]` overwrites the old `a[k+1]` before it's moved, so every later slot gets the same value. Back-to-front, each slot is copied out before it's overwritten.

**Q4.** 遍历数组和遍历链表都是 O(n)，为什么实际中数组快很多？ Both scans are O(n); why is the array much faster in practice?

> [!success]- 答案 Answer
> 缓存局部性。数组连续，CPU 一次加载一条 cache line 就拿到多个元素，硬件还能预取；链表每个节点可能都是一次缓存未命中。Big-O 忽略了这种常数差异。
> Cache locality. Contiguous elements arrive several per cache line and the hardware prefetches ahead; each linked-list node can be a cache miss. Big-O hides this constant-factor difference.

## 8. 🧩 经典题 Practice Problems

| 题目 Problem | 练的是什么 What it practices |
| --- | --- |
| [[Design Dynamic Array\|Design Dynamic Array]] | size vs capacity，翻倍扩容 doubling growth |
| [[Concatenation of Array\|1929. Concatenation of Array]] | 下标映射，`i % n` Index mapping with `i % n` |
| [[Max Consecutive Ones\|485. Max Consecutive Ones]] | 一次遍历 + 计数器 one pass with a counter |
| [[Replace Elements with Greatest Element on Right Side\|1299. Replace Elements with Greatest Element on Right Side]] | 从右往左，原地覆盖 right-to-left, overwrite in place |
| [[Remove Element\|27. Remove Element]] | 快慢指针原地删除 read/write pointers |

## 9. 🔗 相关 Related

- [[📌 数据结构总览]]
- 数据结构 Data structures: [[栈 Stack|栈 Stack]]（用数组实现 array-backed） · [[链表 Linked List|链表 Linked List]]（连续 vs 分散，对比见第 1、4 题 contiguous vs scattered, see Q1 and Q4）
- 算法 Algorithms: [[双指针 Two Pointers|双指针 Two Pointers]] · [[一次遍历 One Pass|一次遍历 One Pass]] · [[复杂度分析 Big-O|复杂度分析 Big-O]]
- 硬件背景 Hardware background: [[Computer Architecture]]
