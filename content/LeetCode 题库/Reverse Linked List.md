---
title: "206. Reverse Linked List"
aliases:
  - 反转链表
  - LeetCode 206
  - Reverse Linked List
  - 链表反转
tags:
  - LeetCode
  - Interview-Prep
  - Linked-List
  - Recursion
difficulty: Easy
pattern: "Linked List / Pointer Reversal (Iterative + Recursive)"
link: https://leetcode.com/problems/reverse-linked-list/
status: 🟡 review
created: 2026-10-26
publish: true
last-reviewed: 2026-10-26
---

# 🔄 206. Reverse Linked List

> [!abstract] TL;DR
> **迭代：** 用 `prev`、`curr`、`next` 三个指针从头走到尾，每一步把 `curr.next` 调头指向 `prev`，最后 `prev` 就是新头。**递归：** 先相信 `reverseList(head.next)` 把后面那段反转好并返回新头 `newHead`，本层只做两件事：把自己接到那段的尾巴上（`head.next.next = head; head.next = null`），然后原样返回 `newHead`。
> **Iterative:** walk `prev`, `curr` and `next` from head to tail, flipping `curr.next` to point at `prev` at each step; at the end `prev` is the new head. **Recursive:** trust `reverseList(head.next)` to reverse the rest and return its new head `newHead`; this level only appends itself to that part's tail (`head.next.next = head; head.next = null`) and returns `newHead` unchanged. ⏱️ O(n) · 🗄️ 迭代 iterative O(1) / 递归 recursive O(n) 调用栈 call stack

## 1. 📋 题目 Problem

给定单链表的头节点 `head`，反转链表，返回反转后的头节点。
Given the `head` of a singly linked list, reverse the list and return the new head.

| Input | Output |
| --- | --- |
| `head = [1, 2, 3, 4, 5]` | `[5, 4, 3, 2, 1]` |
| `head = [1, 2]` | `[2, 1]` |
| `head = []` | `[]` |

约束 Constraints: 节点数在 `[0, 5000]` 范围内；`-5000 <= Node.val <= 5000`。
The number of nodes is in `[0, 5000]`; `-5000 <= Node.val <= 5000`.

> [!question] 进阶 Follow-up（题目原文 from the problem）
> 你能用迭代和递归两种方法解决吗？ Can you solve it both iteratively and recursively?

```java
// LeetCode 提供的节点定义 Node definition provided by LeetCode
public class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
```

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 不需要移动任何节点，也不需要改 `val`，只要把每条 `next` 箭头**调个头**。`1 → 2 → 3` 变成 `1 ← 2 ← 3`，原来的尾巴 3 就成了新头。
  No node moves and no `val` changes; just **flip every `next` arrow**. `1 → 2 → 3` becomes `1 ← 2 ← 3`, and the old tail 3 becomes the new head.
- **难点 The hard part:** 单链表只能往后走。一旦把 `curr.next` 改成指向 `prev`，就再也找不到后面的节点了，所以**改之前要先把 `curr.next` 存起来**。
  A singly linked list only goes forward. Once `curr.next` points back at `prev`, the rest of the list is unreachable, so **save `curr.next` before overwriting it**.
- **套路 Pattern:** 链表指针操作 linked-list pointer manipulation。迭代版是“边走边改”的 [[一次遍历 One Pass|一次遍历]]；递归版是“先解决子问题，回来时再处理自己”的[[递归 Recursion|递归]]（后序 post-order）。
  The iterative version is a one pass that rewires as it goes; the recursive version solves the subproblem first and handles the current node on the way back (post-order recursion).

## 3. 🐢 暴力解 Brute Force

把所有节点（或值）先放进栈或数组，再倒着取出来重新串起来。
Put every node (or value) into a stack or array, then take them out in reverse and relink them.

