---
title: "206. 反转链表 Reverse Linked List"
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
> **Iterative:** walk `prev`, `curr` and `next` from head to tail, flipping `curr.next` to point at `prev` at each step; at the end `prev` is the new head. **Recursive:** trust `reverseList(head.next)` to reverse the rest and return its new head `newHead`; this level only appends itself to that part's tail (`head.next.next = head; head.next = null`) and returns `newHead` unchanged. ⏱️ O(n) · 🗄️ O(1) iterative / O(n) recursive (call stack)

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
- **套路 Pattern:** 链表指针操作 linked-list pointer manipulation。迭代版是“边走边改”的 [[一次遍历 One Pass|一次遍历 One Pass]]；递归版是“先解决子问题，回来时再处理自己”的[[递归 Recursion|递归 Recursion]]（后序 post-order）。
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
- 🗄️ Space: O(n)，栈里存了全部节点，而最优解只需要 O(1) 空间 the stack holds every node, while the optimal solution needs only O(1)

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
> | 2 | `reverseList(3)` | `3` | `3.next = 2`，`2.next = null` | `3 → 2 → null`（节点 1 仍指向 2 Node 1 still points to 2） | 3 |
> | 1 | `reverseList(2)` | `3 → 2` | `2.next = 1`，`1.next = null` | `3 → 2 → 1 → null` | 3 |
>
> 每一层拿到的 `newHead` 都是 3，每一层也都原样返回 3。
> Every level receives `newHead = 3` and returns 3 unchanged.

### 4.3 🤔 递归到底怎么理解 Making sense of the recursion

> [!important] 只关心子调用的**结果**，不关心**过程** Care about the child's result, not its process
> `newHead` 看起来是从最底层“一路传上来”的，但每一层其实只是**按合同使用子调用的结果**。合同：`reverseList(x)` 把从 `x` 开始的链表反转好，**返回反转后的头**。
> `newHead` looks like it's "passed all the way up" from the bottom, but each level just **uses the child's result by its contract**: `reverseList(x)` reverses the list starting at `x` and **returns the new head**.

站在 `head = 1` 这一层：子调用交回反转好的 `3 → 2`，而 `1.next` 还指着 2（现在是那段的尾巴）。
At the `head = 1` level, the child hands back a reversed `3 → 2`, and `1.next` still points at 2, now that part's tail.

- **反转 Reverse:** `head.next.next = head` 让 2 指回 1，`head.next = null` 让 1 成为新尾巴，得到 `3 → 2 → 1`。
  `head.next.next = head` points 2 back at 1, and `head.next = null` makes 1 the new tail: `3 → 2 → 1`.
- **返回新头 Return the new head:** 我接在**尾巴**上，头不受影响，还是 `newHead`。所以 `return newHead` 是本层自己推出来的，不是照搬。
  I joined at the **tail**, so the head is unaffected: still `newHead`. So `return newHead` is this level's own conclusion, not a blind copy.

> [!tip] 和 maxDepth 对比 Compare with Maximum Depth of Binary Tree (104)
> 两者都是“拿到子结果 → 结合自己 → 得出本层结果”，区别只在要不要加工：
> Both are "take the child's result → combine with yourself → this level's result". The only difference is whether the result needs processing:
>
> ```java
> return Math.max(l, r) + 1;   // maxDepth: 子结果要加工（+1） the child result is processed (+1)
> return newHead;              // reverseList: 恰好不用加工 happens to need no processing
> ```
>
> 必须把新头交上去：最外层调用者只拿着原来的 1，而它现在是尾巴。
> The new head must be handed up: the top-level caller only holds the original 1, which is now the tail.

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

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 空链表 Empty list (`head == null`): 迭代版不进循环，返回 `prev = null`；递归版由 `head == null` 直接返回 → iterative skips the loop and returns `null`; recursive returns at the `head == null` check
- [x] 只有一个节点 Single node: 两种写法都原样返回 `head` → both return `head` as is
- [x] ⚠️ 先存 `next` 再改指针 Save `next` before rewiring: 如果先写 `curr.next = prev`，后面的节点就丢了 → write `curr.next = prev` first and the rest of the list is lost
- [x] ⚠️ 返回 `prev` 而不是 `curr` Return `prev`, not `curr`: 循环结束时 `curr` 一定是 `null` → `curr` is always `null` when the loop ends
- [x] ⚠️ 递归版不能省 `head.next = null` Don't drop `head.next = null`: 省掉的话最后 1 和 2 互相指向，形成环，打印或遍历时死循环 → without it, 1 and 2 point at each other, forming a cycle and an infinite loop when traversed
- [x] ⚠️ 递归的 base case 必须包含 `head == null` The base case must cover `head == null`: 只写 `head.next == null` 的话，空链表输入时 `null.next` 抛空指针异常 → with only `head.next == null`, an empty input throws an NPE
- [x] 递归深度 Recursion depth: 每个节点一层，n ≤ 5000 时 JVM 默认栈通常够用；链表长到十万级时可能 `StackOverflowError`，用迭代版 → one frame per node; fine at n ≤ 5000 with the default JVM stack, but a list in the hundreds of thousands can overflow, so use the iterative version

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 92. Reverse Linked List II | 只反转第 `left` 到 `right` 个节点，需要 dummy 头和接回两端 reverse only positions `left..right`; needs a dummy head and reconnecting both ends |
| 25. Reverse Nodes in k-Group | 每 k 个一组反转，本题的循环套在外层循环里 reverse every k nodes; this loop inside an outer loop (Hard) |
| 24. Swap Nodes in Pairs | 两两交换，递归写法结构相似：先处理后面，再交换这一对接上去 swap pairs; the recursive version has a similar shape (recurse on the rest, then swap this pair onto it) |
| 234. Palindrome Linked List | 快慢指针找中点，再反转后半段比较 find the middle with fast/slow pointers, reverse the second half, compare |
| 143. Reorder List | 找中点 + 反转后半段 + 交替合并 middle + reverse + merge |
| [[Merge Two Sorted Lists\|21. 合并两个有序链表 Merge Two Sorted Lists]] | 同样能用迭代（dummy 头）或递归写，但递归把自己接在前面、返回自己 also iterative (dummy head) or recursive, but its recursion attaches in front and returns itself |

