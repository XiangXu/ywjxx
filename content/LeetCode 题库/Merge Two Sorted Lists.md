---
title: "21. 合并两个有序链表 Merge Two Sorted Lists"
aliases:
  - 合并两个有序链表
  - LeetCode 21
  - Merge Two Sorted Lists
  - Merge Two Sorted Linked Lists
tags:
  - LeetCode
  - Interview-Prep
  - Linked-List
  - Recursion
  - Two-Pointers
difficulty: Easy
pattern: "Linked List / Merge (Recursive + Dummy Head Iterative)"
link: https://leetcode.com/problems/merge-two-sorted-lists/
status: 🟡 review
created: 2026-10-27
publish: true
last-reviewed: 2026-10-27
---

# 🔀 21. Merge Two Sorted Lists

> [!abstract] TL;DR
> **递归：** 两条链表的头里**较小的那个一定是结果的头**，本层选出它，让它的 `next` 等于“剩下的部分合并好的结果”（相信子调用），然后返回它自己；有一条为空就返回另一条。**迭代：** 哑节点 `dummyHead` 加尾指针 `curr`，每次把较小的节点接到尾巴上；一条走完后，把另一条剩下的整段直接接上。
> **Recursive:** **the smaller of the two heads must be the merged list's head**, so this level picks it, sets its `next` to "the rest, merged" (trusting the child call), and returns itself; if either list is empty, return the other. **Iterative:** a `dummyHead` plus a tail pointer `curr`, attach the smaller node to the tail each step, and once one list runs out, attach the rest of the other in one go.
>
> ⏱️ O(n + m) · 🗄️ 迭代 O(1) / 递归 O(n + m) 调用栈 Iterative O(1) / recursive O(n + m) call stack

## 1. 📋 题目 Problem

给定两个**升序**链表的头节点 `list1` 和 `list2`，把它们合并成一个升序链表并返回头节点。新链表由两条链表的节点**拼接**而成，不用新建节点。
Given the heads of two **sorted** (non-decreasing) linked lists `list1` and `list2`, merge them into one sorted list and return its head. The result is made by **splicing together** the existing nodes; no new nodes are needed.

| Input | Output |
| --- | --- |
| `list1 = [1, 2, 4]`, `list2 = [1, 3, 4]` | `[1, 1, 2, 3, 4, 4]` |
| `list1 = []`, `list2 = []` | `[]` |
| `list1 = []`, `list2 = [0]` | `[0]` |

约束 Constraints: 每条链表的节点数在 `[0, 50]` 范围内；`-100 <= Node.val <= 100`；两条链表都是非递减的。
Each list has `[0, 50]` nodes; `-100 <= Node.val <= 100`; both lists are sorted in non-decreasing order.

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

- **关键观察 Key insight:** 两条链表都已经有序，所以合并结果的**第一个节点**一定是两个头里较小的那个。拿走它之后，剩下的问题还是“合并两条有序链表”，只是短了一个节点。
  Both lists are sorted, so the merged list's **first node** must be the smaller of the two heads. Take it away and what's left is still "merge two sorted lists", just one node shorter.
- **两种写法 Two ways to use that:**
  - 递归：这正是“同样的问题、规模更小”，直接交给[[递归 Recursion|递归 Recursion]]。
    Recursive: that's exactly "the same problem, but smaller", so hand it to recursion.
  - 迭代：两条链表各放一个指针，像拉拉链一样每次取较小的接到结果尾部，这是归并排序里 merge 那一步。
    Iterative: one pointer per list, zipping them together by always taking the smaller node, the same merge step as in merge sort.
- **套路 Pattern:** 链表拼接 + 哑节点（迭代），或“选一个 + 相信子调用”（递归）。
  Linked-list splicing with a dummy head (iterative), or "pick one, trust the child call" (recursive).

## 3. 🐢 暴力解 Brute Force

把两条链表的值全部倒进一个数组，排序，再新建一条链表。O((n + m) log(n + m)) 时间、O(n + m) 空间；浪费了“已经有序”这个条件，而且新建节点不符合“拼接原节点”的题意。
Dump every value from both lists into an array, sort it, and build a new list. O((n + m) log(n + m)) time, O(n + m) space; it wastes the fact that the inputs are sorted and creates new nodes instead of splicing the existing ones.

