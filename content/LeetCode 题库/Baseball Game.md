---
title: "682. 棒球比赛 Baseball Game"
aliases:
  - 棒球比赛
  - LeetCode 682
  - Baseball Game
tags:
  - LeetCode
  - Interview-Prep
  - Stack
  - Simulation
difficulty: Easy
pattern: "Stack / Simulation"
link: https://leetcode.com/problems/baseball-game/
status: 🟡 review
created: 2026-10-21
publish: true
last-reviewed: 2026-10-21
---

# ⚾ 682. Baseball Game

> [!abstract] TL;DR
> 用栈记录“有效得分”：数字就压栈，`C` 弹栈，`D` 压入栈顶的两倍，`+` 压入栈顶两个数之和，最后把栈里所有数加起来。
> Keep the valid scores on a stack: push numbers, pop on `C`, push double the top on `D`, push the sum of the top two on `+`, then add up whatever is left. ⏱️ O(n) · 🗄️ O(n)

## 1. 📋 题目 Problem

给你一个字符串数组 `operations`，按顺序记录一场比赛的得分。每个元素是以下之一：
You're given a list of strings `operations`, applied in order to a score record. Each one is:

| 操作 Operation | 含义 Meaning |
| --- | --- |
| 整数 `x` An integer `x` | 记一个新得分 `x` Record a new score `x` |
| `"+"` | 新得分 = 前两个得分之和 New score = sum of the previous two scores |
| `"D"` | 新得分 = 前一个得分的两倍 New score = double the previous score |
| `"C"` | 作废前一个得分，把它从记录里删掉 Invalidate the previous score and remove it |

返回记录中所有得分的总和。
Return the sum of all scores in the record.

| Input | Output |
| --- | --- |
| `["5","2","C","D","+"]` | `30` |
| `["5","-2","4","C","D","9","+","+"]` | `27` |
| `["1","C"]` | `0` |

约束 Constraints: 1 ≤ `operations.length` ≤ 1000；整数在 [-3·10⁴, 3·10⁴] 范围内；保证 `+` 之前至少有两个得分，`C` 和 `D` 之前至少有一个；所有中间结果和答案都在 32 位 `int` 范围内。
1 ≤ `operations.length` ≤ 1000; integers are in [-3·10⁴, 3·10⁴]; `+` always has two previous scores and `C`/`D` always have one; every intermediate value and the answer fit in a 32-bit `int`.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 每个操作只看“最近的”一两个得分，而 `C` 会删掉最近的那个，让更早的得分重新变成“最近的”。这正是**后进先出 LIFO**，所以用栈。
  Every operation only looks at the most recent one or two scores, and `C` removes the most recent one so an older score becomes "most recent" again. That's **last in, first out**, so use a stack.
- **套路 Pattern:** 栈 + 模拟 (stack simulation)。照着规则一步步做，没有技巧，重点是选对数据结构。
  Stack simulation: follow the rules step by step. There's no trick; the point is picking the right data structure.

> [!tip] 什么时候想到栈 When to reach for a stack
> 题目里出现“撤销 undo / 删除上一个 / 和前一个配对”时，先想栈：括号匹配、编辑器退格（844. Backspace String Compare）、表达式求值都是这个形状。
> When a problem says "undo", "remove the previous one", or "match with the previous one", think stack first: bracket matching, backspace editing (844), and expression evaluation all have this shape.

## 3. 🐢 暴力解 Brute Force

用 `ArrayList<Integer>` 当记录，`C` 删除最后一个元素（`list.remove(list.size() - 1)`），`+` 和 `D` 读最后一两个元素。这其实就是用列表实现的栈，复杂度一样是 O(n)。
Use an `ArrayList<Integer>` as the record: `C` removes the last element, `+` and `D` read the last one or two. That's just a stack built on a list, and it's also O(n).

