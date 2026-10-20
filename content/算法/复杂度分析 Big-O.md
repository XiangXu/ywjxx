---
title: "复杂度分析 Big-O"
aliases:
  - 复杂度分析
  - 时间复杂度
  - 空间复杂度
  - Big-O
  - Big O Notation
  - Time Complexity
  - Space Complexity
  - 均摊分析
  - Amortized Analysis
tags:
  - DSA
  - Algorithms
  - Interview-Prep
created: 2026-10-20
publish: true
---

# ⏱️ 复杂度分析 Big-O

> [!abstract] TL;DR
> Big-O 描述的是**输入变大时，运行时间或内存增长得有多快**，忽略常数和低阶项。分析时数循环、看递归；空间一般只算**额外空间**，不算输入和输出；动态数组的 `push` 是**均摊** O(1)，均摊不是“平均情况”。
> Big-O describes **how fast running time or memory grows as the input grows**, ignoring constants and lower-order terms. Count loops and recursion to find it; for space, usually count only **extra** space, not input or output. A dynamic array's `push` is **amortized** O(1), and amortized is not "average case".

## 1. 🎯 核心概念 Overview

### 1.1 Big-O 是什么 What Big-O means

`f(n) = O(g(n))` 意思是：n 足够大以后，`f(n)` 最多是 `g(n)` 的某个常数倍。它是**增长率的上界**，所以：
`f(n) = O(g(n))` means that for large enough n, `f(n)` is at most some constant times `g(n)`. It's an **upper bound on the growth rate**, so:

- **去掉常数 Drop constants:** `3n + 5` → O(n)；`n/2` → O(n)
- **只留最高阶 Keep the dominant term:** `n² + 100n + 7` → O(n²)
- **不同输入用不同变量 Different inputs get different variables:** 遍历两个数组是 O(n + m)，不是 O(n)

> [!note] O、Θ、Ω 的区别 O vs Θ vs Ω
> 严格说 O 是上界、Ω 是下界、Θ 是“上下界都是它”（紧确界）。面试和日常说的“这个算法是 O(n)”，通常指的是 Θ(n)，即紧确的界。
> Strictly, O is an upper bound, Ω a lower bound, and Θ both (a tight bound). When interviews say "this is O(n)", they usually mean the tight bound Θ(n).

### 1.2 常见复杂度 Common classes

| 复杂度 Class | 名字 Name | 例子 Example |
| --- | --- | --- |
| O(1) | 常数 constant | 数组按下标访问 array index, `HashMap.get`（平均 average） |
| O(log n) | 对数 logarithmic | 二分查找 binary search |
| O(n) | 线性 linear | 一次遍历 [[一次遍历 One Pass\|one pass]], [[双指针 Two Pointers\|two pointers]] |
| O(n log n) | 线性对数 linearithmic | 归并排序 merge sort, `Arrays.sort` |
| O(n²) | 平方 quadratic | 两层循环 nested loops, 冒泡排序 bubble sort |
| O(2ⁿ) | 指数 exponential | 枚举所有子集 all subsets |
| O(n!) | 阶乘 factorial | 枚举所有排列 all permutations |

## 2. 🧠 什么时候用 When to Use

- 写完每道题都要报 ⏱️ Time 和 🗄️ Space，面试官一定会问 → state both after every solution; interviewers always ask.
- **看约束反推目标复杂度 Read the constraints to guess the target complexity.** Java/C++ 大约每秒能跑 10⁸ 次简单操作（粗略估计），所以：
  Java/C++ do roughly 10⁸ simple operations per second (a rough rule of thumb), so:

| n 的范围 Size of n | 能接受的复杂度 Acceptable complexity |
| --- | --- |
| n ≤ 10 | O(n!) |
| n ≤ 20 | O(2ⁿ) |
| n ≤ 500 | O(n³) |
| n ≤ 5,000 | O(n²) |
| n ≤ 10⁵ | O(n log n)；O(n²) 在 10⁴ 左右就到边界了 O(n²) is borderline around 10⁴ |
| n ≤ 10⁶ | O(n log n) 或 O(n) |
| n ≈ 10⁸ | 最多 O(n) at best O(n) |
| n ≥ 10⁹ | O(log n) 或 O(1) |

