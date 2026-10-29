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
> 用**双向链表**加**两个哨兵**：`dummyHead` 在最前，`dummyTail` 在最后，都不存数据。每个真实节点前后都一定有节点，所以插入和删除永远是固定的几行改指针，不用判断 `null`，也不用维护尾指针。有了 `prev`，按下标的操作可以**直接停在第 `index` 个节点上**，不用像单链表那样停在前一个。把 `dummyTail` 看成**下标 `n`**：`get` 和 `deleteAtIndex` 必须落在真实节点上，`addAtIndex` 允许落在 `dummyTail` 上，那就是追加到末尾。
> Use a **doubly linked list** with **two sentinels**: `dummyHead` first and `dummyTail` last, both holding no data. Every real node always has a node on both sides, so inserting and deleting is always the same few pointer updates, with no `null` checks and no tail pointer to maintain. With `prev`, index-based operations can **stop on node `index` itself** instead of the node before it as in a singly linked list. Treat `dummyTail` as **index `n`**: `get` and `deleteAtIndex` must land on a real node, while `addAtIndex` may land on `dummyTail`, which means append. ⏱️ `addAtHead` / `addAtTail` O(1), `get` / `addAtIndex` / `deleteAtIndex` O(i) · 🗄️ O(n)

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

过程是 `[1]` → `[1, 3]` → `[1, 2, 3]`，`get(1)` 返回 2，删掉下标 1 后剩 `[1, 3]`，再 `get(1)` 返回 3。
The list goes `[1]` → `[1, 3]` → `[1, 2, 3]`; `get(1)` returns 2; deleting index 1 leaves `[1, 3]`; then `get(1)` returns 3.

约束 Constraints: 下标和值都在 `[0, 1000]` 范围内；五个操作总共最多调用 2000 次。
`index` and `val` are in `[0, 1000]`; there are at most 2000 calls in total across the five operations.

> [!note] 旧版题面 Older statement
> 早期版本的题面说 `addAtIndex` 的下标为负数时插到头部。现在的约束保证下标不小于 0，所以不用处理负数。
> Earlier versions of the statement said a negative `index` in `addAtIndex` inserts at the head. The current constraints guarantee `index >= 0`, so negatives don't need handling.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 在 [[Design Singly Linked List|设计单链表 Design Singly Linked List]] 里，删除必须停在前一个节点，因为单链表回不去。双向链表每个节点都有 `prev`，**站在目标本身上就能拿到前后两个邻居**，所以每个按下标的操作都是“走到第 `index` 个，就在这里动手”。
  In the singly linked version, removing must stop at the predecessor because you can't step back. In a doubly linked list every node has `prev`, so **standing on the target is enough to reach both neighbors**, and every index-based operation becomes "walk to node `index`, then act right there".
- **两个哨兵 Two sentinels:** 头尾各放一个假节点。真实节点的 `prev` 和 `next` 永远不是 `null`，插入删除只改指针，不用判断是不是第一个、最后一个，或者链表是不是空的。
  A fake node at each end means a real node's `prev` and `next` are never `null`, so inserting and deleting only rewires pointers, with no "first node", "last node" or "empty list" checks.
- **没有尾指针要维护 No tail pointer to maintain:** 单链表版的 `tail` 要在空链表插入和删尾巴时更新，漏了就是静默 bug。这里最后一个节点永远是 `dummyTail.prev`，没有额外的状态需要同步。
  The singly linked version's `tail` must be updated on an insert into an empty list and on removing the last node, and missing one is a silent bug. Here the last node is always `dummyTail.prev`; there's no extra state to keep in sync.
- **套路 Pattern:** 设计题 + 双向链表 + 哨兵节点。LRU 缓存（146）用的就是同一个结构。
  A design problem with a doubly linked list and sentinel nodes, the same structure behind the LRU cache (146).