## 4. 🚀 最优解 Optimal Solution

### 4.1 递归 Recursive

我的解法 (My solution, Java):

```java
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        if (list1 == null) {                    // 出口：一条空了，结果就是另一条 base case: one is empty, the answer is the other
            return list2;
        }

        if (list2 == null) {
            return list1;
        }

        if (list1.val <= list2.val) {           // list1 的头更小，它就是结果的头 list1's head is smaller, so it heads the result
            list1.next = mergeTwoLists(list1.next, list2);  // 相信它：剩下的合并好了，接在我后面 trust it: the rest comes back merged; hang it after me
            return list1;                       // 我在最前面，所以我是头 I'm at the front, so I'm the head
        } else {                                // 对称 symmetric
            list2.next = mergeTwoLists(list1, list2.next);
            return list2;
        }
    }
}
```

- ⏱️ Time: O(n + m)，每次调用 O(1)，每次调用拿走一个节点 each call is O(1) and consumes one node
- 🗄️ Space: O(n + m)，最坏情况下递归深度等于节点总数 worst-case recursion depth is n + m on the [[栈 Stack|call stack]]（本题 n + m ≤ 100，完全没问题 at most 100 here, no problem）

**三个问题 The three questions:** ① 合同：返回 `a`、`b` 合并后的头；② 出口：一条为空返回另一条（两条都空返回 `null` 也对）；③ 本层：较小的头当结果的头，`next` 交给子调用，返回自己。每次调用拿走一个节点，总长度每次减 1，迟早有一条变空，所以出口够用（见 [[递归 Recursion|递归 Recursion]]）。
① Contract: return the head of `a` and `b` merged; ② base case: one list empty, return the other (both empty returns `null`, also correct); ③ this level: the smaller head leads, its `next` comes from the child call, return yourself. Every call consumes one node, so one list eventually empties and the base cases are enough (see [[递归 Recursion|递归 Recursion]]).

> [!important] 和 206 反转链表对比 Compared with 206
> 两道题都是“拿到子结果 → 结合自己 → 返回”，但 [[Reverse Linked List|206. 反转链表 Reverse Linked List]] 把自己接在子链表的**尾巴**上，头没变，所以原样返回 `newHead`；本题把自己放在子链表**前面**，自己成了新头，所以返回自己。
> Both are "take the child's result → combine with yourself → return", but 206 attaches itself at the child's **tail**, so the head is unchanged and `newHead` is passed up; here this level goes in **front** of the child's list, becomes the new head, and returns itself.

### 4.2 迭代 Iterative (dummy head)

我的解法 (My solution, Java):

```java
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummyHead = new ListNode();    // 哑节点：结果的“前一个”，不存数据 dummy: the result's predecessor, holds no data
        ListNode curr = dummyHead;              // 结果链表的尾巴 the tail of the result

        while(list1 != null && list2 != null) {
            if(list1.val <= list2.val) {        // 取较小的接到尾巴上 attach the smaller node to the tail
                curr.next = list1;
                list1 = list1.next;
            }
            else {
                curr.next = list2;
                list2 = list2.next;
            }

            curr = curr.next;                   // 尾巴前进 advance the tail
        }

        if(list1 != null) {                     // 剩下的整段已经有序，直接接上 the leftover run is already sorted; attach it whole
            curr.next = list1;
        }
        else if(list2 != null) {
            curr.next = list2;
        }

        return dummyHead.next;                  // 真正的头在哑节点后面 the real head is after the dummy
    }
}
```

- ⏱️ Time: O(n + m)，最多 n + m 次循环 at most n + m iterations（剩余部分 O(1) 接上 the leftover attaches in O(1)）
- 🗄️ Space: O(1)，一个哑节点和几个指针 one dummy node and a few pointers

