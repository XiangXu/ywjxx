---
title: "20. 有效的括号 Valid Parentheses"
aliases:
  - 有效的括号
  - LeetCode 20
  - Valid Parentheses
  - 括号匹配
tags:
  - LeetCode
  - Interview-Prep
  - Stack
  - String
difficulty: Easy
pattern: "Stack / Bracket Matching"
link: https://leetcode.com/problems/valid-parentheses/
status: 🟡 review
created: 2026-10-21
publish: true
last-reviewed: 2026-10-21
---

# 🧷 20. Valid Parentheses

> [!abstract] TL;DR
> 遇到左括号就把**对应的右括号**压栈；遇到右括号就弹栈，弹出的必须正好等于它。栈空了还来右括号、或者最后栈不空，都是无效。
> On an opening bracket, push the **matching closing bracket**; on a closing bracket, pop, and the popped bracket must equal the current character. A closer with an empty stack, or a non-empty stack at the end, means invalid. ⏱️ O(n) · 🗄️ O(n)

## 1. 📋 题目 Problem

给定只包含 `(`、`)`、`{`、`}`、`[`、`]` 的字符串 `s`，判断它是否有效。有效需要满足：
Given a string `s` containing only `()[]{}`, decide whether it's valid. It's valid when:

1. 左括号必须用**同类型**的右括号闭合 Every opening bracket is closed by the **same type**
2. 左括号必须按**正确的顺序**闭合 Brackets close in the **correct order**
3. 每个右括号都有一个对应的同类型左括号 Every closing bracket has a matching opening bracket

| Input | Output | 原因 Why |
| --- | --- | --- |
| `"()"` | `true` | |
| `"()[]{}"` | `true` | 并列 side by side |
| `"([])"` | `true` | 嵌套 nested |
| `"(]"` | `false` | 类型不匹配 wrong type |
| `"([)]"` | `false` | 顺序交叉 crossed order |

