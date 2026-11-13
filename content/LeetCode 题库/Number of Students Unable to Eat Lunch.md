---
title: "1700. 无法吃午餐的学生数量 Number of Students Unable to Eat Lunch"
aliases:
  - 无法吃午餐的学生数量
  - LeetCode 1700
  - Number of Students Unable to Eat Lunch
tags:
  - LeetCode
  - Interview-Prep
  - Queue
  - Simulation
  - Counting
difficulty: Easy
pattern: "Queue Simulation / Counting"
link: https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/
status: 🟡 review
created: 2026-10-31
publish: true
last-reviewed: 2026-10-31
---

# 🥪 1700. Number of Students Unable to Eat Lunch

> [!abstract] TL;DR
> 两种写法。**队列模拟**：照题意排队，不想要的学生排回队尾，用一个计数器记“连续多少人没吃上”；等于队列长度时，说明剩下的人谁都不要栈顶的三明治，卡死了。**计数**：队伍的顺序其实无所谓，只要还有人想要栈顶那种，他迟早会转到队头。所以只数两种学生各有几个，按顺序发三明治，哪种数到 0 就停。
> Two approaches. **Queue simulation**: follow the rules, send unwilling students to the back, and count how many in a row didn't eat; once that equals the queue size, nobody left wants the top sandwich and the line is stuck. **Counting**: the queue order doesn't actually matter, because anyone who wants the top sandwich will reach the front eventually. So just count each kind of student, hand out sandwiches in order, and stop when the needed kind runs out. ⏱️ Simulation O(n²) / counting O(n) · 🗄️ O(n) / O(1)

## 1. 📋 题目 Problem

食堂有圆形（`0`）和方形（`1`）两种三明治，学生排成一个**队列**，三明治叠成一个**栈**，`sandwiches[0]` 在栈顶。每一轮：
The cafeteria serves circular (`0`) and square (`1`) sandwiches. The students stand in a **queue** and the sandwiches form a **stack**, with `sandwiches[0]` on top. Each round:

- 队头的学生想要栈顶那种，就拿走它并离开队列。
  If the student at the front prefers the top sandwich, they take it and leave the queue.
- 否则这个学生不拿，走到队尾重新排队。
  Otherwise they leave it and go to the end of the queue.

一直重复，直到队列里**没有人**想要栈顶的三明治。返回吃不上午餐的学生人数。
This repeats until **no one** in the queue wants the top sandwich. Return the number of students who can't eat.

| 输入 Input | 输出 Output | 说明 Why |
| --- | --- | --- |
| `students = [1,1,0,0]`, `sandwiches = [0,1,0,1]` | `0` | 转几圈之后每个人都吃上了 after some rotations everyone eats |
| `students = [1,1,1,0,0,1]`, `sandwiches = [1,0,0,0,1,1]` | `3` | 剩下三个人都要方的，栈顶却是圆的 the last three all want `1`, but the top is `0` |

约束 Constraints: `1 <= students.length, sandwiches.length <= 100`，两个数组等长，元素只有 `0` 或 `1`。
`1 <= students.length, sandwiches.length <= 100`, both arrays have the same length, and every value is `0` or `1`.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 学生会一直转圈，所以只要队列里**还有人**想要栈顶那种，他迟早会转到队头拿走它。谁先谁后不影响结果，因为同一种口味的学生是可以互换的。
  Students keep cycling, so as long as **someone** in the queue wants the top sandwich, they will reach the front and take it. The order doesn't change the outcome, because students with the same preference are interchangeable.
- **什么时候卡死 When it gets stuck:** 栈顶是 `x`，但剩下的人里没有想要 `x` 的。栈不会动，剩下的人全都吃不上。
  The top is `x` and nobody left wants `x`. The stack never moves again, so everyone left goes hungry.
- **套路 Pattern:** 直接按题意用队列模拟；再往前想一步，就能把模拟换成计数。
  Simulate with a queue as described; one step further, the simulation collapses into counting.