```
空链表 Empty list:

  dummyHead ⇄ dummyTail

addAtHead(1), addAtTail(3), addAtIndex(1, 2) 之后 after:

  dummyHead ⇄ [1] ⇄ [2] ⇄ [3] ⇄ dummyTail
  下标 -1       0     1     2     n = 3
  index -1                        index n
```

把 `dummyHead` 看成**下标 -1**，`dummyTail` 看成**下标 `n`**。下面所有的边界判断，其实都在问“`curr` 落在了哪个下标上”。
Treat `dummyHead` as **index -1** and `dummyTail` as **index `n`**. Every boundary check below is really asking "which index did `curr` land on?".

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 用 `ArrayList<Integer>` 存值，每个操作直接对应 `get`、`add(index, val)`、`remove(index)`。
  Store the values in an `ArrayList<Integer>` and map each operation to `get`, `add(index, val)` and `remove(index)`.
- `get` 是 O(1)，但 `addAtHead` 和按下标插入删除都要平移后面的元素，O(n)。
  `get` is O(1), but `addAtHead` and indexed inserts and deletes shift every later element: O(n).
- 能通过，但这题要练的是链表本身，这样写就变成了 [[Design Dynamic Array|设计动态数组 Design Dynamic Array]]。
  It passes, but the point is to practice the linked list itself; this just turns into Design Dynamic Array.
- 另一种“暴力”是不加哨兵的单链表：`addAtHead`、`addAtIndex(0)`、`deleteAtIndex(0)` 都要单独处理头节点，尾部操作还要从头走到尾。
  Another "brute force" is a singly linked list with no sentinel: `addAtHead`, `addAtIndex(0)` and `deleteAtIndex(0)` each need a head special case, and tail operations walk the whole list.

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

- 🗄️ Space: O(n)，每个元素一个节点（多一个 `prev` 引用），再加两个哨兵 one node per element (with an extra `prev` reference), plus two sentinels

### 4.1 🔍 同一个循环，不同的检查 Same loop, different checks

三个按下标的方法用的是**一模一样的循环**：从第 0 个出发走 `index` 步。`curr` 最后只可能落在三种地方：
The three index-based methods share **the exact same loop**: start at node 0 and walk `index` steps. `curr` can only end up in one of three places:

| `index` 和长度 `n` 比 vs length `n` | `curr` 落在 `curr` lands on | `get` / `deleteAtIndex` | `addAtIndex` |
| --- | --- | --- | --- |
| `0 ≤ index < n` | 第 `index` 个真实节点 real node `index` | ✅ 读 / 删 read / delete | ✅ 插在它前面 insert before it |
| `index == n` | 尾哨兵 the tail sentinel | ❌ 不是真实节点 not a real node | ✅ 插在尾哨兵前面，即追加 insert before the tail sentinel, i.e. append |
| `index > n` | 走到 `null` 了 ran off to `null` | ❌ 越界 out of bounds | ❌ 越界 out of bounds |

`addAtIndex` 和另外两个的**唯一区别**是少了 `curr != dummyTail`：插入允许落在下标 `n`，读和删不允许。这正好就是题目“下标等于长度时追加”的要求，不用单独写 `if (index == size) addAtTail(val)`。
`addAtIndex` differs from the other two **only** by dropping `curr != dummyTail`: an insert may land on index `n`, reads and deletes may not. That's exactly the "append when `index` equals the length" rule, with no separate `if (index == size) addAtTail(val)`.

循环里的 `curr != null` 管的是第三行：`dummyTail.next` 是 `null`，下标比长度大时 `curr` 会越过尾哨兵走到 `null`，不检查的话下一步 `null.next` 就空指针。
The loop's `curr != null` handles the third row: `dummyTail.next` is `null`, so when the index is past the length, `curr` walks past the tail sentinel to `null`, and without the check the next `curr.next` throws an NPE.

