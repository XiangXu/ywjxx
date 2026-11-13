---
title: "707. 设计链表 Design Linked List"
aliases:
  - 设计链表
  - LeetCode 707
  - Design Linked List
  - MyLinkedList
  - 哨兵节点
  - Sentinel Node
tags:
  - LeetCode
  - Interview-Prep
  - Linked-List
  - Doubly-Linked-List
  - Design
difficulty: Medium
pattern: "Design / Doubly Linked List (Two Sentinels)"
link: https://leetcode.com/problems/design-linked-list/
status: 🟡 review
created: 2026-10-29
publish: true
last-reviewed: 2026-10-29
---

# ⛓️ 707. Design Linked List

> [!abstract] TL;DR
> **双向链表**加**两个哨兵**（`dummyHead`、`dummyTail`，不存数据）：真实节点前后一定有节点，插入删除只改指针，不判 `null`，也不用维护尾指针。有了 `prev`，按下标的操作**直接停在第 `index` 个节点上**。把 `dummyTail` 看成**下标 `n`**：`get` / `deleteAtIndex` 必须落在真实节点上，`addAtIndex` 允许落在 `dummyTail` 上，就是追加。
> A **doubly linked list** with **two sentinels** (`dummyHead`, `dummyTail`, no data): every real node has neighbors on both sides, so insert and delete only rewire pointers, with no `null` checks and no tail pointer to maintain. With `prev`, index-based operations **stop on node `index` itself**. Treat `dummyTail` as **index `n`**: `get` / `deleteAtIndex` must land on a real node, while `addAtIndex` may land on `dummyTail`, which means append. ⏱️ `addAtHead` / `addAtTail` O(1), `get` / `addAtIndex` / `deleteAtIndex` O(i) · 🗄️ O(n)

## 1. 📋 题目 Problem

设计一个链表类 `MyLinkedList`，单链表或双向链表都可以，下标从 0 开始。不能用内置的 `LinkedList`。
Design a linked list class `MyLinkedList`, singly or doubly linked, with 0-indexed nodes. The built-in `LinkedList` is off limits.

| 方法 Method | 作用 Behavior |
| --- | --- |
| `MyLinkedList()` | 初始化空链表 Initialize an empty list |
| `int get(int index)` | 返回第 `index` 个节点的值，下标无效返回 `-1` Return the value of node `index`, or `-1` if the index is invalid |
| `void addAtHead(int val)` | 插到第一个节点前面，成为新的头 Insert before the first node; it becomes the new head |
| `void addAtTail(int val)` | 追加为最后一个节点 Append as the last node |
| `void addAtIndex(int index, int val)` | 插到第 `index` 个节点前面；等于长度时追加，大于长度时不插入 Insert before node `index`; append if `index` equals the length, do nothing if it's greater |
| `void deleteAtIndex(int index)` | 下标有效就删除第 `index` 个节点 Delete node `index` if the index is valid |

```
操作 Calls:  ["MyLinkedList", "addAtHead", "addAtTail", "addAtIndex", "get", "deleteAtIndex", "get"]
参数 Args:   [[], [1], [3], [1, 2], [1], [1], [1]]
输出 Output: [null, null, null, null, 2, null, 3]
```

约束 Constraints: 下标和值都在 `[0, 1000]` 范围内；五个操作总共最多调用 2000 次。
`index` and `val` are in `[0, 1000]`; there are at most 2000 calls in total across the five operations.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 在 [[Design Singly Linked List|设计单链表 Design Singly Linked List]] 里，删除必须停在前一个节点，因为单链表回不去。双向链表每个节点都有 `prev`，**站在目标本身上就能拿到前后两个邻居**，所以每个按下标的操作都是“走到第 `index` 个，就在这里动手”。
  In the singly linked version, removing must stop at the predecessor because you can't step back. In a doubly linked list every node has `prev`, so **standing on the target is enough to reach both neighbors**, and every index-based operation becomes "walk to node `index`, then act right there".