例：[[Concatenation of Array|1929]] 的 `n ≤ 1000`，连 O(n²) 都能过；但输出就有 2n 个元素，O(n) 已经是下界。
E.g. 1929 has `n ≤ 1000`, so even O(n²) would pass; but the output alone has 2n elements, so O(n) is already the floor.

## 3. ⚙️ 原理 How It Works

### 3.1 怎么数时间 Counting time

1. **顺序执行相加 Sequential blocks add:** 先遍历一遍再遍历一遍 = O(n) + O(n) = O(n)
2. **嵌套循环相乘 Nested loops multiply:** 外层 n 次 × 内层 n 次 = O(n²)
3. **每次减半 Halving each step:** `while (n > 1) n /= 2;` 是 O(log n)
4. **看总工作量，不只是循环层数 Count total work, not loop depth:** 双指针看起来有两个指针，但两个指针各自最多走 n 步，总共 O(n)。[[Remove Element|27]] 的相向写法（另一种写法）里，`while` 每步都让 `left++` 或 `right--`，所以也是 O(n)。
   Two pointers may look like two loops, but each pointer moves at most n steps, O(n) in total. In 27's opposite-pointer alternative, every step of the `while` does `left++` or `right--`, so it's O(n).
5. **库函数也有成本 Library calls have costs:** `list.contains(x)` 是 O(n)，`list.add(0, x)` 是 O(n)，`str + str` 在循环里会变成 O(n²)
   `list.contains(x)` is O(n), `list.add(0, x)` is O(n), and string `+` inside a loop can become O(n²).

### 3.2 怎么数空间 Counting space

- **额外空间 Auxiliary space:** 算法自己新开的内存（变量、临时数组、哈希表、递归栈）。面试里说的“空间复杂度”通常指这个。
  Memory the algorithm allocates itself (variables, scratch arrays, hash maps, the recursion stack). This is what "space complexity" usually means in interviews.
- **输出一般不算 Output usually doesn't count:** [[Concatenation of Array|1929]] 必须返回 2n 长的数组，但通常说“O(1) 额外空间”。最好两种都说清楚。
  1929 must return a length-2n array, yet it's usually called O(1) extra space. Best to state both.
- **原地 In place:** 直接改输入数组，只用 O(1) 额外空间（[[Remove Element|27]]、[[Replace Elements with Greatest Element on Right Side|1299]]）。
  Modify the input directly with O(1) extra space.
- **递归栈也算 The recursion stack counts:** 递归深度 d 就是 O(d) 空间，即使没有 `new` 任何东西。
  Recursion depth d costs O(d) space even if you never call `new`.

### 3.3 均摊分析 Amortized analysis

有些操作**偶尔很贵、平时很便宜**。均摊分析算的是：**一整串操作的总成本 ÷ 操作次数**，在最坏的操作序列下也成立。
Some operations are **occasionally expensive but usually cheap**. Amortized analysis takes **the total cost of a whole sequence ÷ the number of operations**, and it holds for the worst-case sequence.

> [!example] 动态数组 push Dynamic array push（[[Design Dynamic Array|Design Dynamic Array]]）
> 容量从 1 开始翻倍，push n 次。扩容发生在 size = 1, 2, 4, …，复制总数 `1 + 2 + 4 + … < 2n`，再加上 n 次普通写入，总共 < 3n。
> 3n ÷ n = **均摊 O(1)**。单次最坏仍是 O(n)（刚好触发扩容的那次）。
> Start at capacity 1, double when full, push n times. Resizes happen at size 1, 2, 4, …, copying `1 + 2 + 4 + … < 2n` elements, plus n plain writes: under 3n total. 3n ÷ n = **amortized O(1)**. A single push is still O(n) worst case (the one that resizes).
>
> 如果每次只扩容固定格数，总复制量是 O(n²)，均摊变成 O(n)。**按比例增长**是关键。
> Grow by a fixed number of slots and total copying is O(n²), amortized O(n). **Growing by a factor** is what matters.

