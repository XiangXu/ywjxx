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
> **递归：** 合同是“`mergeTwoLists(a, b)` 返回 `a`、`b` 合并后的头”。两条链表的头里**较小的那个一定是结果的头**，所以本层选出它，让它的 `next` 等于“剩下的部分合并好的结果”（相信子调用），然后返回它自己。有一条为空就直接返回另一条。**迭代：** 用哑节点 `dummyHead` 和尾指针 `curr`，每次把较小的节点接到尾巴上；一条走完后，把另一条剩下的整段直接接上。
> **Recursive:** the contract is "`mergeTwoLists(a, b)` returns the head of `a` and `b` merged". **The smaller of the two heads must be the merged list's head**, so this level picks it, sets its `next` to "the rest, merged" (trusting the child call), and returns itself. If either list is empty, return the other. **Iterative:** keep a `dummyHead` and a tail pointer `curr`, attach the smaller node to the tail each step, and once one list runs out, attach the rest of the other in one go.
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

把两条链表的值全部倒进一个数组，排序，再新建一条链表。
Dump every value from both lists into an array, sort it, and build a new list.

```java
public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    List<Integer> vals = new ArrayList<>();
    for (ListNode p = list1; p != null; p = p.next) vals.add(p.val);
    for (ListNode p = list2; p != null; p = p.next) vals.add(p.val);
    Collections.sort(vals);                     // 没用上“已经有序” ignores that the inputs are sorted

    ListNode dummy = new ListNode();
    ListNode tail = dummy;
    for (int v : vals) {
        tail.next = new ListNode(v);            // 新建节点 new nodes
        tail = tail.next;
    }
    return dummy.next;
}
```

- ⏱️ Time: O((n + m) log(n + m))，排序 sorting
- 🗄️ Space: O(n + m)，数组和新节点 the array and the new nodes
- 浪费了题目给的“已经有序”这个条件；而且题目要求拼接原节点，这样写不符合题意。
  It wastes the fact that both inputs are already sorted, and it creates new nodes instead of splicing the existing ones as the problem asks.

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

#### 4.1.1 用三个问题拆解 The three questions

[[递归 Recursion|递归 Recursion]] 里说写递归只需回答三个问题，本题的答案：
The recursion note says every recursive function answers three questions. Here are this problem's answers:

| 问题 Question | 本题 This problem |
| --- | --- |
| ① 合同 Contract | `mergeTwoLists(a, b)` 把有序链表 `a` 和 `b` 合并，返回**合并后的头** merges sorted lists `a` and `b` and returns **the merged head** |
| ② 出口 Base case | `a` 为空 → 返回 `b`；`b` 为空 → 返回 `a`（两条都空时返回 `null`，也对） `a` empty → return `b`; `b` empty → return `a` (both empty returns `null`, also correct) |
| ③ 本层 This level | 较小的头当结果的头；它的 `next` = 子调用合并剩下部分的结果；返回它 the smaller head leads; its `next` = the child's merge of the rest; return it |

**出口为何够用 Why these base cases are enough:** 每次调用都从某一条链表拿走一个节点，所以总长度每次减 1，迟早有一条变空。一条空了，合并结果显然就是另一条，而且另一条剩下的部分本身已经有序、已经串好，不用再一个个走。
Every call takes one node off one of the lists, so the total length drops by one each time and eventually one list is empty. Merging with an empty list obviously gives the other list, which is already sorted and linked, so there's no need to walk it node by node.

#### 4.1.2 本层只做两件事 This level does two things

```
本层 This level (list1 = 1a, list2 = 1b):

  list1: 1a → 2a → 4a          ① 选 Choose: 1a ≤ 1b，所以 1a 是结果的头 so 1a is the head
  list2: 1b → 3b → 4b

  ② 连 Connect: 1a.next = mergeTwoLists(2a → 4a, 1b → 3b → 4b)
                         └──────── 子调用交回 child returns: 1b → 2a → 3b → 4a → 4b

  结果 Result: 1a → 1b → 2a → 3b → 4a → 4b      返回 return 1a
```

- **选在调用前 Choose (before the call):** 比较两个头，决定谁是本层的节点。这一步只看 `list1.val` 和 `list2.val`，不需要知道后面长什么样。
  Compare the two heads and decide which node belongs to this level. It only looks at `list1.val` and `list2.val`; the rest doesn't matter yet.
- **连在调用后 Connect (after the call):** 子调用按合同交回“剩下部分合并好的头”，把它接在自己后面。
  The child returns "the head of the rest, merged", and this level hangs it after itself.