```
students（队头在左 front on the left）  sandwiches（栈顶在左 top on the left）

[1, 1, 1, 0, 0, 1]                     [1, 0, 0, 0, 1, 1]
 ...三个人吃上之后 after three students eat...
[1, 1, 1]                              [0, 1, 1]
 剩下的人都要 1，栈顶是 0：卡死，答案 3
 everyone left wants 1 but the top is 0: stuck, the answer is 3
```

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 用 `ArrayList` 当队列，转圈时 `remove(0)` 再 `add`，每次扫一遍剩下的学生判断是否卡死。
  Use an `ArrayList` as the queue (`remove(0)`, then `add` to rotate), and scan everyone left to check for "stuck".
- `remove(0)` 要平移后面所有元素，是 O(n)，转圈最多 O(n²) 次，所以最坏 O(n³)。队列操作应该是 O(1)，所以要用真正的队列。
  `remove(0)` shifts every remaining element, O(n), and there can be O(n²) rotations, so the worst case is O(n³). Queue operations should be O(1), which is why a real queue is the right tool.

## 4. 🚀 最优解 Optimal Solution

### 4.1 🔄 我的解法一：队列模拟 My solution 1: queue simulation

```java
class Solution {
    public int countStudents(int[] students, int[] sandwiches) {
        Queue<Integer> queue = new ArrayDeque<>();
        for (int student : students) {
            queue.offer(student);                 // 学生按顺序入队 students line up in order
        }

        int i = 0;                                // 栈顶三明治的下标 index of the top sandwich
        int result = 0;                           // 连续多少人没吃上 how many in a row didn't eat

        while (!queue.isEmpty() && result < queue.size()) {   // 转满一圈还没人吃就停 stop after a full lap with no one eating
            if (queue.peek() != sandwiches[i]) {
                queue.offer(queue.poll());        // 不要就排回队尾 not wanted: back of the line
                result++;
            } else {
                queue.poll();                     // 拿走三明治离开 take it and leave
                result = 0;                       // 有人吃上了，重新计数 someone ate: reset the counter
                i++;                              // 下一个三明治到栈顶 the next sandwich is on top
            }
        }

        return result;                            // 退出时等于剩下的人数 equals the number left at exit
    }
}
```

- ⏱️ Time: O(n²)。每有一个人吃上，之前最多转 `queue.size()` 次，加起来是平方级（见下方最坏例子）
  O(n²): each time someone eats, there were at most `queue.size()` rotations before it, which adds up to quadratic (see the worst case below)
- 🗄️ Space: O(n)，队列 for the queue

**为什么转一圈就够 Why one lap is enough:** 转圈不改变任何人的口味，也不改变栈顶。连续 `queue.size()` 个人都不要，就是剩下的每个人都看过了这个三明治，再转也一样。
Rotating changes neither anyone's preference nor the top sandwich. If `queue.size()` students in a row said no, everyone left has seen this sandwich, and more laps change nothing.

**答案怎么来 Why `result` is the answer:** 循环只有两种结束方式：队列空了（`result` 刚清成 `0`，答案是 `0`），或者 `result == queue.size()`（剩下的人都连续被跳过）。两种情况下 `result` 都等于 `queue.size()`，所以写 `return queue.size();` 也一样，而且更好懂。
The loop ends in only two ways: the queue is empty (`result` was just reset to `0`, the answer), or `result == queue.size()` (everyone left was skipped in a row). Either way `result` equals `queue.size()`, so `return queue.size();` works too and reads more clearly.

> [!example] 走一遍 Trace: `students = [1,1,1,0,0,1]`, `sandwiches = [1,0,0,0,1,1]`
>
> | 步 Step | 队列 Queue（队头在左 front left） | 栈顶 `sandwiches[i]` Top | 动作 Action | `result` |
> | --- | --- | --- | --- | --- |
> | 1 | `[1,1,1,0,0,1]` | `1`（i=0） | 吃上 eats | 0 |
> | 2 | `[1,1,0,0,1]` | `0`（i=1） | 排回队尾 to the back | 1 |
> | 3 | `[1,0,0,1,1]` | `0`（i=1） | 排回队尾 to the back | 2 |
> | 4 | `[0,0,1,1,1]` | `0`（i=1） | 吃上 eats | 0 |
> | 5 | `[0,1,1,1]` | `0`（i=2） | 吃上 eats | 0 |
> | 6–8 | `[1,1,1]` | `0`（i=3） | 三人都排回队尾 all three go to the back | 1 → 2 → 3 |
> | 结束 End | `[1,1,1]` | `0` | 停：计数等于队长 Stop: `result == size` | **3** ✅ |