```java
public ListNode reverseList(ListNode head) {
    if (head == null) return null;
    Deque<ListNode> stack = new ArrayDeque<>();
    for (ListNode p = head; p != null; p = p.next) stack.push(p);  // 全部压栈 push all

    ListNode newHead = stack.pop();       // 原尾巴是新头 old tail is the new head
    ListNode tail = newHead;
    while (!stack.isEmpty()) {
        tail.next = stack.pop();          // 倒序接起来 relink in reverse
        tail = tail.next;
    }
    tail.next = null;                     // 原头节点现在是尾巴，必须断开 old head is now the tail; cut it
    return newHead;
}
```

- ⏱️ Time: O(n)，两趟 two passes
- 🗄️ Space: O(n)，栈里存了全部节点 the stack holds every node。最优解可以做到 O(1) the optimal solution needs only O(1)

## 4. 🚀 最优解 Optimal Solution

### 4.1 迭代 Iterative

我的解法 (My solution, Java):

```java
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode curr = head;                   // 当前要调头的节点 the node being flipped
        ListNode prev = null;                   // 已反转部分的头，一开始为空 head of the reversed part, empty at first

        while (curr != null) {
            ListNode next = curr.next;          // ① 先存下一个，否则改完就丢了 save next before it's lost
            curr.next = prev;                   // ② 调头 flip the arrow
            prev = curr;                        // ③ prev 前进 advance prev
            curr = next;                        // ④ curr 前进 advance curr
        }

        return prev;                            // curr 为 null 时，prev 是原尾巴 = 新头 prev is the old tail = new head
    }
}
```

- ⏱️ Time: O(n)，每个节点访问一次 each node visited once
- 🗄️ Space: O(1)，只有三个指针 just three pointers

> [!example] 走一遍 Trace: `1 → 2 → 3 → null`
>
> | 步骤 Step | `next` | 改完后 After `curr.next = prev` | `prev` | `curr` |
> | --- | --- | --- | --- | --- |
> | 开始 Start | | | `null` | 1 |
> | 1 | 2 | `1 → null` | 1 | 2 |
> | 2 | 3 | `2 → 1 → null` | 2 | 3 |
> | 3 | `null` | `3 → 2 → 1 → null` | 3 | `null` |
>
> `curr == null` 退出循环，返回 `prev = 3`。每一步都有两段：`prev` 开头的是已反转好的，`curr` 开头的是还没处理的。
> The loop exits when `curr == null` and returns `prev = 3`. At every step there are two lists: the reversed part starting at `prev`, and the untouched part starting at `curr`.

### 4.2 递归 Recursive

我的解法 (My solution, Java):

```java
class Solution {
    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) {    // 空链表或只剩一个节点：已经是反转好的 empty or one node: already reversed
            return head;
        }
        ListNode newHead = reverseList(head.next);  // 相信它：后面那段反转好了，newHead 是那段的头 trust it: the rest is reversed
        head.next.next = head;                      // head.next 现在是那段的尾巴，让它指回我 the old next is now that part's tail; point it back at me
        head.next = null;                           // 我成了新尾巴，断开旧箭头 I'm the new tail; cut the old arrow

        return newHead;                             // 我接在尾部，头没变 I joined at the tail, so the head is unchanged
    }
}
```

- ⏱️ Time: O(n)，每个节点一次调用 one call per node
- 🗄️ Space: O(n)，递归深度 n，调用栈上有 n 层 recursion depth n, so n frames on the [[栈 Stack|call stack]]

> [!example] 走一遍 Trace: `1 → 2 → 3 → null`
>
> 先一路“递”下去，到 3 触底；再一路“归”回来，每层在回来时调转一条箭头。
> First recurse down until 3 hits the base case, then unwind; each level flips one arrow on the way back.
>
> | 层 Level (`head`) | 调用 Call | 子调用交回 Child returns | 本层做的事 This level's work | 之后链表 List after | 返回 Returns |
> | --- | --- | --- | --- | --- | --- |
> | 3 | 触底 base case | — | 无 none | `3 → null` | 3 |
> | 2 | `reverseList(3)` | `3` | `3.next = 2`，`2.next = null` | `3 → 2 → null`（1 仍指向 2 still points to 2） | 3 |
> | 1 | `reverseList(2)` | `3 → 2` | `2.next = 1`，`1.next = null` | `3 → 2 → 1 → null` | 3 |
>
> 每一层拿到的 `newHead` 都是 3，每一层也都原样返回 3。
> Every level receives `newHead = 3` and returns 3 unchanged.