> [!example] 走一遍 Trace: `list1 = 1a → 2a → 4a`，`list2 = 1b → 3b → 4b`
>
> | 步骤 Step | 比较 Compare | 接上 Attach | 结果 Result（`dummy` 之后 after `dummy`） | `list1` | `list2` |
> | --- | --- | --- | --- | --- | --- |
> | 开始 Start | | | 空 empty | 1a | 1b |
> | 1 | 1 ≤ 1 | 1a | `1a` | 2a | 1b |
> | 2 | 2 > 1 | 1b | `1a→1b` | 2a | 3b |
> | 3 | 2 ≤ 3 | 2a | `1a→1b→2a` | 4a | 3b |
> | 4 | 4 > 3 | 3b | `…→2a→3b` | 4a | 4b |
> | 5 | 4 ≤ 4 | 4a | `…→3b→4a` | `null` | 4b |
> | 收尾 Finish | | 4b（剩下的整段 the leftover） | `1a→1b→2a→3b→4a→4b` | | |
>
> 和递归选节点的顺序完全一样，区别是迭代**从头往尾**接，递归**从尾往头**接。迭代需要哑节点，因为第一个节点之前没有“尾巴”可接；递归每层**返回**自己当头，返回值就扮演了 `dummyHead.next` 的角色。
> The nodes are picked in exactly the same order as the recursion; the iteration links **head to tail**, the recursion **tail to head**. The iteration needs a dummy because there's no tail to attach to before the first node; the recursion **returns** itself as the head, so the return value plays the role of `dummyHead.next`.

> [!note] 其他写法 Alternatives
> **收尾一行 One-line finish:** 循环结束时最多一条非空，接 `null` 也无害 at most one list is non-empty when the loop ends, and attaching `null` is harmless
> ```java
> curr.next = (list1 != null) ? list1 : list2;
> ```
> **递归只写一个分支 One-branch recursion:** 先交换让 `list1` 的头更小，再只写一个分支。注意这个版本**不稳定**：交换后参数顺序反了，之后的相等值会先取原来的 `list2`（`[1a, 3a]` 和 `[0b, 1b]` 得到 1b 在 1a 前面）。
> Swap so `list1` has the smaller head, then write one branch. This version is **not stable**: after a swap the arguments are reversed, so later ties take the original `list2` first (`[1a, 3a]` and `[0b, 1b]` put 1b before 1a).
> ```java
> public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
>     if (list1 == null) return list2;
>     if (list2 == null) return list1;
>     if (list1.val > list2.val) {          // 交换，让 list1 的头更小 swap so list1 has the smaller head
>         ListNode tmp = list1; list1 = list2; list2 = tmp;
>     }
>     list1.next = mergeTwoLists(list1.next, list2);
>     return list1;
> }
> ```

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 两条都空 / 一条为空 Both or one empty: 返回另一条（都空时是 `null`）；迭代不进循环，`dummyHead.next` 就是 `null` → return the other (`null` when both are empty); the iteration skips the loop and `dummyHead.next` is `null`
- [x] 长度不同 Different lengths: 一条先走完，另一条剩下的整段直接接上，不用逐个走 → when one runs out, attach the rest of the other in one step
- [x] 值相等 Equal values: `<=` 先取 `list1`，相同值保持原来的先后（**稳定**），按字段给对象归并排序时才看得出来；写 `<` 也对 → `<=` takes `list1` first, keeping equal values in their original order (**stable**), which only matters when merge-sorting objects by a key; `<` is also correct
- [x] ⚠️ 迭代版别忘了 Don't forget `curr = curr.next`: 尾巴不前进的话，每次都覆盖 `dummyHead.next`，之前选的节点全丢了 → without it, every step overwrites `dummyHead.next` and the chosen nodes are lost
- [x] ⚠️ 返回哑节点的下一个 Return `dummyHead.next`, not `dummyHead`: 否则结果开头多一个值为 0 的假节点 → otherwise the result starts with a fake 0
- [x] ⚠️ 别直接返回子调用 Don't return the child call directly: `return mergeTwoLists(list1.next, list2);` 会把选中的 `list1` 丢掉，要先接到 `list1.next` 再返回 `list1` → that drops the chosen node; hang the result on `list1.next`, then return `list1`
- [x] 递归深度 Recursion depth: 最坏 n + m 层，本题最多 100 层；合并很长的链表（比如在归并排序里）时用迭代版 → worst case n + m frames, at most 100 here; for very long lists (e.g. inside merge sort) use the iterative version

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 23. Merge k Sorted Lists | k 条链表：用最小堆每次取最小的，或两两合并（分治），都要用到本题 k lists: a min-heap picking the smallest, or pairwise merging (divide and conquer), both built on this problem (Hard) |
| 148. Sort List | 链表归并排序：快慢指针找中点拆开，递归排序两半，再用本题合并 merge sort on a list: split at the middle with fast/slow pointers, sort each half, merge with this |
| 88. Merge Sorted Array | 数组版合并：从后往前填，避免覆盖还没用到的元素 the array version: fill from the back so you don't overwrite unread elements |
| 2. Add Two Numbers | 同样是两条链表同步走 + 哑节点拼新链表 also walks two lists in step with a dummy head |
| 143. Reorder List | 找中点 + [[Reverse Linked List\|反转 reverse]] + 交替合并 middle + reverse + alternating merge |