本层**不关心**子调用里面是怎么比较、怎么接的，只关心它交回来的是一条合并好的有序链表，并且里面每个值都 ≥ 本层的值（因为本层选的是两个头里最小的）。所以接上之后整条链表仍然有序。
This level **doesn't care** how the child compares and links; it only needs the child's result to be a sorted merged list whose values are all ≥ this level's value (this level took the smallest of the two heads). So after connecting, the whole list is still sorted.

#### 4.1.3 走一遍 Trace

> [!example] 走一遍 Trace: `list1 = 1a → 2a → 4a`，`list2 = 1b → 3b → 4b`
>
> `a` / `b` 标出节点来自哪条链表。先一路“递”下去，每层选一个节点；到一条为空时触底；再一路“归”回来，每层把子结果接到自己后面。
> `a` / `b` mark which list a node came from. Going down, each level picks one node; it bottoms out when one list is empty; unwinding, each level hangs the child's result after itself.
>
> | 层 Level | `list1` | `list2` | 选 Chosen | 子调用交回 Child returns | 本层做的事 This level's work | 返回 Returns |
> | --- | --- | --- | --- | --- | --- | --- |
> | 1 | `1a→2a→4a` | `1b→3b→4b` | 1a（相等时 list1 优先 ties favor list1） | `1b→2a→3b→4a→4b` | `1a.next = 1b…` | 1a |
> | 2 | `2a→4a` | `1b→3b→4b` | 1b | `2a→3b→4a→4b` | `1b.next = 2a…` | 1b |
> | 3 | `2a→4a` | `3b→4b` | 2a | `3b→4a→4b` | `2a.next = 3b…` | 2a |
> | 4 | `4a` | `3b→4b` | 3b | `4a→4b` | `3b.next = 4a…` | 3b |
> | 5 | `4a` | `4b` | 4a（相等时 list1 优先 ties favor list1） | `4b` | `4a.next = 4b` | 4a |
> | 6 | `null` | `4b` | 触底 base case | — | 无 none | 4b |
>
> 从下往上看“返回”这一列：`4b`、`4a`、`3b`、`2a`、`1b`、`1a`，链表是**从尾巴往头**一节一节接起来的，最外层拿到的 1a 就是整条链表的头。
> Read the Returns column bottom-up: `4b`, `4a`, `3b`, `2a`, `1b`, `1a`. The list is linked **from the tail back to the head**, and the outermost call ends up with 1a, the head of the whole list.

调用栈的样子 What the call stack looks like:

```
merge(1a, 1b)                          ┐
  merge(2a, 1b)                        │
    merge(2a, 3b)                      │ 递 going down：每层选一个 each level picks one
      merge(4a, 3b)                    │
        merge(4a, 4b)                  │
          merge(null, 4b) → 返回 4b     ┘ 触底 base case
        ← 4a.next = 4b，返回 4a          ┐
      ← 3b.next = 4a，返回 3b            │ 归 unwinding：每层接上子结果 each level connects
    ← 2a.next = 3b，返回 2a              │
  ← 1b.next = 2a，返回 1b                │
← 1a.next = 1b，返回 1a                  ┘
```

#### 4.1.4 和 206 反转链表对比 Compared with 206

两道题都是“拿到子结果 → 结合自己 → 返回本层结果”，但**自己接在哪**不一样，所以返回值也不一样：
Both are "take the child's result → combine with yourself → return this level's result", but **where you attach** differs, and so does the return value:

| | [[Reverse Linked List\|206. 反转链表 Reverse Linked List]] | 21. 合并 Merge |
| --- | --- | --- |
| 子调用交回 Child returns | 反转好的后半段 the reversed rest | 合并好的剩余部分 the merged rest |
| 本层接在 This level attaches | 子链表的**尾巴** at the child's **tail** | 子链表的**前面** in **front** of the child |
| 返回 Returns | `newHead`（头没变，原样传上去 head unchanged, passed up） | `list1` / `list2`（我自己就是新头 I am the new head） |
| 本层的活在 Work happens | 全在调用之后（后序） all after the call (post-order) | 选在调用前，连在调用后 choose before, connect after |

[[递归 Recursion|递归 Recursion]] 复习题 Q2 说“如果本层改的是头部，返回值就要变”，本题就是这个例子：本层把自己放在最前面，所以返回自己，而不是子调用的结果。
Recursion note Q2 says "if the level changed the front, the return value would have to change"; this problem is that case: this level puts itself in front, so it returns itself, not the child's result.

#### 4.1.5 容易卡住的几个细节 Details that trip people up