### 4.3 🤔 递归到底怎么理解 Making sense of the recursion

我卡住的地方：`newHead` 看起来是从最底层“一路传上来”的，可又说每一层“只管自己这一段”，这两种说法感觉矛盾。
Where I got stuck: `newHead` looks like it's "passed all the way up" from the bottom, yet each level supposedly "only handles its own part". The two descriptions felt contradictory.

> [!important] 关键：只关心子调用的**结果**，不关心子调用的**过程** Care about the child's result, not its process
> “只管自己这一层”不是说不关心下面传上来的东西，而是：**按合同使用子调用的结果，不去追踪它是怎么算出来的。** `newHead` 就是那个结果。
> "Only handle your own level" doesn't mean ignoring what comes back. It means: **use the child call's result according to its contract, without tracing how it was computed.** `newHead` is that result.

**① 合同 The contract.** `reverseList(x)`：把从 `x` 开始的链表反转好，**返回反转后的头**。每一层都遵守这个合同，也相信子调用遵守它。
`reverseList(x)` reverses the list starting at `x` and **returns the new head**. Every level keeps this contract and trusts its child to keep it.

**② 站在 `head = 1` 这一层看 From the `head = 1` level.** 它只知道两件事：
It only knows two things:

- 我自己：1，而且 `1.next` 还指着 2 Me: node 1, and `1.next` still points at 2
- 子调用交回来一条反转好的 `3 → 2`，头是 `newHead` The child handed back a reversed `3 → 2` whose head is `newHead`

它不知道、也不需要知道 `newHead` 是从最底层传上来的。合同说返回值是“反转后的头”，那 `newHead` 就是 `3 → 2` 的头。
It doesn't know, and doesn't need to know, that `newHead` came from the bottom. The contract says the return value is "the reversed head", so `newHead` is the head of `3 → 2`.

**③ 这一层要完成合同的两件事 This level fulfils the contract in two steps.**

- **反转 Reverse:** 2 原来是我的下一个，现在是 `3 → 2` 的尾巴，`1.next` 还指着它。所以 `head.next.next = head` 让 2 指回 1，`head.next = null` 让 1 成为新尾巴，得到 `3 → 2 → 1`。
  Node 2 was my next and is now the tail of `3 → 2`, and `1.next` still points to it. So `head.next.next = head` points 2 back at 1, and `head.next = null` makes 1 the new tail: `3 → 2 → 1`.
- **返回新头 Return the new head:** `3 → 2 → 1` 的头是谁？我是接在**尾巴**上的，头不受影响，还是子链表的头 `newHead`。
  What's the head of `3 → 2 → 1`? I joined at the **tail**, so the head is unaffected: it's still the sublist's head, `newHead`.

所以 `return newHead` 不是“照搬下面的值”，而是**这一层自己推理出来的答案**。从效果上看它像是一路传上来的，但每一层其实都在做同样的推理。
So `return newHead` isn't "copying whatever came from below"; it's **this level's own conclusion**. The effect looks like a value passed straight up, but each level is making the same deduction.

> [!tip] 和 maxDepth 对比 Compare with Maximum Depth of Binary Tree (104)
> 两者都是“拿到子结果 → 结合自己 → 得出本层结果”，区别只在要不要加工：
> Both are "take the child's result → combine with yourself → this level's result". The only difference is whether the result needs processing:
>
> ```java
> return Math.max(l, r) + 1;   // maxDepth: 子结果要加工（+1） the child result is processed (+1)
> return newHead;              // reverseList: 恰好不用加工 happens to need no processing
> ```
>
> 反转链表里，“结合自己”只改变**尾部**，不改变头部，所以返回值原封不动。
> In reverseList, "combining with yourself" only changes the **tail**, never the head, so the return value passes through unchanged.