## 7. ❓ 复习题 Review Questions

**Q1.** 递归版的合同是什么？两个出口为什么够用？ What's the recursive contract, and why are the two base cases enough?

> [!success]- 答案 Answer
> 合同：`mergeTwoLists(a, b)` 返回 `a`、`b` 合并后的有序链表的头。每次调用都拿走一个节点，总长度一直减小，最终一定有一条变空；和空链表合并的结果就是另一条，它本身已经有序，直接返回即可。两条都空时第一个出口返回 `null`，也是对的。
> Contract: return the head of `a` and `b` merged into one sorted list. Each call consumes a node, so the total length shrinks and one list eventually becomes empty; merging with an empty list gives the other list, already sorted, so return it. When both are empty, the first check returns `null`, which is also correct.

**Q2.** 206 的递归返回 `newHead`，这题却返回 `list1` 或 `list2` 自己，为什么？ Why does 206 return `newHead` while this returns `list1` or `list2` itself?

> [!success]- 答案 Answer
> 206 里本层把自己接在子链表的**尾巴**上，头没变，所以把子调用交回的头原样返回。本题本层把自己放在子链表的**前面**，自己成了新头，所以返回自己。
> In 206, this level attaches at the child's **tail**, so the head is unchanged and the child's head is passed up. Here, this level goes in **front** of the child's list and becomes the new head, so it returns itself.

**Q3.** `list1.next = mergeTwoLists(list1.next, list2)` 会不会把 `list1` 后面的节点弄丢？ Does this line lose the nodes after `list1`?

> [!success]- 答案 Answer
> 不会。Java 先求右边：旧的 `list1.next` 先作为参数传进子调用，子调用返回后才赋给 `list1.next`。
> No. Java evaluates the right side first: the old `list1.next` is passed into the child call, and only after it returns is the result assigned to `list1.next`.

**Q4.** 两种写法的空间复杂度分别是多少？什么时候选迭代？ What's the space of each, and when do you pick the iteration?

> [!success]- 答案 Answer
> 迭代 O(1)：一个哑节点和几个指针。递归最坏 O(n + m)：每拿走一个节点就多一层调用栈。链表很长时（默认栈通常一万多层就可能 `StackOverflowError`，取决于栈大小）选迭代。
> Iterative is O(1): one dummy and a few pointers. Recursive is O(n + m) in the worst case: one stack frame per node consumed. For very long lists, iterate: with the default stack, recursion often overflows somewhere past 10k frames, depending on the stack size.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[链表 Linked List|链表 Linked List]]（哑节点拼新链表 dummy head to build a list） · [[递归 Recursion|递归 Recursion]]（选在前、连在后，返回自己 choose before, connect after, return yourself） · [[双指针 Two Pointers|双指针 Two Pointers]]（两条链表各一个指针 one pointer per list） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（迭代 O(1) / 递归 O(n + m) 空间 Iterative O(1) / recursive O(n + m) space）
- 对照 Compare with: [[Reverse Linked List|206. 反转链表 Reverse Linked List]]（同样两种写法，但递归接在尾巴上 the same two versions, but its recursion attaches at the tail）
- 上一题 Previous: [[Design Singly Linked List|设计单链表 Design Singly Linked List]]（哑节点和尾指针 dummy head and tail pointer）
- 下一题 Next: [[Design Linked List|707. 设计链表 Design Linked List]]（双向链表加双哨兵 a doubly linked list with two sentinels）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-27 |  | ✅ | 递归：较小的头就是结果的头，`next` 交给子调用，返回自己；迭代：哑节点 + 尾指针，剩下的整段直接接上 Recursive: the smaller head leads, its `next` comes from the child, return yourself; iterative: dummy + tail pointer, attach the leftover whole |