约束 Constraints: 1 ≤ `s.length` ≤ 10⁴，`s` 只包含 `()[]{}`。
1 ≤ `s.length` ≤ 10⁴, and `s` contains only `()[]{}`.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 最后打开的括号必须最先闭合（`"([)]"` 无效，就是因为 `[` 后开却没先关）。“最后进、最先出”就是栈。
  The most recently opened bracket must close first (`"([)]"` fails because `[` opened last but didn't close first). Last in, first out: a stack.
- **小技巧 Trick:** 不压左括号，而是压**期望看到的右括号**。这样遇到右括号时只要比较 `stack.pop() == c`，不用再写一个“左右对应”的映射。
  Push the **closer you expect** instead of the opener. Then a closing bracket just checks `stack.pop() == c`, with no separate opener-to-closer lookup.
- **套路 Pattern:** 栈 / 括号匹配 (stack, bracket matching)。和 [[Baseball Game|682. 棒球比赛 Baseball Game]] 一样，“和前一个配对 / 撤销前一个”就想栈。
  Like 682, "match with / undo the previous one" means stack.

## 3. 🐢 暴力解 Brute Force

反复删除相邻的成对括号 `()`、`[]`、`{}`，直到删不动为止；最后字符串为空就有效。
Repeatedly delete adjacent pairs `()`, `[]`, `{}` until nothing changes; valid if the string ends up empty.

```java
while (s.contains("()") || s.contains("[]") || s.contains("{}")) {
    s = s.replace("()", "").replace("[]", "").replace("{}", "");
}
return s.isEmpty();
```

- ⏱️ Time: O(n²): 每轮至少删一对，最多 n/2 轮，每轮扫描 O(n) At least one pair per round, up to n/2 rounds, O(n) each
- 🗄️ Space: O(n): 每轮都生成新字符串 Each round builds a new string

栈的解法其实就是把“删除相邻配对”做成一次遍历：栈顶永远是“还没闭合的最近一个”。
The stack does the same "delete adjacent pairs" in one pass: the top is always the most recent unclosed bracket.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if ('(' == c) {
                stack.push(')');                 // 压入期望的右括号 push the expected closer
            } else if ('{' == c) {
                stack.push('}');
            } else if ('[' == c) {
                stack.push(']');
            } else {
                // 右括号：栈空 = 没有对应的左括号；不相等 = 类型或顺序错
                // closer: empty = no opener; mismatch = wrong type or order
                if (stack.isEmpty() || stack.pop() != c) {
                    return false;
                }
            }
        }

        return stack.isEmpty();                  // 还有没闭合的左括号就是无效 leftover openers = invalid
    }
}
```

- ⏱️ Time: O(n): 每个字符最多压栈一次、弹栈一次 Each char is pushed and popped at most once
- 🗄️ Space: O(n): 最坏全是左括号，如 `"(((("` Worst case all openers, e.g. `"(((("`

> [!example] 走一遍 Trace: `"([)]"`
>
> | c | 动作 Action | 栈（底 → 顶） Stack (bottom → top) |
> | --- | --- | --- |
> | `(` | push `)` | `)` |
> | `[` | push `]` | `)` `]` |
> | `)` | pop `]`，`]` ≠ `)` | ❌ return `false` |
>
> 对比 `"([])"`：第三个字符是 `]`，弹出 `]` 相等；第四个 `)` 弹出 `)` 相等；栈空 → `true` ✅
> Compare `"([])"`: the third char `]` pops `]`, the fourth `)` pops `)`, the stack ends empty → `true`.

> [!note] 其他写法 Alternatives
> **`ArrayDeque` + 奇数长度提前返回 `ArrayDeque` + early exit on odd length:** `Stack` 是遗留类（继承 `Vector`，方法都加了同步），官方推荐用 `ArrayDeque`；它的空栈 `pop()` 抛 `NoSuchElementException`，所以仍要先判 `isEmpty()`。长度为奇数一定无法两两配对（只是提前返回，复杂度不变）。
> `Stack` is legacy (extends `Vector`, synchronized); `ArrayDeque` is preferred. Its `pop()` on empty throws `NoSuchElementException`, so keep the `isEmpty()` check. An odd-length string can never pair up (a shortcut only; the complexity is unchanged).
> ```java
> if (s.length() % 2 == 1) return false;
> Deque<Character> stack = new ArrayDeque<>();
> // 其余和上面一样 the rest is the same
> ```
> **`char[]` + 指针 Array + pointer:** 不用 `Character` 装箱，通常更快；`->` 形式的 `switch` 需要 Java 14+
> No `Character` boxing, usually faster; the arrow-form `switch` needs Java 14+
> ```java
> char[] stack = new char[s.length()];
> int top = 0;
> for (char c : s.toCharArray()) {
>     switch (c) {
>         case '(' -> stack[top++] = ')';
>         case '{' -> stack[top++] = '}';
>         case '[' -> stack[top++] = ']';
>         default -> {
>             if (top == 0 || stack[--top] != c) return false;
>         }
>     }
> }
> return top == 0;
> ```
> **`Map` 映射 With a map:** 压左括号，用 `Map.of(')', '(', ']', '[', '}', '{')` 查右括号对应的左括号。括号种类多的时候更好扩展，这题三种用压右括号的技巧更简洁。
> Push openers and look up each closer's opener in `Map.of(...)`. It scales better to many bracket types; with three, pushing the expected closer is simpler.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 只有右括号 Only closers (`")"`): 栈空时 `pop()` 会抛 `EmptyStackException`，所以要先判断 `isEmpty()` → `pop()` on an empty `Stack` throws, so check `isEmpty()` first (short-circuit `||` does this)
- [x] 只有左括号 Only openers (`"(("`): 循环里不会返回 `false`，必须靠最后的 `return stack.isEmpty()` → nothing fails in the loop; the final `isEmpty()` catches it
- [x] 类型对、顺序错 Right types, wrong order (`"([)]"`): 栈天然保证顺序 → the stack enforces order
- [x] `stack.pop() != c` 能正确比较 `stack.pop() != c` compares correctly: `pop()` 返回 `Character`，和 `char` 比较时会**拆箱**成值比较 → `pop()` returns a `Character`, which is **unboxed** when compared with a `char`, so it's a value comparison
- [x] ⚠️ 换成 `Map` 写法时小心 Careful with the `Map` version: `stack.pop() != map.get(c)` 两边都是 `Character`，`!=` 比较的是**引用**。ASCII（0–127）有缓存所以碰巧对，别的字符可能出错；用 `.equals()` 或拆箱成 `char` → both sides are `Character`, so `!=` compares **references**. ASCII (0–127) is cached so it happens to work; other chars can fail. Use `.equals()` or unbox to `char`

## 6. 🔁 进阶 Follow-ups

> [!question] 如果只有一种括号 `()` 呢？ What if there's only one bracket type?
> 不需要栈，一个计数器就够：`(` 加一，`)` 减一，中途变负就无效，最后必须为 0。空间 O(1)。多种括号时计数器不够，因为 `"([)]"` 每种括号的计数都平衡，但顺序错了。
> A counter is enough: `+1` for `(`, `-1` for `)`, invalid if it ever goes negative, and it must end at 0. O(1) space. With several types a counter fails: `"([)]"` balances every count but has the wrong order.

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| [[Baseball Game\|682. 棒球比赛 Baseball Game]] | 同样用栈“撤销 / 读前一个” Same stack idea: undo / read the previous one |
| 1021. Remove Outermost Parentheses | 只有 `()`，计数器即可 Only `()`, a counter is enough |
| 921. Minimum Add to Make Parentheses Valid | 计数没配对的左右括号 Count unmatched openers and closers |
| 1249. Minimum Remove to Make Valid Parentheses | 栈里存下标，删掉没配对的 Store indices, remove the unmatched |
| 22. Generate Parentheses | 反过来：生成所有有效组合（回溯） The reverse: generate all valid strings (backtracking) |
| 32. Longest Valid Parentheses | 可用栈存下标求最长有效子串（也可 DP / 双计数器）(Hard) Stack of indices for the longest valid substring (DP or two counters also work) |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么压入的是右括号，而不是左括号？ Why push the closing bracket instead of the opener?

> [!success]- 答案 Answer
> 遇到右括号时可以直接比较 `stack.pop() == c`，不需要再写一个左右括号的对应关系（`Map` 或一串 `if`）。两种都对，压右括号代码更短。
> A closer can be checked with `stack.pop() == c` directly, with no opener-to-closer mapping. Both work; pushing the closer is shorter.

**Q2.** 循环结束后为什么还要检查 `stack.isEmpty()`？ Why check `stack.isEmpty()` after the loop?

> [!success]- 答案 Answer
> 循环只能发现“多余的右括号”和“不匹配”。像 `"(("` 这样有没闭合的左括号，循环里不会出错，只有最后栈不为空才能发现。
> The loop only catches extra closers and mismatches. Unclosed openers like `"(("` never fail inside the loop; only a non-empty stack at the end reveals them.

**Q3.** `"([)]"` 每种括号都是一开一关，为什么无效？计数器能判断吗？ `"([)]"` has one open and one close of each type. Why is it invalid, and can counters detect it?

> [!success]- 答案 Answer
> 因为 `[` 是最后打开的，必须最先闭合，但先来的是 `)`。计数器只看数量不看顺序，所以判断不了；这正是需要栈的原因。
> `[` opened last so it must close first, but `)` comes first. Counters only see totals, not order, so they can't detect it. That's why a stack is needed.

**Q4.** 为什么奇数长度可以直接返回 `false`？ Why can an odd-length string return `false` immediately?

> [!success]- 答案 Answer
> 有效字符串里每个字符都恰好和另一个字符配对，所以长度一定是偶数。
> In a valid string every char pairs with exactly one other, so the length must be even.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[栈 Stack|栈 Stack]] · [[一次遍历 One Pass|一次遍历 One Pass]]（栈当状态 stack as state） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（比暴力解的 O(n²) 快 faster than the O(n²) brute force）
- 上一题 Previous: [[Baseball Game|682. 棒球比赛 Baseball Game]]（同样是栈 also a stack）
- 下一题 Next: [[Min Stack|155. 最小栈 Min Stack]]（辅助栈设计题 auxiliary-stack design）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-21 |  | ✅ | 压“期望的右括号”，弹栈直接比较；别忘了最后 `isEmpty()` Push the expected closer and compare on pop; don't forget the final `isEmpty()` |