> [!important] 为什么 `list1.next = mergeTwoLists(...)` 不会丢节点 Why `list1.next = mergeTwoLists(...)` doesn't lose nodes
> 看起来像是“在用 `list1.next` 的同时又覆盖它”。Java 的执行顺序是：先求出右边，也就是先把**旧的** `list1.next` 作为参数传进去，等子调用全部返回之后，才把结果赋给 `list1.next`。所以旧的后续节点已经交给子调用处理了，不会丢。
> It looks like `list1.next` is read and overwritten at the same time. Java evaluates the right-hand side first: the **old** `list1.next` is passed in as an argument, and only after the child call fully returns is the result assigned to `list1.next`. The old successors were already handed to the child, so nothing is lost.

> [!note] 为什么只看头、不用看后面 Why only the heads matter
> 两条链表都有序，`list1` 的头是 `list1` 里最小的，`list2` 的头是 `list2` 里最小的，两者中较小的就是全部节点里最小的。这就是本层敢直接把它定为结果头的原因。如果输入不是有序的，这个推理就不成立了。
> Both lists are sorted, so each head is its own list's minimum, and the smaller head is the minimum of all nodes. That's why this level can safely make it the result's head. If the inputs weren't sorted, the reasoning would break.

> [!tip] `<=` 还是 `<`？ `<=` or `<`?
> 写 `<` 结果也是对的，只是值相等时先取 `list2`。用 `<=` 时相等先取 `list1`，相同值保持“`list1` 在前”的顺序，这叫**稳定**。对 `int` 看不出区别；但如果是按某个字段给对象做归并排序，稳定性就有意义。
> `<` also gives a correct result; it just takes `list2` first on ties. With `<=`, ties take `list1` first, so equal values keep "`list1` first" order: the merge is **stable**. With `int` you can't tell the difference, but when merge-sorting objects by a key, stability matters.

> [!note] 递归在“改”原链表 The recursion rewires the input
> 两种写法都没有 `new` 新节点，而是改原节点的 `next`。合并之后 `list1`、`list2` 原来的样子就没了。题目要求拼接，所以没问题；但实际代码里如果调用者还要用原链表，要注意。
> Neither version creates nodes; both rewrite the existing nodes' `next`. After merging, the original `list1` and `list2` are gone. That's what the problem asks for, but in real code, watch out if the caller still needs the original lists.

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
> 和递归选节点的顺序完全一样，区别是迭代**从头往尾**接，递归**从尾往头**接。
> The nodes are picked in exactly the same order as the recursion; the iteration links **head to tail**, the recursion **tail to head**.

> [!tip] 为什么迭代需要哑节点，递归不需要 Why the iteration needs a dummy and the recursion doesn't
> 迭代是从前往后接，第一个节点之前没有“尾巴”可接，所以放一个哑节点当初始尾巴，省掉“结果还空着”的特判，最后返回 `dummyHead.next`。递归是从后往前接，每层**返回**自己作为头，返回值本身就扮演了 `dummyHead.next` 的角色。
> The iteration links front to back, and before the first node there's no tail to attach to, so a dummy serves as the initial tail, removing the "result is still empty" special case; return `dummyHead.next`. The recursion links back to front and each level **returns** itself as the head, so the return value plays the role of `dummyHead.next`.

### 4.3 其他写法 Alternatives