- **两个哨兵 Two sentinels:** 真实节点的 `prev` 和 `next` 永远不是 `null`，不用判断第一个、最后一个或空链表；最后一个节点永远是 `dummyTail.prev`，不用维护尾指针。把 `dummyHead` 看成**下标 -1**，`dummyTail` 看成**下标 `n`**，所有边界判断都在问“`curr` 落在了哪个下标上”。
  A real node's `prev` and `next` are never `null`, so there are no first-node, last-node or empty-list checks; the last node is always `dummyTail.prev`, so there's no tail pointer to maintain. Treat `dummyHead` as **index -1** and `dummyTail` as **index `n`**: every boundary check is asking "which index did `curr` land on?".
- **套路 Pattern:** 设计题 + 双向链表 + 哨兵节点。LRU 缓存（146）通常用的也是同一个结构。
  A design problem with a doubly linked list and sentinel nodes, typically the same structure behind the LRU cache (146).

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 用 `ArrayList<Integer>` 存值，`get` 是 O(1)，但头插和按下标插入删除都要平移后面的元素，O(n)。能通过，但这就变成了 [[Design Dynamic Array|设计动态数组 Design Dynamic Array]]。不加哨兵的单链表也能过，只是头尾都要特殊处理。
  Store the values in an `ArrayList<Integer>`: `get` is O(1), but head inserts and indexed inserts and deletes shift every later element, O(n). It passes, but it's just Design Dynamic Array. A singly linked list with no sentinel also passes, but needs special cases at both ends.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class ListNode {
    ListNode prev;
    ListNode next;
    int val;

    public ListNode(int val) {
        this.val = val;
        this.prev = null;
        this.next = null;
    }
}

class MyLinkedList {
    private ListNode dummyHead;   // 头哨兵，下标 -1 head sentinel, index -1
    private ListNode dummyTail;   // 尾哨兵，下标 n tail sentinel, index n

    public MyLinkedList() {
        this.dummyHead = new ListNode(0);
        this.dummyTail = new ListNode(0);
        dummyHead.next = dummyTail;   // 空链表：两个哨兵互相指 empty: the sentinels point at each other
        dummyTail.prev = dummyHead;
    }

    public int get(int index) {
        ListNode curr = dummyHead.next;           // 从第 0 个出发 start at node 0
        while (curr != null && index > 0) {       // 走 index 步 walk index steps
            curr = curr.next;
            index--;
        }
        if (curr != null && curr != dummyTail && index == 0) {  // 落在真实节点上 landed on a real node
            return curr.val;
        }

        return -1;                                // 越界 out of bounds
    }

    public void addAtHead(int val) {
        ListNode newHead = new ListNode(val);
        ListNode next = dummyHead.next;   // 原来的第 0 个，空链表时是 dummyTail old node 0, dummyTail if empty
        dummyHead.next = newHead;
        newHead.prev = dummyHead;
        newHead.next = next;
        next.prev = newHead;              // next 一定不是 null next is never null
    }

    public void addAtTail(int val) {
        ListNode newTail = new ListNode(val);
        ListNode prev = dummyTail.prev;   // 原来的最后一个，空链表时是 dummyHead old last node, dummyHead if empty
        prev.next = newTail;
        newTail.prev = prev;
        newTail.next = dummyTail;
        dummyTail.prev = newTail;
    }

    public void addAtIndex(int index, int val) {
        ListNode curr = dummyHead.next;
        while (curr != null && index > 0) {
            curr = curr.next;
            index--;
        }

        if (curr != null && index == 0) {        // curr 可以是 dummyTail：追加 curr may be dummyTail: append
            ListNode node = new ListNode(val);
            ListNode next = curr;                // 插在 curr 前面 insert before curr
            ListNode prev = curr.prev;
            node.prev = prev;
            node.next = next;
            prev.next = node;
            next.prev = node;
        }
    }