> [!note] 两个变量的分工 Who does what
> | 变量 Variable | 角色 Role |
> | --- | --- |
> | `head`、`head.next` | 干活的：调转本层这一条箭头 the workers: flip this level's one arrow |
> | `newHead` | 传递员：本层不碰它，只负责把“新头是谁”交给调用者 the messenger: untouched here, it tells the caller where the new head is |
>
> 为什么非要返回它？反转完成后，最外层调用者只拿着原来的 1，而 1 现在是**尾巴**。不把新头一路交上去，调用者就找不到反转后的链表了。
> Why return it at all? Afterwards the top-level caller only holds the original 1, which is now the **tail**. Without handing the new head back up, the caller couldn't find the reversed list.

### 4.4 其他写法 Alternatives

> [!note] 其他写法 Alternatives
> **递归版迭代 Recursion that mirrors the loop:** 把迭代里的 `prev` / `curr` 变成参数，每次调用就是循环的一步。是尾递归，但 Java 不做尾调用优化，空间仍是 O(n)。
> Turn the loop's `prev` / `curr` into parameters, so each call is one loop step. It's tail-recursive, but Java doesn't optimize tail calls, so space is still O(n).
> ```java
> public ListNode reverseList(ListNode head) {
>     return reverse(head, null);
> }
>
> private ListNode reverse(ListNode curr, ListNode prev) {
>     if (curr == null) return prev;        // 走完了，prev 是新头 done; prev is the new head
>     ListNode next = curr.next;
>     curr.next = prev;                     // 调头 flip
>     return reverse(next, curr);           // 前进一步 advance one step
> }
> ```
> 面试里通常先写迭代版（O(1) 空间、不会栈溢出），再按要求补递归版。我的“先反转后面再接自己”那种递归最常被问到原理，要能讲清楚 4.3 的推理。
> In interviews, usually write the iterative version first (O(1) space, no stack overflow), then the recursive one if asked. My "reverse the rest, then attach myself" recursion is the one interviewers ask you to explain, so be ready to walk through 4.3.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 空链表 Empty list (`head == null`): 迭代版不进循环，返回 `prev = null`；递归版由 `head == null` 直接返回 → iterative skips the loop and returns `null`; recursive returns at the `head == null` check
- [x] 只有一个节点 Single node: 两种写法都原样返回 `head` → both return `head` as is
- [x] ⚠️ 先存 `next` 再改指针 Save `next` before rewiring: 如果先写 `curr.next = prev`，后面的节点就丢了 → write `curr.next = prev` first and the rest of the list is lost
- [x] ⚠️ 返回 `prev`，不是 `curr` Return `prev`, not `curr`: 循环结束时 `curr` 一定是 `null` → `curr` is always `null` when the loop ends
- [x] ⚠️ 递归版不能省 `head.next = null` Don't drop `head.next = null`: 省掉的话最后 1 和 2 互相指向，形成环，打印或遍历时死循环 → without it, 1 and 2 point at each other, forming a cycle and an infinite loop when traversed
- [x] ⚠️ 递归的 base case 必须包含 `head == null` The base case must cover `head == null`: 只写 `head.next == null` 的话，空链表输入时 `null.next` 抛 NPE → with only `head.next == null`, an empty input throws an NPE
- [x] 递归深度 Recursion depth: 每个节点一层，n ≤ 5000 时 JVM 默认栈通常够用；链表长到十万级时可能 `StackOverflowError`，用迭代版 → one frame per node; fine at n ≤ 5000 with the default JVM stack, but a list in the hundreds of thousands can overflow, so use the iterative version

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 92. Reverse Linked List II | 只反转第 `left` 到 `right` 个节点，需要 dummy 头和接回两端 reverse only positions `left..right`; needs a dummy head and reconnecting both ends |
| 25. Reverse Nodes in k-Group | 每 k 个一组反转，本题的循环套在外层循环里 reverse every k nodes; this loop inside an outer loop (Hard) |
| 24. Swap Nodes in Pairs | 两两交换，递归写法结构相似：先处理后面，再交换这一对接上去 swap pairs; the recursive version has a similar shape (recurse on the rest, then swap this pair onto it) |
| 234. Palindrome Linked List | 快慢指针找中点，再反转后半段比较 find the middle with fast/slow pointers, reverse the second half, compare |
| 143. Reorder List | 找中点 + 反转后半段 + 交替合并 middle + reverse + merge |
| 21. Merge Two Sorted Lists | 同样能用迭代（dummy 头）或递归写 also solvable iteratively (dummy head) or recursively |