## 7. ❓ 复习题 Review Questions

**Q1.** 迭代版为什么一定要先 `ListNode next = curr.next`？ Why must the iterative version save `curr.next` first?

> [!success]- 答案 Answer
> 单链表只能往后走。`curr.next = prev` 之后，`curr` 和后面节点的唯一联系就断了，不提前存下来就找不到下一个节点。
> A singly linked list only goes forward. After `curr.next = prev`, the only link from `curr` to the rest is gone, so without saving it you can't reach the next node.

**Q2.** 递归版里，为什么每一层都能直接 `return newHead`？ Why can every level just `return newHead`?

> [!success]- 答案 Answer
> 按合同，`newHead` 是子链表反转后的头。本层把自己接到子链表的**尾巴**上，头不变，所以整条链表反转后的头还是 `newHead`。这是每一层自己推出来的，不是“照搬”。
> By contract, `newHead` is the head of the reversed sublist. This level attaches itself at the sublist's **tail**, so the head doesn't change and the whole reversed list's head is still `newHead`. Each level deduces this itself.

**Q3.** `head.next.next = head` 是什么意思？为什么这时 `head.next` 还能用？ What does `head.next.next = head` mean, and why is `head.next` still valid?

> [!success]- 答案 Answer
> 子调用只改了从 `head.next` 开始的那一段，没碰 `head` 本身，所以 `head.next` 仍指向原来的下一个节点，而它现在是反转后子链表的尾巴。`head.next.next = head` 就是让这个尾巴指回我。
> The child call only rewired the part starting at `head.next` and never touched `head`, so `head.next` still points at the old next node, which is now the reversed sublist's tail. `head.next.next = head` makes that tail point back at me.

**Q4.** 两种写法的空间复杂度分别是多少？ What's the space complexity of each?

> [!success]- 答案 Answer
> 迭代 O(1)，只有几个指针。递归 O(n)，因为递归深度是 n，每层在[[栈 Stack|调用栈]]上占一帧，即使没有 `new` 任何对象。
> Iterative is O(1): a few pointers. Recursive is O(n): recursion depth is n and each level takes a frame on the call stack, even though nothing is allocated with `new`.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[链表 Linked List|链表 Linked List]]（指针反转 pointer reversal） · [[递归 Recursion|递归 Recursion]]（相信合同、后序处理 trust the contract, post-order work） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（递归栈也算空间 the recursion stack counts）
- 上一题 Previous: [[Min Stack|155. 最小栈 Min Stack]]（栈；递归本身跑在调用栈上 stacks; recursion runs on the call stack）
- 下一题 Next: [[Design Singly Linked List|设计单链表 Design Singly Linked List]]（自己实现链表：哑节点、尾指针、停在前一个删除 build the list yourself: dummy head, tail pointer, remove from the predecessor）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-26 |  | ✅ | 迭代先存 next 再调头；递归按合同用 newHead，自己接尾巴所以头不变 Save next before flipping; in the recursion, newHead is the contract's result and I join at the tail, so the head stays |