> [!note] `index == 0` 其实是多余的 `index == 0` is actually redundant
> 循环只有两种退出方式：`index` 减到 0，或者 `curr` 变成 `null`。所以只要 `curr != null`，`index` 就一定是 0，三个 `if` 里的 `index == 0` 都可以删掉。留着也没错，读起来更直白。
> The loop exits only when `index` reaches 0 or `curr` becomes `null`. So whenever `curr != null`, `index` must be 0, and the `index == 0` in all three `if`s can go. Keeping it is harmless and arguably clearer.

### 4.2 🔗 插入和删除改了哪些指针 Which pointers insert and delete change

```
在 curr 前插入 node Insert node before curr:

  prev ⇄ curr            →     prev ⇄ node ⇄ curr

  node.prev = prev;   node.next = curr;     ① 新节点先指好 point the new node first
  prev.next = node;   curr.prev = node;     ② 再让邻居指向它 then point the neighbors at it

删除 curr Delete curr:

  prev ⇄ curr ⇄ next     →     prev ⇄ next

  next.prev = prev;   prev.next = next;     curr 没人指了，等 GC 回收 curr is unreachable; GC reclaims it
```

- **先存邻居再改 Save the neighbors first:** 我的写法先把两个邻居存进局部变量 `prev` / `next`，之后的四行赋值**换成任何顺序都对**，因为不会再从正在被改的字段（比如 `curr.prev`）里读。
  My code copies both neighbors into the locals `prev` / `next` first, so the four assignments **work in any order**: nothing reads a field like `curr.prev` while it's being overwritten.
- **哨兵保证邻居存在 Sentinels guarantee neighbors:** 空链表时，`addAtHead` 里的 `next` 是 `dummyTail`，`addAtTail` 里的 `prev` 是 `dummyHead`，所以 `next.prev = ...` 和 `prev.next = ...` 永远不会空指针。
  On an empty list, `addAtHead`'s `next` is `dummyTail` and `addAtTail`'s `prev` is `dummyHead`, so `next.prev = ...` and `prev.next = ...` never throw.
- **被删的节点 The deleted node:** 它的 `prev` / `next` 还指着旧邻居，但已经没有节点指向它，GC 会回收。想更保险可以顺手把它的两个指针设成 `null`，这题不需要。
  Its `prev` / `next` still point at the old neighbors, but nothing points at it, so GC reclaims it. You can null them out for safety; this problem doesn't need it.

### 4.3 ⚖️ 和单链表版对比 Compared with the singly linked version

| | [[Design Singly Linked List\|设计单链表 Design Singly Linked List]] | 707（本题 this one） |
| --- | --- | --- |
| 节点 Node | `val`, `next` | `val`, `prev`, `next` |
| 哨兵 Sentinels | 只有头哨兵，另加尾指针 a head dummy plus a tail pointer | 头尾两个哨兵 head and tail sentinels |
| 删第 i 个时停在 Delete i stops at | 第 `i - 1` 个（前一个） node `i - 1` (the predecessor) | 第 `i` 个（目标本身） node `i` (the target itself) |
| 尾插 Append | O(1)，但要维护尾指针 O(1), but the tail pointer must be kept up to date | O(1)，不用维护任何状态 O(1), with nothing to maintain |
| 额外空间 Extra space | 每个节点一个引用 one reference per node | 每个节点两个引用 two references per node |

每个节点多一个 `prev` 引用，换来“站在节点上就能删掉它自己”。Java 的 `LinkedList` 和 LRU 缓存用双向链表，就是为了这一点。
One extra `prev` reference per node buys "stand on a node and remove it". That's why Java's `LinkedList` and LRU caches use doubly linked lists.

