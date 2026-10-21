---
title: "Design Dynamic Array (Resizable Array)"
aliases:
  - 动态数组
  - 可变长数组
  - Dynamic Array
  - Resizable Array
  - 设计动态数组
tags:
  - LeetCode
  - Interview-Prep
  - Array
  - Design
difficulty: Easy
pattern: "Design / Array (Doubling)"
link: https://neetcode.io/problems/dynamicArray
status: 🟡 review
created: 2026-10-20
publish: true
last-reviewed: 2026-10-20
---

# 🧩 Design Dynamic Array (Resizable Array)

> [!abstract] TL;DR
> 用一个定长 `int[]` 加两个计数器：`length`（元素个数）和 `capacity`（数组大小）。满了就新建两倍大的数组并把旧元素复制过去。`pushback` 的均摊时间是 O(1)。
> Keep a fixed-size `int[]` plus two counters: `length` (number of elements) and `capacity` (array size). When it's full, allocate an array twice as big and copy the old elements over. `pushback` runs in amortized O(1).

## 1. 📋 题目 Problem

实现一个动态数组（可变长数组），类似 Java 的 `ArrayList` 或 C++ 的 `vector`。
Design a dynamic (resizable) array, like Java's `ArrayList` or C++'s `vector`.

| 方法 Method | 作用 Behavior |
| --- | --- |
| `DynamicArray(int capacity)` | 初始化空数组，容量为 `capacity`（`> 0`） Empty array with the given capacity |
| `int get(int i)` | 返回下标 `i` 的元素（保证合法） Return element at `i` (always valid) |
| `void set(int i, int n)` | 把下标 `i` 设为 `n` Set element at `i` to `n` |
| `void pushback(int n)` | 追加到末尾；满了先 `resize()` Append; if full, `resize()` first |
| `int popback()` | 删除并返回末尾元素（保证非空） Remove and return the last element (never empty) |
| `void resize()` | 容量翻倍 Double the capacity |
| `int getSize()` | 元素个数 Number of elements |
| `int getCapacity()` | 当前容量 Current capacity |

> [!example] 示例 Example 3
> `capacity = 1`: `getSize` → 0, `getCapacity` → 1, `pushback(1)`, `getSize` → 1, `getCapacity` → 1, `pushback(2)` (满了，扩容 full, resize), `getSize` → 2, `getCapacity` → 2, `get(1)` → 2, `set(1, 3)`, `get(1)` → 3, `popback` → 3, `getSize` → 1, `getCapacity` → 2
>
> 注意最后 `popback` 之后容量还是 2：**pop 不缩容**。 Capacity stays 2 after the pop: **popping doesn't shrink**.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** **size ≠ capacity**。`capacity` 是底层数组有多少格，`length` 是用了多少格。下标 `length` 正好是下一个空位，所以 `pushback` 写 `arr[length++]`，`popback` 读 `arr[--length]`。
  **Size isn't capacity.** `capacity` is how many slots the backing array has; `length` is how many are in use. Index `length` is always the next free slot, so `pushback` writes `arr[length++]` and `popback` reads `arr[--length]`.
- **套路 Pattern:** 设计题 / 倍增扩容 (design, geometric growth)。Java 数组长度不能改，所以“扩容”其实是**新建更大的数组 + 复制**。
  Java arrays can't change length, so "resizing" really means **allocate a bigger array + copy**.

```
capacity = 4, length = 3
┌───┬───┬───┬───┐
│ 5 │ 8 │ 2 │   │
└───┴───┴───┴───┘
  0   1   2   3
              ↑ length：下一个写入位置 next write goes here
```

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 每次 `pushback` 都只扩容 1 格（或固定加 `k` 格）。
  Grow by just 1 slot (or a fixed `k`) on every full `pushback`.