    public void deleteAtIndex(int index) {
        ListNode curr = dummyHead.next;
        while (curr != null && index > 0) {
            curr = curr.next;
            index--;
        }
        if (curr != null && curr != dummyTail && index == 0) {  // 不能删哨兵 never delete a sentinel
            ListNode next = curr.next;
            ListNode prev = curr.prev;
            next.prev = prev;                    // 两个邻居互相指，跳过 curr the neighbors point at each other, skipping curr
            prev.next = next;
        }
    }
}
```

| 操作 Operation | ⏱️ Time |
| --- | --- |
| `addAtHead` / `addAtTail` | O(1) |
| `get(i)` / `addAtIndex(i)` / `deleteAtIndex(i)` | 最多 O(min(i, n))，越界时走完整条链表 Up to O(min(i, n)); the whole list when out of bounds |

- 🗄️ Space: O(n)，每个元素一个节点（多一个 `prev` 引用），再加两个哨兵；多一个引用换来“站在节点上就能删掉它自己”，Java 的 `LinkedList` 和 LRU 缓存用双向链表主要就是为了这一点 one node per element (with an extra `prev` reference), plus two sentinels; that extra reference buys "stand on a node and remove it", which is largely why Java's `LinkedList` and LRU caches use doubly linked lists

### 4.1 🔍 同一个循环，不同的检查 Same loop, different checks

三个按下标的方法用**同一个循环**：从第 0 个出发走 `index` 步，`curr` 只可能落在三种地方：
The three index-based methods share **one loop**: start at node 0 and walk `index` steps; `curr` can only land in three places:

| `index` 和长度 `n` 比较 `index` vs length `n` | `curr` 落在 `curr` lands on | `get` / `deleteAtIndex` | `addAtIndex` |
| --- | --- | --- | --- |
| `0 ≤ index < n` | 第 `index` 个真实节点 real node `index` | ✅ 读 / 删 read / delete | ✅ 插在它前面 insert before it |
| `index == n` | 尾哨兵 the tail sentinel | ❌ 不是真实节点 not a real node | ✅ 插在尾哨兵前面，即追加 insert before the tail sentinel, i.e. append |
| `index > n` | 走到 `null` 了 ran off to `null` | ❌ 越界 out of bounds | ❌ 越界 out of bounds |

`addAtIndex` 和另外两个的**唯一区别**是少了 `curr != dummyTail`：这正好就是“下标等于长度时追加”，不用单独写 `if (index == size) addAtTail(val)`。两处 `curr != null` 管第三行：`dummyTail.next` 是 `null`。
`addAtIndex` differs from the other two **only** by dropping `curr != dummyTail`: that's exactly "append when `index` equals the length", with no separate `if (index == size) addAtTail(val)`. The two `curr != null` checks handle the third row, since `dummyTail.next` is `null`.

**先存邻居再改 Save the neighbors first:** 把两个邻居存进局部变量 `prev` / `next` 后，四行指针赋值**换成任何顺序都对**，因为不会再从正在被改的字段里读。
After copying both neighbors into the locals `prev` / `next`, the four pointer assignments **work in any order**, because nothing reads a field while it's being overwritten.

### 4.2 ⚖️ 和单链表版对比 Compared with the singly linked version

| | [[Design Singly Linked List\|设计单链表 Design Singly Linked List]] | 707（本题 this one） |
| --- | --- | --- |
| 节点 Node | `val`, `next` | `val`, `prev`, `next` |
| 哨兵 Sentinels | 只有头哨兵，另加尾指针 a head dummy plus a tail pointer | 头尾两个哨兵 head and tail sentinels |
| 删第 i 个时停在 Delete i stops at | 第 `i - 1` 个（前一个） node `i - 1` (the predecessor) | 第 `i` 个（目标本身） node `i` (the target itself) |
| 尾插 Append | O(1)，但要维护尾指针 O(1), but the tail pointer must be kept up to date | O(1)，不用维护任何状态 O(1), with nothing to maintain |
| 额外空间 Extra space | 每个节点一个引用 one reference per node | 每个节点两个引用 two references per node |

> [!example] 走一遍 Trace: 示例加两个边界 The example plus two edge cases
>
> | 操作 Op | 链表 List（哨兵之间 between the sentinels） | `curr` 落在 `curr` lands on | 返回 Returns |
> | --- | --- | --- | --- |
> | `addAtHead(1)`, `addAtTail(3)` | `[1, 3]` | | |
> | `addAtIndex(1, 2)` | `[1, 2, 3]` | 值为 3 的节点（插在它前面） the node holding 3 (insert before it) | |
> | `get(1)` | `[1, 2, 3]` | 值为 2 的节点 the node holding 2 | `2` |
> | `deleteAtIndex(1)` | `[1, 3]` | 值为 2 的节点（删掉） the node holding 2 (deleted) | |
> | `addAtIndex(2, 5)` | `[1, 3, 5]` | 尾哨兵（下标等于长度，追加） the tail sentinel (index equals the length, append) | |
> | `get(3)` | `[1, 3, 5]` | 尾哨兵（不是真实节点） the tail sentinel (not a real node) | `-1` |
> | `addAtIndex(5, 9)` | `[1, 3, 5]` | 走到 `null` 了（越界，不插入） ran off to `null` (out of bounds, no insert) | |

> [!note] 其他写法 Alternatives
> **记录 `size`，抽一个 `getNode`，从近的一端走 Keep `size`, extract `getNode`, walk from the closer end:** 越界判断变成 O(1)；三个循环合成一个 `getNode`，前半段从头走，否则从 `dummyTail` 往回走。Java 的 `LinkedList.get(index)` 思路相同（内部 `node(index)` 比较 `index < (size >> 1)`），只是没有哨兵。
> Bounds checks become O(1); the three loops become one `getNode` that walks forward for the first half and backward from `dummyTail` otherwise. Java's `LinkedList.get(index)` uses the same idea (its internal `node(index)` compares `index < (size >> 1)`), just without sentinels.
> ```java
> private int size = 0;
>
> // 返回第 index 个节点；index == size 时返回 dummyTail returns node index, or dummyTail when index == size
> private ListNode getNode(int index) {
>     if (index < size / 2) {
>         ListNode curr = dummyHead.next;
>         for (int k = 0; k < index; k++) curr = curr.next;
>         return curr;
>     }
>     ListNode curr = dummyTail;                             // 下标 n index n
>     for (int k = size; k > index; k--) curr = curr.prev;  // 往回走 walk backward
>     return curr;
> }
>
> public int get(int index) {
>     if (index < 0 || index >= size) return -1;
>     return getNode(index).val;
> }
>
> public void addAtHead(int val) { addAtIndex(0, val); }
> public void addAtTail(int val) { addAtIndex(size, val); }
> ```
> `addAtIndex` 在 `index > size` 时直接返回（等于 `size` 时 `getNode` 给出 `dummyTail`，插在它前面就是追加），`deleteAtIndex` 在 `index >= size` 时返回。代价是每个插入删除都要记得更新 `size`；复杂度变成 O(min(i, n − i))，最坏仍是 O(n)，只是常数减半。
> `addAtIndex` returns early when `index > size` (at `index == size`, `getNode` gives `dummyTail`, and inserting before it appends), and `deleteAtIndex` when `index >= size`. The price: every insert and delete must update `size`. The cost becomes O(min(i, n − i)): still O(n) in the worst case, just with half the constant.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 空链表 Empty list: `dummyHead.next` 就是 `dummyTail`，`get(0)` 返回 `-1`，`deleteAtIndex(0)` 什么都不做 → `dummyHead.next` is `dummyTail`, so `get(0)` returns `-1` and `deleteAtIndex(0)` does nothing
- [x] 下标等于长度 Index equals the length: `addAtIndex` 追加；`get` / `deleteAtIndex` 返回 `-1` 或什么都不做 → `addAtIndex` appends; `get` / `deleteAtIndex` return `-1` or do nothing
- [x] ⚠️ 下标大于长度 Index past the length: `curr` 会越过尾哨兵走到 `null`，循环里的 `curr != null` 防止空指针 → `curr` walks past the tail sentinel to `null`; the `curr != null` loop check prevents an NPE
- [x] ⚠️ 漏了尾哨兵检查 Missing the sentinel check: 没有 `curr != dummyTail` 的话，`get(n)` 返回哨兵的占位值 0，`deleteAtIndex(n)` 在 `next.prev` 上空指针 → without `curr != dummyTail`, `get(n)` returns the sentinel's placeholder 0 and `deleteAtIndex(n)` throws an NPE on `next.prev`
- [x] ⚠️ 插入少改一个指针 One pointer short on insert: 漏了 `next.prev = node` 时正向遍历看起来没问题，但之后在这里插入会把 `node` 跳过去，丢掉节点 → with `next.prev = node` missing, forward traversal still looks fine, but a later insert there skips `node` and loses it
- [x] 不存局部变量时的顺序 Order without locals: `curr.prev.next = node; curr.prev = node;` 的顺序不能反，先改 `curr.prev` 就找不到原来的前一个了 → the order of `curr.prev.next = node; curr.prev = node;` is fixed: overwrite `curr.prev` first and the old predecessor is lost
- [x] 负数下标 Negative index: 旧题面说负数插到头部，现在约束保证 `index >= 0`；我的代码直接忽略负数 → an older statement inserted at the head for negatives; the current constraints guarantee `index >= 0`, and my code ignores negatives

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 146. LRU 缓存 LRU Cache | 通常就是本题的结构：哈希表存 key 到节点，双向链表按使用顺序排，双哨兵让“移到最前”和“删最旧的”都只要改几个指针 typically this structure: a hash map from key to node plus a doubly linked list in usage order; the sentinels make move-to-front and evict-oldest a few pointer updates each · Medium |
| 641. 设计循环双端队列 Design Circular Deque | 两端插入删除，双向链表加双哨兵直接能用 insert and delete at both ends; a doubly linked list with two sentinels fits directly · Medium |
| [[Design Browser History\|1472. 设计浏览器历史记录 Design Browser History]] | 用双向链表前进后退（数组加两个下标也行） back and forward on a doubly linked list (an array plus two indices also works) · Medium |
| 430. 扁平化多级双向链表 Flatten a Multilevel Doubly Linked List | 同时维护 `prev` 和 `next`，最容易漏改的是 `prev` 那一边 keep `prev` and `next` in sync; the `prev` side is the one people forget · Medium |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么双向链表的 `deleteAtIndex` 可以停在目标本身，单链表却要停在前一个？ Why can the doubly linked `deleteAtIndex` stop on the target, while the singly linked one stops before it?

> [!success]- 答案 Answer
> 删除要改的是前一个节点的 `next`。双向链表从目标出发，通过 `curr.prev` 就能拿到前一个；单链表没有 `prev`，只能提前一步停下。
> Removing rewires the predecessor's `next`. In a doubly linked list, `curr.prev` reaches it from the target; a singly linked list has no `prev`, so it must stop one step early.

**Q2.** 两个哨兵分别省掉了哪些特殊情况？ Which special cases does each sentinel remove?

> [!success]- 答案 Answer
> 头哨兵：插入或删除第 0 个时，不用改“头指针”。尾哨兵：插入或删除最后一个时，`next` 不会是 `null`，也不用维护尾指针。合起来，空链表只是“两个哨兵挨在一起”，不用单独处理。
> The head sentinel: inserting or deleting node 0 never changes a "head" field. The tail sentinel: inserting or deleting the last node never sees a `null` `next`, and there's no tail pointer to maintain. Together, an empty list is just "two adjacent sentinels" with no special case.

**Q3.** `addAtIndex` 为什么不做 `curr != dummyTail` 这个检查？ Why doesn't `addAtIndex` check `curr != dummyTail`?

> [!success]- 答案 Answer
> 落在尾哨兵上说明 `index == n`，题目要求这时追加，而插在尾哨兵前面就是追加。`get` 和 `deleteAtIndex` 必须落在真实节点上，所以才要排除它。
> Landing on the tail sentinel means `index == n`, where the problem says to append, and inserting before the tail sentinel is an append. `get` and `deleteAtIndex` must land on a real node, so they exclude it.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[链表 Linked List|链表 Linked List]]（双向链表加双哨兵 doubly linked list with two sentinels） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（多存一个引用，换来原地删除 an extra reference buys in-place deletion）
- 对照 Compare with: [[Design Singly Linked List|设计单链表 Design Singly Linked List]]（单链表停在前一个，还要维护尾指针 the singly version stops before the target and maintains a tail pointer）
- 上一题 Previous: [[Merge Two Sorted Lists|21. 合并两个有序链表 Merge Two Sorted Lists]]（哑节点拼新链表 a dummy head builds the result）
- 下一题 Next: [[Design Browser History|1472. 设计浏览器历史记录 Design Browser History]]（双向链表加游标，后退前进 a doubly linked list with a cursor for back and forward）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-29 |  | ✅ | 双哨兵让插入删除不用判空；三个方法共用一个循环，`addAtIndex` 允许落在尾哨兵上就是追加 Two sentinels remove the null checks; the three methods share one loop, and letting `addAtIndex` land on the tail sentinel is the append case |