真正“暴力”的写法是 `C` 时把它标记为无效、最后再扫一遍，但 `+` 和 `D` 需要跳过无效项往回找，最坏会变成 O(n²)。这说明删除必须真的删掉，让下一个得分直接露出来。
A truly brute-force version marks cancelled scores as invalid instead of removing them, but then `+` and `D` must skip invalid entries while scanning back, which can be O(n²). Removing for real, so the previous score is right on top, is what makes it O(n).

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class Solution {
    public int calPoints(String[] operations) {
        int result = 0;
        Stack<Integer> stack = new Stack<>();
        for (String operation : operations) {
            if ("+".equals(operation)) {
                int top = stack.pop();               // 先拿出栈顶，才能看到第二个 pop the top to see the second
                int newScore = top + stack.peek();
                stack.push(top);                     // 放回去，前两个得分都保留 put it back; both scores stay
                stack.push(newScore);
            } else if ("D".equals(operation)) {
                int temp = stack.peek();
                stack.push(temp * 2);
            } else if ("C".equals(operation)) {
                stack.pop();
            } else {
                int num = Integer.parseInt(operation); // 能解析负数，如 "-2" handles negatives like "-2"
                stack.push(num);
            }
        }
        while (!stack.isEmpty()) {
            result += stack.pop();
        }
        return result;
    }
}
```

- ⏱️ Time: O(n): 每个操作 O(1)，最后求和最多 O(n) Each operation is O(1); the final sum is at most O(n)
- 🗄️ Space: O(n): 最坏情况下每个操作都压栈 Worst case every operation pushes

> [!example] 走一遍 Trace: `["5","2","C","D","+"]`
>
> | 操作 Op | 动作 Action | 栈（底 → 顶） Stack (bottom → top) |
> | --- | --- | --- |
> | `5` | push 5 | `[5]` |
> | `2` | push 2 | `[5, 2]` |
> | `C` | pop 2 | `[5]` |
> | `D` | push 5 × 2 | `[5, 10]` |
> | `+` | pop 10, peek 5, push 10, push 15 | `[5, 10, 15]` |
>
> 求和 Sum: 5 + 10 + 15 = **30** ✅

> [!note] 其他写法 Alternatives
> **`ArrayDeque`（推荐 recommended）:** Java 官方文档建议用 `Deque` 代替 `Stack`
> The Java docs recommend `Deque` over `Stack`
> ```java
> Deque<Integer> stack = new ArrayDeque<>();
> // push / pop / peek 用法完全一样 same push / pop / peek calls
> ```
> **`int[]` + 指针 Array + pointer:** 约束给了上限 1000，可以直接用数组当栈，`+` 不用弹出再压回，能直接读 `stack[top - 2]`
> The length is capped at 1000, so a plain array works as the stack, and `+` can read `stack[top - 2]` directly instead of pop-and-push-back
> ```java
> int[] stack = new int[operations.length];
> int top = 0; // 下一个空位，也是元素个数 next free slot, also the size
> for (String op : operations) {
>     switch (op) {
>         case "+" -> { stack[top] = stack[top - 1] + stack[top - 2]; top++; }
>         case "D" -> { stack[top] = stack[top - 1] * 2; top++; }
>         case "C" -> top--;
>         default  -> stack[top++] = Integer.parseInt(op);
>     }
> }
> int sum = 0;
> for (int i = 0; i < top; i++) sum += stack[i];
> return sum;
> ```
> 三种都是 O(n) 时间、O(n) 空间。数组版没有 `Integer` 装箱，常数最小；它其实就是 [[Design Dynamic Array|动态数组 dynamic array]] 去掉扩容。
> All three are O(n) time and space. The array version avoids `Integer` boxing, so it has the smallest constant; it's the [[Design Dynamic Array|dynamic array]] without resizing.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 比较字符串用 `.equals` Compare strings with `.equals`, not `==`: `==` 比较的是引用，判题时的字符串不一定是同一个对象 → `==` compares references, and the judge's strings aren't guaranteed to be the same objects
- [x] `"+".equals(operation)` 把常量写在前面，`operation` 为 `null` 也不会抛空指针异常 Putting the literal first (`"+".equals(operation)`) can't throw an NPE (not needed here, but a good habit)
- [x] 负数 Negative numbers: `"-2"` 不是操作符，`Integer.parseInt` 能正确解析，所以要先判断三个操作符，最后才在 `else` 里解析数字 → `"-2"` isn't an operator and `Integer.parseInt` parses it fine, which is why the three operators are checked first and parsing is the `else`
- [x] `+` 后两个旧得分都要保留 `+` keeps both old scores: 弹出栈顶后要压回去，再压新得分 → push the popped top back before pushing the new score
- [x] 全部被 `C` 掉 Everything cancelled (`["1","C"]`): 栈为空，返回 0 → empty stack, return 0
- [x] 溢出 Overflow: 题目保证结果在 `int` 范围内 → the problem guarantees everything fits in `int`

## 6. 🔁 进阶 Follow-ups

> [!question] 能边做边求和吗？ Can you keep a running sum?
> 可以：维护 `sum`，每次 push 加上新得分，`C` 时减去弹出的得分。最后直接返回 `sum`，省掉最后的求和循环（复杂度不变，栈仍然需要，因为 `C` 之后要知道新的栈顶）。
> Yes: add each pushed score to `sum` and subtract the popped score on `C`. You skip the final loop, but the complexity is unchanged and you still need the stack, because after a `C` you must know the new top.

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| [[Valid Parentheses\|20. 有效的括号 Valid Parentheses]] | 栈的入门题：遇到右括号就和栈顶配对 The classic stack intro: match each closing bracket with the top |
| 844. Backspace String Compare | `#` 删掉前一个字符，和 `C` 一模一样 `#` deletes the previous char, exactly like `C` |
| [[Min Stack\|155. 最小栈 Min Stack]] | 设计一个能 O(1) 取最小值的栈 Design a stack with O(1) `getMin` |
| 150. Evaluate Reverse Polish Notation | 同样是“数字压栈，操作符弹出两个数计算” Same shape: push numbers, pop two on an operator |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么用栈，而不是在原数组上往回找？ Why a stack instead of scanning back through the input?