- ⏱️ 推 `n` 个元素总共要复制 `1 + 2 + … + n ≈ n²/2` 次，即每次 `pushback` 均摊 **O(n)**。固定加 `k` 也只是除以常数 `k`，仍是 O(n²) 总量。
  Pushing `n` elements copies `1 + 2 + … + n ≈ n²/2` elements in total: **O(n)** amortized per push. Growing by a constant `k` only divides that by `k`; the total is still O(n²).

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class DynamicArray {

    private int capacity;
    private int length;
    private int[] arr;

    public DynamicArray(int capacity) {
        this.capacity = capacity;
        this.length = 0;
        arr = new int[capacity];
    }

    public int get(int i) {
        return arr[i];
    }

    public void set(int i, int n) {
        arr[i] = n;
    }

    public void pushback(int n) {
        if (length == capacity) {   // 满了先扩容 full: grow first
            resize();
        }
        arr[length] = n;            // length 就是下一个空位 next free slot
        length++;
    }

    public int popback() {
        if (length > 0) {
            length--;               // 只移动计数器，不用清空 just move the counter
        }
        return arr[length];
    }

    private void resize() {
        capacity *= 2;
        int[] newArr = new int[capacity];
        for (int i = 0; i < length; i++) {   // 只复制用到的部分 copy only used slots
            newArr[i] = arr[i];
        }
        arr = newArr;
    }

    public int getSize() {
        return length;
    }

    public int getCapacity() {
        return capacity;
    }
}
```

| 操作 Operation | ⏱️ Time |
| --- | --- |
| `get` / `set` / `popback` / `getSize` / `getCapacity` | O(1) |
| `pushback` | 均摊 O(1) amortized; 触发扩容的那一次 O(n) worst case for the one that resizes |
| `resize` | O(n) |

- 🗄️ Space: O(capacity)。翻倍扩容下，capacity 不超过 `max(初始容量, 2 × 最大 size)`，即 O(max(初始容量, n))。
  O(capacity). With doubling, capacity never exceeds `max(initial capacity, 2 × peak size)`, i.e. O(max(initial capacity, n)).

> [!important] 为什么翻倍是均摊 O(1)？ Why is doubling amortized O(1)?
> 从容量 1 开始推 `n` 个元素，扩容发生在 size = 1, 2, 4, … 且该 size < n 时，复制总数是 `1 + 2 + 4 + … + 2^k` < `2n`。
> 把 `< 2n` 次复制摊到 `n` 次 push 上，每次 push 平均不到 2 次复制，即 **O(1) 均摊**。
> Starting at capacity 1 and pushing `n` elements, resizes happen when size = 1, 2, 4, … (each below n), and the copies add up to `1 + 2 + 4 + … + 2^k < 2n`. Spread over `n` pushes, that's fewer than 2 copies per push: **amortized O(1)**.
>
> 关键是**按比例**增长（×2、×1.5 都行），而不是**加常数**。 What matters is growing **by a factor** (×2 or ×1.5 both work), not **by a constant**.

> [!example] 走一遍 Trace: `capacity = 1`, push 1, 2, 3
>
> | 操作 Op | 扩容? Resize? | arr | length | capacity |
> | --- | --- | --- | --- | --- |
> | init | | `[_]` | 0 | 1 |
> | `pushback(1)` | | `[1]` | 1 | 1 |
> | `pushback(2)` | ✅ 1 → 2, 复制 1 个 copy 1 | `[1,2]` | 2 | 2 |
> | `pushback(3)` | ✅ 2 → 4, 复制 2 个 copy 2 | `[1,2,3,_]` | 3 | 4 |
> | `popback()` → 3 | | `[1,2,3,_]` | 2 | 4 |
>
> pop 之后 `arr[2]` 里还留着 3，但 `length = 2`，这一格已被视为空，下次 push 会覆盖它。
> After the pop, `arr[2]` still holds 3, but with `length = 2` that slot counts as empty and the next push overwrites it.

> [!note] 其他写法 Alternatives
> **用 JDK 复制 Use the JDK copy:** `resize()` 可以写成一行，效果相同，常数更小。 One line, same effect, smaller constant:
> ```java
> private void resize() {
>     capacity *= 2;
>     arr = java.util.Arrays.copyOf(arr, capacity);  // 新数组，多出的格子补 0 pads with 0
> }
> ```
> **更紧凑的 push/pop Compact push/pop:**
> ```java
> public void pushback(int n) {
>     if (length == capacity) resize();
>     arr[length++] = n;
> }
>
> public int popback() {
>     return arr[--length];   // 题目保证非空 guaranteed non-empty
> }
> ```

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] **先扩容再写** Resize *before* writing: `length == capacity` 时直接写 `arr[length]` 会 `ArrayIndexOutOfBoundsException` → writing first throws.
- [x] **只复制 `length` 个，不是 `capacity` 个** Copy `length` elements: 这题里扩容只在满时发生，两者相等；但一般来说用 `length` 更准确也更省（后面的格子本来就没用；复制 `capacity` 个也不会出错，只是白做功） → they're equal here because resize only happens when full; in general `length` is tighter and skips pointless copying (copying `capacity` would still be correct, just wasted work).
- [x] **pop 不缩容** Popping doesn't shrink capacity (Example 3 的最后输出 `2`).
- [x] **popback 先减再读** Decrement, then read: 最后一个元素在 `length - 1`，不是 `length` → the last element is at `length - 1`.
- [x] **`popback` 里的 `if (length > 0)`** The guard: 题目保证非空，所以它不会生效。但如果真的空了，它会悄悄返回 `arr[0]` 的旧值，反而掩盖了 bug。真实代码里应该抛异常（`ArrayList.remove` 会抛 `IndexOutOfBoundsException`）→ the problem guarantees non-empty, so it never triggers. If it did, it would silently return a stale `arr[0]` and hide the bug; real code should throw instead.
- [x] **`resize()` 的可见性** Visibility of `resize()`: 题目把 `void resize()` 列为类的方法之一，我写成了 `private`；按题目签名写成 `public` 更稳妥 → the spec lists `resize()` as one of the class's methods, so `public` matches the signature.
- [x] **get/set 不检查 `i < length`** No bounds check against `length`: 题目保证合法。注意 `i` 在 `[length, capacity)` 时 Java 不会报错，会读到旧值；`ArrayList.get` 会检查 `i < size` → guaranteed valid here; note that Java won't complain for `i` in `[length, capacity)`, while `ArrayList.get` checks against `size`.

## 6. 🔁 进阶 Follow-ups

> [!tip] 和 Java `ArrayList` 对比 Compared with Java's `ArrayList`
>
> | | 本题 This problem | `java.util.ArrayList` |
> | --- | --- | --- |
> | 增长因子 Growth factor | ×2 | ×1.5（`old + (old >> 1)`） |
> | 默认容量 Default capacity | 构造时给定 given | 10（无参构造），第一次 `add` 时才分配 10 (no-arg constructor), allocated lazily on the first `add` |
> | 元素类型 Element type | `int`（基本类型） | `Object[]`，泛型 + 自动装箱 generics + boxing |
> | 删除后清空 Clears on remove | 不需要 not needed | 把空位设为 `null`，让 GC 回收对象 sets the slot to `null` so the object can be GC'd |
> | 缩容 Shrinks | 否 No | 不会自动缩，可手动 `trimToSize()` never automatically; call `trimToSize()` |
>
> C++ `std::vector` 的增长因子由实现决定：libstdc++ (GCC) 和 libc++ (Clang 自带的库) 是 ×2，MSVC STL 是 ×1.5。增长因子取决于标准库而不是编译器；C++ 标准只要求 `push_back` 均摊 O(1)，不规定具体因子。
> C++ `std::vector`'s factor is implementation-defined: ×2 in libstdc++ (GCC) and libc++ (Clang's own library), ×1.5 in the MSVC STL. It depends on the standard library, not the compiler; the C++ standard only requires amortized O(1) `push_back`, not a specific factor.

> [!warning] 如果要支持缩容 If you add shrinking
> 不要在“半满”时缩容一半：在临界点上交替 push/pop 会让每次操作都触发 O(n) 的复制（抖动 thrashing）。
> 常见做法是 **size 降到 capacity 的 1/4 时，容量减半**，这样扩容和缩容之间总有足够的“缓冲”，均摊仍是 O(1)。
> Don't halve at half-full: alternating push/pop at the boundary would trigger an O(n) copy every time (thrashing). The standard rule is **halve when size drops to 1/4 of capacity**, which keeps enough slack between grows and shrinks to stay amortized O(1).

- **在中间插入/删除** Insert/remove in the middle: 需要把后面的元素整体平移，O(n)。这就是 `ArrayList.add(i, x)` 慢、链表擅长的场景。
  Shifts every later element: O(n). That's why `ArrayList.add(i, x)` is slow and where linked lists shine.
- **为什么有人选 ×1.5 而不是 ×2？** Why ×1.5? 浪费的空闲空间更少；而且因子小于黄金比例 (~1.618) 时，之前释放的旧内存块加起来最终能容纳新数组，分配器有机会复用它们（理论上的启发式，实际取决于分配器）。
  Less idle space; and with a factor below the golden ratio (~1.618), earlier freed blocks can eventually add up to fit a new array, so the allocator can reuse them (a theoretical heuristic; it depends on the allocator).

## 7. ❓ 复习题 Review Questions

**Q1.** size 和 capacity 有什么区别？什么时候它们相等？ What's the difference between size and capacity, and when are they equal?

> [!success]- Answer
> capacity 是底层数组的长度（能放多少），size 是实际存了多少。数组刚好满时两者相等，这时下一次 `pushback` 会触发扩容。
> Capacity is the backing array's length (how much fits); size is how much is actually stored. They're equal exactly when the array is full, and the next `pushback` will resize.

**Q2.** `pushback` 最坏 O(n)，为什么说它是 O(1)？ `pushback` can be O(n), so why call it O(1)?

> [!success]- Answer
> 说的是**均摊** O(1)。翻倍扩容下，推 `n` 个元素的复制总数 `1 + 2 + 4 + …` 小于 `2n`，平均到每次 push 是常数。单次 push 最坏仍是 O(n)（刚好触发扩容的那次）。
> It's **amortized** O(1). With doubling, the total copies for `n` pushes, `1 + 2 + 4 + …`, stay under `2n`, a constant per push on average. A single push is still O(n) in the worst case (the one that triggers the resize).

**Q3.** 如果每次扩容只加 10 格，推 `n` 个元素的总时间是多少？ If each resize adds just 10 slots, what's the total time for `n` pushes?

> [!success]- Answer
> O(n²)。大约每 10 次 push 复制一次，第 k 次复制约 `10k` 个元素，总共约 `n²/20`。常数小了，但仍是平方级。
> O(n²). There's a copy about every 10 pushes, and the k-th copies about `10k` elements, about `n²/20` in total. A smaller constant, but still quadratic.

**Q4.** `popback` 之后为什么不用把 `arr[length]` 清零？`ArrayList` 为什么要设为 `null`？ Why not zero out the slot after `popback`, and why does `ArrayList` set it to `null`?

> [!success]- Answer
> `length` 之后的格子在逻辑上已经不存在，下次 push 会覆盖，`int` 留着没有坏处。`ArrayList` 存的是对象引用，如果不设为 `null`，数组还引用着那个对象，GC 就回收不了它，造成内存泄漏（loitering）。
> Slots past `length` are logically gone and the next push overwrites them, so a leftover `int` is harmless. `ArrayList` holds object references: if the slot isn't nulled, the array still references the object and the GC can't reclaim it (a memory leak known as loitering).

**Q5.** 要支持缩容，什么时候缩？ When should a shrinking dynamic array shrink?

> [!success]- Answer
> size 降到 capacity 的 1/4 时容量减半。如果在 1/2 时就减半，在边界上交替 push/pop 会每次都复制，退化成 O(n)。
> Halve the capacity when size drops to 1/4. Halving at 1/2 means alternating push/pop at the boundary copies every time, degrading to O(n) per operation.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[数组 Array|数组 Array]] · [[复杂度分析 Big-O|均摊分析 Amortized analysis]]
- 上一题 Previous: [[Concatenation of Array|1929. Concatenation of Array]]（也是“新建更大的数组 + 复制” also "allocate bigger + copy"）
- 下一题 Next: [[Baseball Game|682. Baseball Game]]（用数组当栈 an array used as a stack）
- 705 / 706. Design HashSet / HashMap: 另一个设计题。常见解法是固定桶数 + 链表；真实的哈希表（如 Java `HashMap`）超过负载因子时才倍增 rehash Another design problem. Typical solutions use a fixed number of buckets with chaining; real hash tables like Java's `HashMap` double and rehash once they pass the load factor
- 707. Design Linked List: 动态数组的对照：中间插入 O(1)（已有节点时），随机访问 O(n) The counterpart: O(1) insert at a known node, O(n) random access

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-20 |  | ✅ | 翻倍扩容 + 复制一次写对；`resize()` 写成了 private，按签名应为 public Doubling + copy right first time; made `resize()` private, signature says public |