### 4.2 🧮 我的解法二：计数 My solution 2: counting

```java
class Solution {
    public int countStudents(int[] students, int[] sandwiches) {
        int[] count = new int[2];                 // count[0] 要圆的、count[1] 要方的 students wanting 0 / 1

        for (int student : students) {
            count[student]++;
        }

        for (int i = 0; i < sandwiches.length; i++) {
            if (count[sandwiches[i]] == 0) {      // 没人要栈顶这种：卡死 nobody wants the top one: stuck
                return sandwiches.length - i;     // 剩下的三明治数 = 剩下的学生数 sandwiches left = students left
            }
            count[sandwiches[i]]--;               // 有人要，迟早轮到他 someone wants it and will reach the front
        }

        return 0;                                 // 三明治发完了，人人有份 all sandwiches handed out
    }
}
```

- ⏱️ Time: O(n)，两次遍历 two passes
- 🗄️ Space: O(1)，只有两个计数器 just two counters

**剩余人数 What `sandwiches.length - i` means:** 前 `i` 个三明治每个对应一个吃上的学生，所以剩下 `n - i` 个学生，他们全都要另一种，这个数也等于 `count[1 - sandwiches[i]]`。
The first `i` sandwiches were eaten, one per student, so `n - i` students are left, all wanting the other kind; it also equals `count[1 - sandwiches[i]]`.

> [!example] 走一遍 Trace: 同一个例子 The same example
>
> 开始 Start: `count = [2, 4]`（要 0 的两人、要 1 的四人 two want 0, four want 1）
>
> | `i` | `sandwiches[i]` | 有人要吗 Anyone want it? | `count` 之后 after |
> | --- | --- | --- | --- |
> | 0 | `1` | ✅（四人 four） | `[2, 3]` |
> | 1 | `0` | ✅（两人 two） | `[1, 3]` |
> | 2 | `0` | ✅（一人 one） | `[0, 3]` |
> | 3 | `0` | ❌ `count[0] == 0` | 返回 `6 - 3 = 3` Returns `6 - 3 = 3` |

| 写法 Approach | ⏱️ Time | 🗄️ Space | 说明 Notes |
| --- | --- | --- | --- |
| `ArrayList` 模拟 `ArrayList` simulation | O(n³) | O(n) | 队头删除要平移元素 Removing the front shifts every element |
| 队列模拟（解法一） Queue simulation (solution 1) | O(n²) | O(n) | 照题意来，最好想 follows the statement; easiest to come up with |
| 计数（解法二） Counting (solution 2) | O(n) | O(1) | 先想清楚顺序无关，最优 needs the "order doesn't matter" insight; optimal |

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 全都吃上 Everyone eats: 模拟版队列变空就退出，计数版循环走完返回零 → the simulation exits on an empty queue; counting finishes the loop and returns `0`
- [x] 一开始就卡死 Stuck from the start: 两种写法都返回全部人数，计数版第一步就返回，模拟版转满一圈才停 → both return `n`; counting returns at `i = 0`, the simulation after one full lap
- [x] ⚠️ 只停在队列为空 Stopping only on an empty queue: 没有 `result < queue.size()` 的话，卡死时会无限转圈 → without `result < queue.size()`, a stuck line loops forever
- [x] ⚠️ 有人吃上后忘了清零 Forgetting to reset the counter: `result` 记的是**连续**没吃上的人数，有人吃上必须清成 `0`，否则会提前停 → `result` counts misses **in a row**; it must go back to `0` when someone eats, or the loop stops too early
- [x] `Integer` 和 `int` 比较 Comparing `Integer` with `int`: `queue.peek() != sandwiches[i]` 没问题，因为右边是 `int`，左边会自动拆箱；两边都是 `Integer` 时 `!=` 比较的是引用 → this works because the right side is an `int`, so the left unboxes; with two `Integer`s, `!=` would compare references

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 2073. 买票需要的时间 Time Needed to Buy Tickets | 同样是排队转圈，也能不模拟、直接算 the same rotating line, also solvable by a formula instead of simulating · Easy |
| 933. 最近的请求次数 Number of Recent Calls | 队列存时间戳，旧的从队头出 a queue of timestamps; old ones leave from the front · Easy |
| 950. 按递增顺序显示卡牌 Reveal Cards In Increasing Order | 队列模拟，“拿一张、下一张放底下” queue simulation: take one, move the next to the bottom · Medium |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么学生的排队顺序不影响答案？ Why doesn't the queue order affect the answer?