> [!warning] 均摊 ≠ 平均情况 Amortized ≠ average case
> - **平均情况 Average case:** 对**随机输入**取平均，依赖输入分布的假设。例：快速排序平均 O(n log n)，但特定输入下最坏 O(n²)；`HashMap.get` 平均 O(1)，前提是哈希分布均匀。
>   Averaged over **random inputs**; relies on an assumption about the input distribution. E.g. quicksort averages O(n log n) but is O(n²) on bad inputs; `HashMap.get` averages O(1) assuming a good hash spread.
> - **均摊 Amortized:** 对**一串操作**取平均，**不靠运气**：任何 n 次 push 的总成本都是 O(n)。
>   Averaged over **a sequence of operations**, **with no luck involved**: any n pushes cost O(n) total.

## 4. 💻 模板代码 Code Template

用代码对照着数 Count along with the code:

```java
// O(n) time, O(1) space：一层循环，常数个变量 one loop, constant variables
int max = 0;
for (int x : nums) max = Math.max(max, x);

// O(n²) time：嵌套循环 nested loops
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)   // 总共 n(n-1)/2 次 n(n-1)/2 iterations, still O(n²)
        check(nums[i], nums[j]);

// O(log n) time：每次范围减半 the range halves each step
int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;     // 防溢出 avoids int overflow of (lo + hi)
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
}
return -1;                            // 没找到 not found

// O(n) time 而不是 O(n²)：两个指针总共走 n 步 two pointers take n steps combined
int left = 0, right = n - 1;
while (left < right) { /* 每步 left++ 或 right-- each step moves one */ }
```

## 5. ⏱️ 复杂度 Complexity

本题库里各题的复杂度汇总 Summary for the problems so far:

| 题目 Problem | ⏱️ Time | 🗄️ Extra space | 要点 Key point |
| --- | --- | --- | --- |
| [[Max Consecutive Ones\|485]] | O(n) | O(1) | 一次遍历 one pass |
| [[Remove Element\|27]] | O(n) | O(1) | 原地，双指针 in place |
| [[Replace Elements with Greatest Element on Right Side\|1299]] | O(n) | O(1) | 原地，反向遍历 in place, reverse scan |
| [[Concatenation of Array\|1929]] | O(n) | O(1)（输出 O(n) output） | 输出不计入 output not counted |
| [[Design Dynamic Array\|Dynamic Array]] `pushback` | 均摊 O(1) amortized | — | 翻倍扩容 doubling |

## 6. ⚠️ 常见坑 Common Pitfalls

- **把 O(2n) 写成答案 Writing O(2n):** 常数要去掉，是 O(n) → drop the constant.
- **多个输入混成一个 n Merging inputs into one n:** 两个数组长度 n 和 m，是 O(n + m) 或 O(n·m)，不能都写成 n → use separate variables.
- **忽略库函数成本 Ignoring library costs:** 循环里的 `contains`、`indexOf`、`remove(0)`、`substring`、字符串拼接都可能是 O(n) → these can each be O(n) inside a loop.
- **以为“一层循环”就是 O(n) Assuming one loop means O(n):** 如果循环里指针可能回退，或者循环体本身是 O(n)，就不是 → not if pointers move back or the body is itself O(n).
- **以为“两层循环”就是 O(n²) Assuming two loops means O(n²):** 内层指针如果从不回退（滑动窗口），总共只走 n 步，是 O(n) → if the inner pointer never resets (sliding window), it's O(n) total.
- **忘了递归栈 Forgetting the recursion stack:** 递归 DFS 的空间是 O(深度) → recursive DFS costs O(depth) space.
- **把均摊说成平均 Calling amortized "average":** 见 3.3 → see 3.3.