## 7. ❓ 复习题 Review Questions

**Q1.** 迭代版为什么一定要先 `ListNode next = curr.next`？ Why must the iterative version save `curr.next` first?

> [!success]- Answer
> 单链表只能往后走。`curr.next = prev` 之后，`curr` 和后面节点的唯一联系就断了，不提前存下来就找不到下一个节点。
> A singly linked list only goes forward. After `curr.next = prev`, the only link from `curr` to the rest is gone, so without saving it you can't reach the next node.

**Q2.** 递归版里，为什么每一层都能直接 `return newHead`？ Why can every level just `return newHead`?

> [!success]- Answer
> 按合同，`newHead` 是子链表反转后的头。本层把自己接到子链表的**尾巴**上，头不变，所以整条链表反转后的头还是 `newHead`。这是每一层自己推出来的，不是“照搬”。
> By contract, `newHead` is the head of the reversed sublist. This level attaches itself at the sublist's **tail**, so the head doesn't change and the whole reversed list's head is still `newHead`. Each level deduces this itself.

**Q3.** `head.next.next = head` 是什么意思？为什么这时 `head.next` 还能用？ What does `head.next.next = head` mean, and why is `head.next` still valid?

> [!success]- Answer
> 子调用只改了从 `head.next` 开始的那一段，没碰 `head` 本身，所以 `head.next` 仍指向原来的下一个节点，而它现在是反转后子链表的尾巴。`head.next.next = head` 就是让这个尾巴指回我。
> The child call only rewired the part starting at `head.next` and never touched `head`, so `head.next` still points at the old next node, which is now the reversed sublist's tail. `head.next.next = head` makes that tail point back at me.

**Q4.** 两种写法的空间复杂度分别是多少？ What's the space complexity of each?

> [!success]- Answer
> 迭代 O(1)，只有几个指针。递归 O(n)，因为递归深度是 n，每层在[[栈 Stack|调用栈]]上占一帧，即使没有 `new` 任何对象。
> Iterative is O(1): a few pointers. Recursive is O(n): recursion depth is n and each level takes a frame on the call stack, even though nothing is allocated with `new`.

**Q5.** 去掉 `head.next = null` 会怎样？ What happens without `head.next = null`?

> [!success]- Answer
> 原头节点 1 仍然指向 2，而 2 已经指向 1，形成 `1 ⇄ 2` 的环。返回的链表遍历到最后会在 1 和 2 之间死循环。
> The old head 1 still points at 2 while 2 points at 1, forming a `1 ⇄ 2` cycle. Traversing the result loops forever between them.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[链表 Linked List|链表 Linked List]]（指针反转 pointer reversal） · [[递归 Recursion|递归 Recursion]]（相信合同、后序处理 trust the contract, post-order work） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（递归栈也算空间 the recursion stack counts）
- 上一题 Previous: [[Min Stack|155. Min Stack]]（栈；递归本身跑在调用栈上 stacks; recursion runs on the call stack）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-26 |  | ✅ | 迭代先存 next 再调头；递归按合同用 newHead，自己接尾巴所以头不变 Save next before flipping; in the recursion, newHead is the contract's result and I join at the tail, so the head stays |