> [!success]- 答案 Answer
> 学生会不断转圈，只要还有人想要栈顶的三明治，他一定会转到队头拿走它。被谁拿走不重要，同口味的学生可以互换。所以只需要知道每种口味还剩几个人。
> Students keep cycling, so if anyone wants the top sandwich they will reach the front and take it. Who takes it doesn't matter, since students with the same preference are interchangeable. All that matters is how many of each kind are left.

**Q2.** 模拟版为什么用 `result < queue.size()` 判断卡死？ Why does the simulation use `result < queue.size()` to detect being stuck?

> [!success]- 答案 Answer
> `result` 是连续被跳过的人数。转圈不改变栈顶，也不改变任何人的口味，所以一旦连续 `queue.size()` 人都跳过，就是剩下的每个人都不要栈顶这种，再转也不会变。
> `result` counts students skipped in a row. Rotating changes neither the top sandwich nor anyone's preference, so once `queue.size()` students in a row have skipped it, nobody left wants it, and more rotations won't help.

**Q3.** 计数版里卡死时为什么返回 `sandwiches.length - i`？ Why does the counting version return `sandwiches.length - i` when stuck?

> [!success]- 答案 Answer
> 前 `i` 个三明治每个都被一个学生吃掉了，两个数组又等长，所以还剩 `n - i` 个学生，他们全都吃不上。这个数也等于 `count[1 - sandwiches[i]]`。
> Each of the first `i` sandwiches was eaten by one student, and the arrays have equal length, so `n - i` students are left and none of them can eat. It also equals `count[1 - sandwiches[i]]`.

**Q4.** 模拟版最坏是 O(n²)，能举个例子吗？ The simulation is O(n²) in the worst case. Can you give an example?

> [!success]- 答案 Answer
> `students = [1,1,1,0,0,0]`，`sandwiches = [0,1,0,1,0,1]`：每次想要栈顶那种的人都排在另一种人的后面，要先把另一种人全转一遍（依次转 3、2、2、1、1、0 次），总共约 `n²/4` 次转圈。
> `students = [1,1,1,0,0,0]`, `sandwiches = [0,1,0,1,0,1]`: each time, the students who want the top sandwich stand behind all of the other kind, so the line rotates past all of them first (3, 2, 2, 1, 1, 0 times), roughly `n²/4` in total.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[队列 Queue|队列 Queue]]（模拟排队 simulating a line） · [[数组 Array|数组 Array]]（`int[2]` 当计数器 an `int[2]` as counters） · [[栈 Stack|栈 Stack]]（三明治叠成栈 the sandwiches form a stack） · [[一次遍历 One Pass|一次遍历 One Pass]]（计数数组 a count array） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（模拟和计数的复杂度对比 simulation O(n²) vs counting O(n)）
- 对照 Compare with: [[Baseball Game|682. 棒球比赛 Baseball Game]]（也是“照题意模拟”，但用的是栈 also a "simulate the rules" problem, with a stack instead）
- 上一题 Previous: [[Design Browser History|1472. 设计浏览器历史记录 Design Browser History]]（双向链表 doubly linked list）
- 下一题 Next: [[Implement Stack using Queues|225. 用队列实现栈 Implement Stack using Queues]]（同样用 `offer(poll())` 转圈 the same `offer(poll())` rotation）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-31 |  | ✅ | 连续一圈没人吃就卡死；顺序无关，数两种学生就够 A full lap with no one eating means stuck; order doesn't matter, so counting both kinds is enough |