> [!success]- 答案 Answer
> `C` 会删掉得分，之后的 `+` 和 `D` 要跳过被删的得分去找“前一个有效得分”。栈把被删的直接弹掉，有效的前一个得分永远在栈顶，O(1) 就能拿到。
> `C` removes scores, so later `+` and `D` would need to skip cancelled ones. A stack pops them for real, so the previous valid score is always on top, reachable in O(1).

**Q2.** 处理 `+` 时，为什么要先 `pop` 再 `push` 回去？ Why pop and then push back for `+`?

> [!success]- 答案 Answer
> `Stack` 只能看栈顶，要读第二个元素必须先把栈顶拿出来。但 `+` 不会删除旧得分，所以读完要把栈顶放回去，再压入新得分。用 `int[]` 实现的话可以直接读 `stack[top - 2]`，不用弹出。
> A `Stack` only exposes the top, so you pop it to see the second one. `+` doesn't remove anything, so the top goes back before the new score is pushed. With an `int[]` you can read `stack[top - 2]` directly.

**Q3.** Java 里为什么更推荐 `ArrayDeque` 而不是 `Stack`？ Why prefer `ArrayDeque` over `Stack` in Java?

> [!success]- 答案 Answer
> `Stack` 是 JDK 1.0 的老类，继承自 `Vector`，每个方法都加了 `synchronized`，单线程下有多余的开销；而且它暴露了 `get(i)`、`add(i, x)` 等列表方法，能破坏栈的语义。`ArrayDeque` 没有同步开销，官方文档也推荐用 `Deque` 做栈。
> `Stack` is a JDK 1.0 class that extends `Vector`, so every method is `synchronized` (wasted overhead single-threaded), and it exposes list methods like `get(i)` and `add(i, x)` that break stack discipline. `ArrayDeque` has no locking, and the Javadoc itself recommends `Deque` for stacks.

**Q4.** `["5","-2","4","C","D","9","+","+"]` 的栈最后是什么？ What's the final stack for the second example?

> [!success]- 答案 Answer
> `[5, -2, -4, 9, 5, 14]`，和为 27。`C` 删掉 4，`D` 得 -4，第一个 `+` 是 -4 + 9 = 5，第二个 `+` 是 9 + 5 = 14。
> `[5, -2, -4, 9, 5, 14]`, sum 27. `C` removes 4, `D` gives -4, the first `+` is -4 + 9 = 5, the second is 9 + 5 = 14.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[栈 Stack|栈 Stack]] · [[数组 Array|数组 Array]]（栈通常用数组实现 stacks are usually array-backed） · [[一次遍历 One Pass|一次遍历 One Pass]]（栈当状态 stack as state） · [[复杂度分析 Big-O|复杂度分析 Big-O]]
- 上一题 Previous: [[Design Dynamic Array|设计动态数组 Design Dynamic Array (Resizable Array)]]（`int[]` 版的栈就是不扩容的动态数组 the `int[]` stack is a dynamic array without resizing）
- 下一题 Next: [[Valid Parentheses|20. 有效的括号 Valid Parentheses]]（栈的括号匹配 stack bracket matching）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-21 |  | ✅ | 栈模拟一次写对；`+` 用 pop → peek → push 回去 Stack simulation correct first try; `+` via pop → peek → push back |