> [!example] 走一遍 Trace: 示例加三个边界 The example plus three edge cases
>
> | 操作 Op | 链表 List（哨兵之间 between the sentinels） | `curr` 落在 `curr` lands on | 返回 Returns |
> | --- | --- | --- | --- |
> | `MyLinkedList()` | `[]` | | |
> | `addAtHead(1)` | `[1]` | | |
> | `addAtTail(3)` | `[1, 3]` | | |
> | `addAtIndex(1, 2)` | `[1, 2, 3]` | 值为 3 的节点（下标 1，插在它前面） the node holding 3 (index 1, insert before it) | |
> | `get(1)` | `[1, 2, 3]` | 值为 2 的节点 the node holding 2 | `2` |
> | `deleteAtIndex(1)` | `[1, 3]` | 值为 2 的节点（删掉） the node holding 2 (deleted) | |
> | `get(1)` | `[1, 3]` | 值为 3 的节点 the node holding 3 | `3` |
> | `addAtIndex(2, 5)` | `[1, 3, 5]` | 尾哨兵（下标 2 等于长度，追加） the tail sentinel (index 2 equals the length, append) | |
> | `get(3)` | `[1, 3, 5]` | 尾哨兵（不是真实节点） the tail sentinel (not a real node) | `-1` |
> | `addAtIndex(5, 9)` | `[1, 3, 5]` | 走到 `null` 了（越界，不插入） ran off to `null` (out of bounds, no insert) | |
>
> 以 `addAtIndex(2, 5)` 为例：长度是 2，`curr` 从 1 出发走两步，经过 3，落在 `dummyTail` 上；它不是 `null`，于是新节点插在 `dummyTail` 前面，也就是追加。
> Take `addAtIndex(2, 5)`: the length is 2, so `curr` starts at 1, takes two steps past 3, and lands on `dummyTail`; it isn't `null`, so the new node goes before `dummyTail`, which is an append.