## 7. ❓ 复习题 Review Questions

**Q1.** `n² + 1000n` 的 Big-O 是什么？n 很小时哪一项更大？ What's the Big-O of `n² + 1000n`, and which term dominates for small n?

> [!success]- Answer
> O(n²)。n < 1000 时 `1000n` 那项更大，但 Big-O 只关心 n 足够大时的增长，所以只留 n²。这也说明 Big-O 小的算法在小输入上不一定更快。
> O(n²). For n < 1000 the `1000n` term is bigger, but Big-O only cares about growth for large n. It also shows that a better Big-O isn't always faster on small inputs.

**Q2.** 为什么说 1929 是 O(1) 额外空间，而不是 O(n)？ Why is 1929 called O(1) extra space instead of O(n)?

> [!success]- Answer
> 题目要求返回的输出数组按惯例不算额外空间；除了输出，只用了一个循环变量。算上输出就是 O(n)。面试时最好两种都说。
> By convention the required output isn't counted; besides it, there's only a loop variable. Counting the output, it's O(n). Say both in an interview.

**Q3.** 动态数组 push 的“均摊 O(1)”和 `HashMap.get` 的“平均 O(1)”有什么区别？ How does a dynamic array's amortized O(1) push differ from `HashMap.get`'s average O(1)?

> [!success]- Answer
> 均摊是对**一串操作**的保证：任何 n 次 push 总共 O(n)，没有坏运气。平均是对**输入分布**的期望：如果很多 key 哈希冲突，`get` 就会变慢（Java 8+ 的 `HashMap` 在桶长度 ≥ 8 且表容量 ≥ 64 时把桶转成红黑树；key 可比较时最坏 O(log n)，否则仍可能退化到 O(n)）。
> Amortized is a guarantee over **a sequence of operations**: any n pushes cost O(n) total, no bad luck possible. Average is an expectation over **the input distribution**: if many keys collide, `get` slows down (Java 8+ `HashMap` turns a bucket into a red-black tree once it holds ≥ 8 entries and the table has ≥ 64 buckets; with `Comparable` keys that caps the worst case at O(log n), otherwise it can still degrade to O(n)).

**Q4.** 双指针里有一个 `while` 循环，循环里有时动 `left` 有时动 `right`，为什么是 O(n) 不是 O(n²)？ Why are two pointers O(n), not O(n²)?

> [!success]- Answer
> 每一轮都让 `left` 增加或 `right` 减少，而 `right - left` 从 n - 1 开始、每轮至少减 1、减到 0 就停，所以最多 n 轮。看的是总步数，不是“有几个指针”。
> Each iteration increases `left` or decreases `right`. `right - left` starts at n - 1 and drops by at least 1 per iteration until it hits 0, so there are at most n iterations. Count total steps, not pointers.

**Q5.** `n = 10⁵`，O(n²) 的解法大概能不能过？ With `n = 10⁵`, will an O(n²) solution pass?

> [!success]- Answer
> 一般不能。10⁵ 的平方是 10¹⁰ 次操作，按每秒约 10⁸ 次算要上百秒，远超常见的 1～2 秒限制。应该找 O(n log n) 或 O(n) 的解法。
> Usually not. 10¹⁰ operations at roughly 10⁸ per second is about 100 seconds, far over the usual 1–2 second limit. Look for O(n log n) or O(n).

## 8. 🧩 经典题 Practice Problems

- 本题库全部题目都可以用来练习报复杂度，见第 5 节表格 → every problem so far; see the table in section 5.
- [[Design Dynamic Array|Design Dynamic Array]]: 均摊分析的标准例子 the textbook amortized example
- 704. Binary Search: O(log n) 的标准例子 the textbook O(log n) example

## 9. 🔗 相关 Related

- [[📌 算法总览]]
- [[一次遍历 One Pass|一次遍历]] · [[双指针 Two Pointers|双指针]]
- 数据结构 Data structure: [[数组 Array|数组]]