> [!note] 其他写法 Alternatives
> **收尾可以写成一行 The finish can be one line:** 循环结束时最多一条非空，两条都空时接 `null` 也没问题，所以 `if / else if` 可以合并。
> When the loop ends, at most one list is non-empty, and attaching `null` when both are empty is harmless, so the `if / else if` collapses to one line.
> ```java
> curr.next = (list1 != null) ? list1 : list2;
> ```
> **递归的另一种写法 A shorter recursive shape:** 先保证 `list1` 的头更小，然后只写一个分支。思路相同，只是少一个分支。
> Swap so `list1` always has the smaller head, then write one branch. Same idea, one branch fewer.
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
> 注意这个版本**不稳定**：只有顶层相等时取 `list1`，但交换之后递归调用的参数顺序就反了，之后再遇到相等值会先取原来的 `list2`。例如 `[1a, 3a]` 和 `[0b, 1b]`，结果里 1b 会排在 1a 前面。需要稳定时用原写法。
> This version is **not stable**: only the top-level tie favors `list1`; after a swap the recursive call gets its arguments in reversed order, so later ties take the original `list2` first. With `[1a, 3a]` and `[0b, 1b]`, 1b ends up before 1a. Use the original shape when stability matters.
>
> 面试里两种都常见。迭代 O(1) 空间、没有栈溢出风险，适合很长的链表；递归更短、更好讲清楚，适合展示递归思维。本题 n + m ≤ 100，两种都没问题。
> Both are common in interviews. The iterative version uses O(1) space with no overflow risk, better for long lists; the recursive one is shorter and easier to explain, good for showing recursive thinking. With n + m ≤ 100, either is fine here.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 两条都空 Both empty: 递归在第一个出口返回 `list2 = null`；迭代不进循环，返回的 `dummyHead.next` 就是空 → recursive returns `list2 = null` at the first check; iterative skips the loop and returns `null`
- [x] 一条为空 One empty: 直接返回另一条 → return the other one as is
- [x] 长度不同 Different lengths: 一条先走完，另一条剩下的整段直接接上，不用逐个走 → when one runs out, attach the rest of the other in one step
- [x] 值相等 Equal values: `<=` 先取 `list1`，结果稳定；写 `<` 也对 → `<=` takes `list1` first (stable); `<` is also correct
- [x] ⚠️ 迭代版别忘了 Don't forget `curr = curr.next`: 尾巴不前进的话，每次都覆盖 `dummyHead.next`，最后收尾又把它覆盖成剩余部分，之前选的节点全丢了 → without it, every step overwrites `dummyHead.next`, and the final attach overwrites it again, so only the leftover run survives
- [x] ⚠️ 返回哑节点的下一个 Return `dummyHead.next`, not `dummyHead`: 返回 `dummyHead` 的话，结果开头多一个值为 0 的假节点 → otherwise the result starts with a fake 0
- [x] ⚠️ 别直接返回子调用 Don't return the child call directly: 写成 `return mergeTwoLists(list1.next, list2);` 会把选中的 `list1` 丢掉，要先接到 `list1.next` 再返回 `list1` 本身 → that drops the chosen node; hang the result on `list1.next`, then return `list1`
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

**Q2.** 为什么本层可以放心地把较小的头当成结果的头？ Why can this level make the smaller head the result's head?

> [!success]- 答案 Answer
> 两条链表都有序，每个头都是自己那条里最小的，所以两个头中较小的就是所有节点里最小的，一定排在最前面。
> Both lists are sorted, so each head is its own list's minimum, and the smaller head is the minimum of all nodes; it must come first.

**Q3.** 206 的递归返回 `newHead`，这题却返回 `list1` 或 `list2` 自己，为什么？ Why does 206 return `newHead` while this returns `list1` or `list2` itself?

> [!success]- 答案 Answer
> 206 里本层把自己接在子链表的**尾巴**上，头没变，所以把子调用交回的头原样返回。本题本层把自己放在子链表的**前面**，自己成了新头，所以返回自己。
> In 206, this level attaches at the child's **tail**, so the head is unchanged and the child's head is passed up. Here, this level goes in **front** of the child's list and becomes the new head, so it returns itself.

**Q4.** `list1.next = mergeTwoLists(list1.next, list2)` 会不会把 `list1` 后面的节点弄丢？ Does this line lose the nodes after `list1`?

> [!success]- 答案 Answer
> 不会。Java 先求右边：旧的 `list1.next` 作为参数传进子调用，子调用把它们合并好后返回，才赋给 `list1.next`。后面的节点在赋值之前已经交出去了。
> No. Java evaluates the right side first: the old `list1.next` is passed into the child call, which merges those nodes and returns, and only then is the result assigned to `list1.next`. The successors were handed off before the assignment.

**Q5.** 两种写法的空间复杂度分别是多少？什么时候选迭代？ What's the space of each, and when do you pick the iteration?

> [!success]- 答案 Answer
> 迭代 O(1)：一个哑节点和几个指针。递归最坏 O(n + m)：每拿走一个节点就多一层调用栈。链表很长时（默认栈通常一万多层就可能 `StackOverflowError`，取决于栈大小）选迭代。
> Iterative is O(1): one dummy and a few pointers. Recursive is O(n + m) in the worst case: one stack frame per node consumed. For very long lists, iterate: with the default stack, recursion often overflows somewhere past 10k frames, depending on the stack size.

**Q6.** 迭代版为什么用哑节点？递归版为什么不用？ Why does the iteration use a dummy, and why doesn't the recursion?

> [!success]- 答案 Answer
> 迭代从前往后接，开始时结果为空，没有尾巴可接；哑节点充当初始尾巴，省掉特判，最后返回 `dummyHead.next`。递归从后往前接，每层返回自己当头，返回值就起到了 `dummyHead.next` 的作用。
> The iteration links front to back and starts with an empty result, so there's no tail to attach to; the dummy acts as the first tail, removing the special case, and you return `dummyHead.next`. The recursion links back to front and each level returns itself as the head, so the return value does the job of `dummyHead.next`.

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