> [!note] 其他写法 Alternatives
> **抽一个辅助方法 Extract a helper:** 三个方法的循环一模一样，可以合成一个 `getNode`；`addAtHead` 和 `addAtTail` 也能写成 `addAtIndex(0, val)` 和 `addAtIndex(size, val)`。
> The three loops are identical and can become one `getNode`; `addAtHead` and `addAtTail` can then be `addAtIndex(0, val)` and `addAtIndex(size, val)`.
>
> **记录长度，从近的一端走 Keep `size`, walk from the closer end:** 有了 `size`，越界判断变成 O(1)；下标在前半段就从头走，否则从 `dummyTail` 往回走，最多走一半左右。Java 的 `LinkedList.get(index)` 就是这么做的（内部的 `node(index)` 比较 `index < (size >> 1)`）。
> With `size`, bounds checks become O(1); walk forward from the head when the index is in the first half, backward from `dummyTail` otherwise, about half the list at most. Java's `LinkedList.get(index)` does exactly this (its internal `node(index)` compares `index < (size >> 1)`).
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
> public void addAtIndex(int index, int val) {
>     if (index < 0 || index > size) return;    // 允许 index == size：追加 index == size is allowed: append
>     ListNode next = getNode(index);
>     ListNode prev = next.prev;
>     ListNode node = new ListNode(val);
>     node.prev = prev;
>     node.next = next;
>     prev.next = node;
>     next.prev = node;
>     size++;
> }
>
> public void deleteAtIndex(int index) {
>     if (index < 0 || index >= size) return;
>     ListNode curr = getNode(index);
>     curr.prev.next = curr.next;
>     curr.next.prev = curr.prev;
>     size--;
> }
>
> public void addAtHead(int val) { addAtIndex(0, val); }
> public void addAtTail(int val) { addAtIndex(size, val); }
> ```
> 代价是每个插入删除都要记得更新 `size`；复杂度变成 O(min(i, n − i))，最坏仍是 O(n)，只是常数减半。
> The price: every insert and delete must update `size`. The cost becomes O(min(i, n − i)): still O(n) in the worst case, just with half the constant.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 空链表 Empty list: `dummyHead.next` 就是 `dummyTail`，`get(0)` 落在尾哨兵上返回 `-1`，`deleteAtIndex(0)` 什么都不做 → `dummyHead.next` is `dummyTail`, so `get(0)` lands on the tail sentinel and returns `-1`, and `deleteAtIndex(0)` does nothing
- [x] 下标等于长度 Index equals the length: `addAtIndex` 落在尾哨兵上，插在它前面就是追加；`get` 和 `deleteAtIndex` 返回 `-1` 或什么都不做 → `addAtIndex` lands on the tail sentinel and inserting before it appends; `get` and `deleteAtIndex` return `-1` or do nothing
- [x] ⚠️ 下标大于长度 Index past the length: `curr` 会越过尾哨兵走到 `null`，循环里的 `curr != null` 防止空指针 → `curr` walks past the tail sentinel to `null`; the `curr != null` loop check prevents an NPE
- [x] ⚠️ 漏了尾哨兵检查 Missing the sentinel check: 没有 `curr != dummyTail` 的话，`get(n)` 会返回哨兵的占位值 0，`deleteAtIndex(n)` 会在 `next.prev` 上空指针（尾哨兵的 `next` 是 `null`） → without `curr != dummyTail`, `get(n)` returns the sentinel's placeholder 0 and `deleteAtIndex(n)` throws an NPE on `next.prev` (the tail sentinel's `next` is `null`)
- [x] ⚠️ 插入少改一个指针 One pointer short on insert: 比如漏了 `next.prev = node`，正向遍历看起来没问题，但 `next.prev` 还指着旧的前一个，之后在这里插入就会把 `node` 跳过去，丢掉节点 → e.g. missing `next.prev = node`: forward traversal still looks fine, but `next.prev` still points at the old predecessor, so a later insert there skips `node` and loses it
- [x] 不存局部变量时的顺序 Order without locals: 直接写 `curr.prev.next = node; curr.prev = node;` 时顺序不能反，先改 `curr.prev` 就找不到原来的前一个了 → with `curr.prev.next = node; curr.prev = node;` the order is fixed: overwrite `curr.prev` first and the old predecessor is lost
- [x] 哨兵的值 Sentinel values: `0` 只是占位，永远不该被读到；`curr != dummyTail` 检查保证了这一点 → `0` is a placeholder that must never be read; the `curr != dummyTail` check guarantees it
- [x] 旧题面的负数下标 Negative index in the old statement: 现在约束是 `index >= 0`；要兼容旧版的话，在 `addAtIndex` 里把负数当成 0 → current constraints say `index >= 0`; for the old version, treat a negative index in `addAtIndex` as 0

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| 146. LRU 缓存 LRU Cache | 正是本题的结构：哈希表存 key 到节点，双向链表按使用顺序排，双哨兵让“移到最前”和“删最旧的”都只要改几个指针 exactly this structure: a hash map from key to node plus a doubly linked list in usage order; the sentinels make move-to-front and evict-oldest a few pointer updates each (Medium) |
| 641. 设计循环双端队列 Design Circular Deque | 两端插入删除，双向链表加双哨兵直接能用 insert and delete at both ends; a doubly linked list with two sentinels fits directly |
| 1472. 设计浏览器历史记录 Design Browser History | 用双向链表前进后退（数组加一个指针也行） back and forward on a doubly linked list (an array plus a pointer also works) |
| 430. 扁平化多级双向链表 Flatten a Multilevel Doubly Linked List | 同时维护 `prev` 和 `next`，最容易漏改的是 `prev` 那一边 keep `prev` and `next` in sync; the `prev` side is the one people forget |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么双向链表的 `deleteAtIndex` 可以停在目标本身，单链表却要停在前一个？ Why can the doubly linked `deleteAtIndex` stop on the target, while the singly linked one stops before it?

> [!success]- 答案 Answer
> 删除要改的是前一个节点的 `next`。双向链表从目标出发，通过 `curr.prev` 就能拿到前一个；单链表没有 `prev`，只能提前一步停下。
> Removing rewires the predecessor's `next`. In a doubly linked list, `curr.prev` reaches it from the target; a singly linked list has no `prev`, so it must stop one step early.

**Q2.** 两个哨兵分别省掉了哪些特殊情况？ Which special cases does each sentinel remove?

> [!success]- 答案 Answer
> 头哨兵：插入或删除第 0 个时，不用改“头指针”。尾哨兵：插入或删除最后一个时，`next` 不会是 `null`，也不用维护尾指针。合起来，空链表只是“两个哨兵挨在一起”，不用单独处理。
> The head sentinel: inserting or deleting node 0 never changes a "head" field. The tail sentinel: inserting or deleting the last node never sees a `null` `next`, and there's no tail pointer to maintain. Together, an empty list is just "two adjacent sentinels" with no special case.

**Q3.** `addAtIndex` 为什么不检查 `curr != dummyTail`？ Why doesn't `addAtIndex` check `curr != dummyTail`?

> [!success]- 答案 Answer
> 落在尾哨兵上说明 `index == n`，题目要求这时追加，而插在尾哨兵前面就是追加。`get` 和 `deleteAtIndex` 必须落在真实节点上，所以才要排除它。
> Landing on the tail sentinel means `index == n`, where the problem says to append, and inserting before the tail sentinel is an append. `get` and `deleteAtIndex` must land on a real node, so they exclude it.

**Q4.** 下标比长度大很多时，循环里的 `curr != null` 为什么必要？ Why is `curr != null` needed in the loop when the index is far past the length?

> [!success]- 答案 Answer
> 尾哨兵的 `next` 是 `null`，所以越过尾哨兵再走一步就到了 `null`。如果继续执行 `curr = curr.next`，就会空指针。
> The tail sentinel's `next` is `null`, so one step past it reaches `null`. Running `curr = curr.next` again would throw an NPE.

**Q5.** 不用局部变量时，`curr.prev.next = node;` 和 `curr.prev = node;` 能交换顺序吗？ Without locals, can `curr.prev.next = node;` and `curr.prev = node;` be swapped?

> [!success]- 答案 Answer
> 不能。先执行 `curr.prev = node` 的话，`curr.prev.next = node` 改的就是 `node.next`，让 `node` 指向自己，原来的前一个节点也不会指向 `node`。改一个字段之前，先把要从它读的都读完，或者先存进局部变量。
> No. With `curr.prev = node` first, `curr.prev.next = node` sets `node.next` and makes `node` point at itself, and the old predecessor never points at `node`. Finish reading a field before you overwrite it, or save it in a local first.

**Q6.** 双向链表的 `get(i)` 能优化到什么程度？Big-O 变了吗？ How far can a doubly linked `get(i)` be optimized, and does its Big-O change?

> [!success]- 答案 Answer
> 记录 `size`，从近的一端走，最多走一半左右，即 O(min(i, n − i))。但最坏仍然是 O(n)，只是常数减半。真正的 O(1) 随机访问要靠数组。
> Keep `size` and walk from the closer end: about half the list at most, O(min(i, n − i)). The worst case is still O(n), just with half the constant; true O(1) random access needs an array.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[链表 Linked List|链表 Linked List]]（双向链表加双哨兵 doubly linked list with two sentinels） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（多存一个引用，换来原地删除 an extra reference buys in-place deletion）
- 对照 Compare with: [[Design Singly Linked List|设计单链表 Design Singly Linked List]]（单链表停在前一个，还要维护尾指针 the singly version stops before the target and maintains a tail pointer）
- 上一题 Previous: [[Merge Two Sorted Lists|21. 合并两个有序链表 Merge Two Sorted Lists]]（哑节点拼新链表 a dummy head builds the result）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-29 |  | ✅ | 双哨兵让插入删除不用判空；三个方法共用一个循环，`addAtIndex` 允许落在尾哨兵上就是追加 Two sentinels remove the null checks; the three methods share one loop, and letting `addAtIndex` land on the tail sentinel is the append case |
