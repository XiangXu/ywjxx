---
title: "设计单链表 Design Singly Linked List"
aliases:
  - 设计单链表
  - Design Singly Linked List
tags:
  - LeetCode
  - Interview-Prep
  - Linked-List
  - Design
difficulty: Easy
pattern: "Design / Linked List (Dummy Head + Tail Pointer)"
link: https://neetcode.io/problems/singlyLinkedList
status: 🟡 review
created: 2026-10-26
publish: true
last-reviewed: 2026-10-26
---

# 🧩 Design Singly Linked List

> [!abstract] TL;DR
> 用一个**哑节点 `head`**（不存数据，永远在最前面）加一个 **`tail` 指针**。哑节点让“删除第 0 个”和“删除中间的”写法一样；`tail` 让 `insertTail` 变成 O(1)。`remove(i)` 的关键是**停在第 `i - 1` 个节点**（要删的节点的前一个），然后 `prev.next = prev.next.next` 跳过它；如果删的是尾巴，先把 `tail` 移回 `prev`。
> Use a **dummy `head`** (holds no data, always first) plus a **`tail` pointer**. The dummy makes "remove index 0" look the same as "remove from the middle"; `tail` makes `insertTail` O(1). The key to `remove(i)` is to **stop at node `i - 1`** (the one before the target) and skip the target with `prev.next = prev.next.next`; if the target is the tail, move `tail` back to `prev` first. ⏱️ `insertHead` / `insertTail` O(1), `get` / `remove` O(i), `getValues` O(n) · 🗄️ O(n)

## 1. 📋 题目 Problem

实现一个单链表类 `LinkedList`，支持以下操作。
Design a singly linked list class `LinkedList` with these operations.

| 方法 Method | 作用 Behavior |
| --- | --- |
| `LinkedList()` | 初始化空链表 Initialize an empty list |
| `int get(int i)` | 返回第 `i` 个节点的值（从 0 开始），越界返回 `-1` Return the value of node `i` (0-indexed), or `-1` if out of bounds |
| `void insertHead(int val)` | 在头部插入 Insert at the head |
| `void insertTail(int val)` | 在尾部插入 Insert at the tail |
| `bool remove(int i)` | 删除第 `i` 个节点，越界返回 `false`，否则返回 `true` Remove node `i`; return `false` if out of bounds, else `true` |
| `int[] getValues()` | 从头到尾返回所有值 Return all values from head to tail |

| Input | Output |
| --- | --- |
| `["insertHead", 1, "insertTail", 2, "insertHead", 0, "remove", 1, "getValues"]` | `[null, null, null, true, [0, 2]]` |
| `["insertHead", 1, "insertHead", 2, "get", 5]` | `[null, null, -1]` |

约束 Constraints: `get(i)` 和 `remove(i)` 的下标保证 `i >= 0`，但可能越界。
The index passed to `get(i)` and `remove(i)` is guaranteed `>= 0`, but may be out of bounds.

> [!note] 返回类型 Return type
> 题目写的是 `int[] getValues()`，但 NeetCode 的 Java 模板给的是 `ArrayList<Integer> getValues()`，我的解法按模板写。
> The statement says `int[] getValues()`, but NeetCode's Java stub uses `ArrayList<Integer> getValues()`, so my solution follows the stub.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 单链表只能往后走，**要删除一个节点，必须站在它前一个节点上**。因为删除就是改“前一个节点”的 `next`，站在目标本身上已经来不及了，回不去。
  A singly linked list only goes forward, so **to remove a node you must stand on the node before it**. Removing means changing the *previous* node's `next`; once you're on the target itself, you can't go back to it.
- **哑节点 Dummy head:** 在真正的第 0 个节点前面放一个假节点。这样每个真实节点（包括第 0 个）都有前一个节点，`insertHead` 和 `remove(0)` 不用特殊处理“头变了”。
  A fake node sits before real node 0, so every real node (node 0 included) has a predecessor, and `insertHead` / `remove(0)` need no "the head changed" special case.
- **尾指针 Tail pointer:** 多存一个 `tail` 引用，`insertTail` 不用从头走到尾，O(n) 变 O(1)。代价是**每个可能改变尾巴的操作都要维护它**：`insertHead` 插进空链表时、`remove` 删掉尾巴时。
  One extra `tail` reference turns `insertTail` from O(n) into O(1). The price: **every operation that can change the last node must update it**: `insertHead` into an empty list and `remove` of the last node.
- **套路 Pattern:** 设计题 + 链表指针操作（哑节点、尾指针）。和 [[Design Dynamic Array|设计动态数组 Design Dynamic Array]] 正好互补。
  A design problem with linked-list pointer work (dummy head, tail pointer), the counterpart of Design Dynamic Array.

```
空链表 Empty list:

  head(dummy)        tail ──► head(dummy)
  ┌────┬───┐
  │ -1 │ ∅ │
  └────┴───┘

insertHead(1), insertTail(2), insertHead(0) 之后 after:

  head(dummy)
  ┌────┬───┐   ┌───┬───┐   ┌───┬───┐   ┌───┬───┐
  │ -1 │ ●─┼──►│ 0 │ ●─┼──►│ 1 │ ●─┼──►│ 2 │ ∅ │
  └────┴───┘   └───┴───┘   └───┴───┘   └───┴───┘
   下标 -1       index 0     index 1     index 2 ◄── tail
```

把哑节点看成**下标 -1**，后面所有推理都会简单很多。
Think of the dummy as **index -1**; everything below gets simpler.

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 只存 `head`，不用哑节点也不存 `tail`。
  Store only `head`: no dummy, no `tail`.
- `insertTail` 每次都要从头走到最后一个节点，O(n)。
  `insertTail` walks from the head to the last node every time: O(n).
- `insertHead` 和 `remove(0)` 会改变 `head` 本身，要写 `if (index == 0)` 和 `if (head == null)` 之类的特殊分支，容易漏。
  `insertHead` and `remove(0)` change `head` itself, so you need special branches like `if (index == 0)` and `if (head == null)`, which are easy to get wrong.
- ⏱️ 正确但慢：推 n 个元素到尾部总共 O(n²)。
  Correct but slow: n tail inserts cost O(n²) in total.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class ListNode {
    ListNode next;
    int val;

    public ListNode(ListNode next, int val) {
        this.next = next;
        this.val = val;
    }

    public ListNode(int val) {
        this.val = val;
        this.next = null;
    }
}

class LinkedList {
    private ListNode head;   // 哑节点，不存数据 dummy node, holds no data
    private ListNode tail;   // 最后一个节点；空链表时等于哑节点 last node; the dummy when empty

    public LinkedList() {
        this.head = new ListNode(-1); // set default val to -1
        this.tail = this.head;        // 空链表：尾巴就是哑节点 empty: tail is the dummy
    }

    public int get(int index) {
        ListNode curr = head.next;    // 从真正的第 0 个开始 start at real node 0
        int i = 0;
        while (curr != null) {
            if (i == index) {
                return curr.val;      // 停在目标本身 stop ON the target
            }
            i++;
            curr = curr.next;
        }
        return -1;                    // 走完了还没到：越界 ran out: out of bounds
    }

    public void insertHead(int val) {
        ListNode newHead = new ListNode(val);
        newHead.next = head.next;     // ① 先连后面 connect to the rest first
        head.next = newHead;          // ② 再接到哑节点后 then hang it off the dummy
        if (newHead.next == null) {   // 原来是空链表 the list was empty
            tail = newHead;           // 新节点也是尾巴 the new node is also the tail
        }
    }

    public void insertTail(int val) {
        this.tail.next = new ListNode(val); // 接在尾巴后面 append after the tail
        tail = tail.next;                   // 尾巴后移 move the tail forward
    }

    public boolean remove(int index) {
        ListNode curr = head;         // 从哑节点（下标 -1）出发 start at the dummy (index -1)
        int i = 0;

        while (i < index && curr != null) {
            curr = curr.next;         // 走 index 步，停在第 index - 1 个 walk index steps, stop at node index - 1
            i++;
        }

        if (curr != null && curr.next != null) { // 前一个存在，目标也存在 predecessor and target both exist
            if (curr.next == tail) {  // 删的是尾巴 removing the tail
                tail = curr;          // 尾巴退回前一个 the tail moves back to the predecessor
            }
            curr.next = curr.next.next; // 跳过目标 skip the target
            return true;
        }

        return false;                 // 越界 out of bounds
    }

    public ArrayList<Integer> getValues() {
        ArrayList<Integer> res = new ArrayList<>();
        ListNode curr = this.head.next; // 跳过哑节点 skip the dummy
        while (curr != null) {
            res.add(curr.val);
            curr = curr.next;
        }
        return res;
    }
}
```

| 操作 Operation | ⏱️ Time |
| --- | --- |
| `insertHead` / `insertTail` | O(1) |
| `get(i)` / `remove(i)` | 最多 O(min(i, n))，越界时走完整条链表 Up to O(min(i, n)); the whole list when out of bounds |
| `getValues` | O(n) |

- 🗄️ Space: O(n)，每个元素一个节点，再加一个哑节点 one node per element, plus the dummy

### 4.1 🔍 `remove` 详解 `remove` in detail

#### ① 为什么要停在前一个节点 Why stop at the previous node

删除节点 `B` 就是让 `A` 直接指向 `C`。要改的是 **`A.next`**，所以手里必须拿着 `A`。
Removing node `B` means making `A` point straight at `C`. The field that changes is **`A.next`**, so you must be holding `A`.

```
删除前 Before:   A ──► B ──► C
删除后 After:    A ─────────► C        A.next = A.next.next
                       B（没人指向它，可被 GC 回收 unreachable, eligible for GC）
```

如果循环停在 `B` 上，`B` 不知道谁指向它（单链表没有 `prev`），就没法直接把它从链表里摘掉（237 题用“复制下一个值”绕开，但删不了尾节点）。
If the loop stops on `B`, it has no idea who points at it (no `prev` in a singly linked list), so it can't be unlinked directly (237's copy-the-next-value trick works around this, but not for the tail).

#### ② 为什么从哑节点出发、走 `index` 步 Why start at the dummy and walk `index` steps

把哑节点当成下标 -1。从下标 -1 出发走 `index` 步，正好停在下标 `index - 1`，也就是目标的前一个：
Treat the dummy as index -1. Walking `index` steps from index -1 lands exactly on index `index - 1`, the node before the target:

| `index` | 走几步 Steps | `curr` 停在 `curr` stops at | 要删的 Target |
| --- | --- | --- | --- |
| 0 | 0 | 哑节点（-1） the dummy (-1) | 第 0 个 node 0 |
| 1 | 1 | 第 0 个 node 0 | 第 1 个 node 1 |
| k | k | 第 k-1 个 node k-1 | 第 k 个 node k |

**`remove(0)` 不需要任何特殊处理**：`curr` 就是哑节点，`head.next = head.next.next` 和删中间节点是同一行代码。这就是哑节点的价值。
**`remove(0)` needs no special case**: `curr` is the dummy, and `head.next = head.next.next` is the same line as removing from the middle. That's what the dummy buys you.

> [!important] 和 `get` 对比：故意差一个 Compared with `get`: off by one on purpose
>
> | | 起点 Start | 起点下标 Start index | 停在 Stops at |
> | --- | --- | --- | --- |
> | `get(i)` | `head.next` | 0 | 第 i 个（目标本身） node i (the target) |
> | `remove(i)` | `head`（哑节点 dummy） | -1 | 第 i-1 个（目标的前一个） node i-1 (before the target) |
>
> `get` 只需要**读**目标，所以停在目标上；`remove` 要**改前一个节点的 `next`**，所以起点往前挪一格。两个循环看起来像，含义差了一个位置，这是最容易写混的地方。
> `get` only **reads** the target, so it stops on it; `remove` must **change the previous node's `next`**, so it starts one node earlier. The loops look alike but mean different positions, which is the easiest thing to mix up.

#### ③ 两行 null 检查各管什么 What each null-check line guards

```java
while (i < index && curr != null)            // 检查 A Check A
if (curr != null && curr.next != null)        // 检查 B Check B
```

- **循环里的 `curr != null` In the loop:** 下标远超长度时，`curr` 会先走到 `null`；不检查的话下一步 `null.next` 抛空指针异常。
  When the index is far past the end, `curr` reaches `null` first; without this check the next `curr.next` throws a `NullPointerException`.
- **`curr != null` 在 if 里 In the if:** 循环可能因为 `curr == null` 提前退出，说明连前一个节点都不存在。
  The loop may have exited because `curr == null`, meaning even the predecessor doesn't exist.
- **`curr.next != null`:** 前一个节点存在，但它已经是最后一个节点，后面没有要删的。
  `curr.next != null`: the predecessor exists, but it's the last node, so there's nothing after it to remove.

以 `[0, 2]`（长度 2）为例 For `[0, 2]` (length 2):

| 调用 Call | `curr` 最后在 `curr` ends at | 哪个检查失败 Failing check | 返回 Returns |
| --- | --- | --- | --- |
| `remove(1)` | 0 | 无 none | `true`，值 2 被删掉 `true`, removes the 2 |
| `remove(2)` | 2 | `curr.next == null` | `false` |
| `remove(5)` | 第 3 步走到 `null` Reaches `null` at step 3 | `curr == null` | `false` |

#### ④ 删尾巴时维护 `tail` Keeping `tail` right when removing the last node

这是 `remove` 里最容易漏的一步。如果删的是尾巴，`tail` 还指着那个已经被摘掉的节点，下一次 `insertTail` 就会把新节点接到一个**不在链表里**的节点后面，新值凭空消失。
This is the step most often missed. If you remove the tail and don't update `tail`, it still points at the detached node, so the next `insertTail` hangs the new node off a node that's **no longer in the list**, and the value silently disappears.

```
[0, 2]，remove(1) 删掉 2 removes 2:

  忘了更新 tail Without the update:          更新了 With tail = curr:
  dummy ─► 0 ─► ∅                            dummy ─► 0 ─► ∅
           2 ◄── tail（已脱离 detached）              ▲ tail
  insertTail(5): 2 ─► 5                      insertTail(5): dummy ─► 0 ─► 5
  getValues() → [0]  ❌                      getValues() → [0, 5]  ✅
```

两个细节 Two details:

- **先判断再断开 Check before unlinking:** `curr.next == tail` 必须写在 `curr.next = curr.next.next` 之前，断开之后 `curr.next` 就变成了下一个节点，比较的对象就错了。
  `curr.next == tail` must come before `curr.next = curr.next.next`; after unlinking, `curr.next` is a different node and you'd compare the wrong one.
- **删掉唯一一个元素 Removing the only element:** `curr` 是哑节点，于是 `tail = head`（哑节点），正好回到构造函数里的空链表状态，`insertTail` 继续能用。
  `curr` is the dummy, so `tail = head` (the dummy), exactly the empty state from the constructor, and `insertTail` keeps working.

> [!example] 走一遍 Trace: 示例 1 Example 1
>
> | 操作 Op | 链表 List（哑节点后 after the dummy） | `tail` | 返回 Returns |
> | --- | --- | --- | --- |
> | `LinkedList()` | `[]` | 哑节点 dummy | |
> | `insertHead(1)` | `[1]` | 1（原来是空的 was empty） | |
> | `insertTail(2)` | `[1, 2]` | 2 | |
> | `insertHead(0)` | `[0, 1, 2]` | 2 | |
> | `remove(1)` | `[0, 2]` | 2 | `true` |
> | `getValues()` | `[0, 2]` | 2 | `[0, 2]` |
>
> `remove(1)` 的过程：`curr` 从哑节点出发走 1 步停在 0；`curr.next` 是 1，不是尾巴，所以 `tail` 不动；`0.next = 2`，1 被跳过。
> Inside `remove(1)`: `curr` starts at the dummy and takes 1 step to node 0; `curr.next` is 1, not the tail, so `tail` stays; `0.next = 2` skips 1.

> [!note] 其他写法 Alternatives
> **加一个 `size` 计数器 Keep a `size` counter:** 越界直接 O(1) 判断，循环里就不用检查 `null` 了。代价是每个插入删除都要记得 `size++` / `size--`。
> Out-of-bounds becomes an O(1) check and the loop needs no `null` checks. The price: every insert and remove must update `size`.
> ```java
> private int size = 0;
>
> public boolean remove(int index) {
>     if (index >= size) return false;            // 越界 out of bounds
>     ListNode prev = head;                       // 哑节点 dummy, index -1
>     for (int k = 0; k < index; k++) prev = prev.next;  // 停在 index - 1 stop at index - 1
>     if (prev.next == tail) tail = prev;         // 先维护尾巴 fix the tail first
>     prev.next = prev.next.next;
>     size--;
>     return true;
> }
> ```
> **按题面返回 `int[]` Return `int[]` as the statement says:**
> ```java
> public int[] getValues() {
>     int n = 0;
>     for (ListNode p = head.next; p != null; p = p.next) n++;  // 先数长度 count first
>     int[] res = new int[n];
>     int k = 0;
>     for (ListNode p = head.next; p != null; p = p.next) res[k++] = p.val;
>     return res;
> }
> ```
> 有 `size` 计数器的话第一趟可以省掉。 With a `size` counter, the counting pass goes away.

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 空链表 Empty list: `get(0)` 返回 `-1`，`remove(0)` 返回 `false`（哑节点的 `next` 是 `null`） → `get(0)` returns `-1`, `remove(0)` returns `false` (the dummy's `next` is `null`)
- [x] 删第 0 个 Remove index 0: `curr` 就是哑节点，和删中间一样 → `curr` is the dummy; same code as the middle
- [x] ⚠️ 删尾巴要更新 `tail` Update `tail` on removing the last node: 否则之后的 `insertTail` 接到脱离的节点上，值丢失 → otherwise later `insertTail` calls hang off a detached node and are lost
- [x] ⚠️ 删唯一元素 Remove the only element: `tail` 要退回哑节点，而不是 `null` → `tail` must go back to the dummy, not `null`
- [x] ⚠️ 空链表 `insertHead` Head insert into an empty list: 新节点同时是尾巴，要更新 `tail`（我的 `if (newHead.next == null)` 做的就是这个） → the new node is also the tail (my `if (newHead.next == null)` does this)
- [x] ⚠️ 下标远超长度 Index far past the end: 循环里不检查 `curr != null` 会空指针 → without the `curr != null` loop check you get an NPE
- [x] `remove` 起点写成 `head.next` Starting `remove` at `head.next`: 会停在目标本身，删掉的是下一个节点，`remove(0)` 也删不了第 0 个 → stops on the target itself, removes the node after it, and can never remove node 0
- [x] 哑节点的值 The dummy's value: `-1` 只是占位，永远不会被读到，和 `get` 越界返回的 `-1` 没有关系 → `-1` is a placeholder that's never read; unrelated to the `-1` that `get` returns
- [x] 构造函数参数顺序 Constructor order: 我的 `ListNode(ListNode next, int val)` 和 LeetCode 的 `ListNode(int val, ListNode next)` 相反，而且没被用到；做 LeetCode 题时注意别搞混 → mine is reversed from LeetCode's and unused here; don't mix them up on LeetCode

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| [[Design Linked List\|707. 设计链表 Design Linked List]] | LeetCode 版：多了 `addAtIndex`；单链表写法插入同样停在第 `index - 1` 个，双向链表加双哨兵则可以停在第 `index` 个 the LeetCode version adds `addAtIndex`; a singly linked version also stops at node `index - 1`, while a doubly linked one with two sentinels stops at node `index` |
| 203. 移除链表元素 Remove Linked List Elements | 哑节点删除所有等于 `val` 的节点 dummy head to remove every node equal to `val` |
| 19. 删除链表的倒数第 N 个结点 Remove Nth Node From End of List | 同样要停在目标的前一个，用前后指针相隔 n 步找到它 also stops before the target, found with two pointers n apart |
| 237. 删除链表中的节点 Delete Node in a Linked List | 只给要删的节点、拿不到前一个：把下一个的值抄过来再删下一个 you only get the target, not its predecessor: copy the next value over and delete the next node |
| 146. LRU 缓存 LRU Cache | 双向链表 + 哈希表，O(1) 删除任意节点 doubly linked list + hash map, O(1) removal of any node |
| 641. 设计循环双端队列 Design Circular Deque | 两端插入删除，链表或环形数组都能实现 insert/remove at both ends, with a list or a circular array |

## 7. ❓ 复习题 Review Questions

**Q1.** 为什么 `remove(i)` 要停在第 `i - 1` 个节点，而 `get(i)` 停在第 `i` 个？ Why does `remove(i)` stop at node `i - 1` while `get(i)` stops at node `i`?

> [!success]- 答案 Answer
> 删除要改的是**前一个节点的 `next`**，单链表回不去，所以必须站在前一个上。`get` 只读目标的值，站在目标上就行。
> Removing changes the **previous node's `next`**, and a singly linked list can't step back, so you must stand on the predecessor. `get` only reads the target's value, so standing on the target is enough.

**Q2.** 哑节点帮 `remove(0)` 省掉了什么？ What does the dummy head save in `remove(0)`?

> [!success]- 答案 Answer
> 没有哑节点时，第 0 个节点没有前一个，只能写 `if (index == 0) head = head.next;` 单独处理。有了哑节点，第 0 个的前一个就是哑节点，和其他位置一样执行 `curr.next = curr.next.next`。
> Without a dummy, node 0 has no predecessor, so you'd need `if (index == 0) head = head.next;` as a special case. With one, node 0's predecessor is the dummy, and the same `curr.next = curr.next.next` works.

**Q3.** 删尾巴时如果忘了更新 `tail`，会出什么问题？ What breaks if you forget to update `tail` when removing the last node?

> [!success]- 答案 Answer
> `tail` 还指着被摘掉的节点。下一次 `insertTail` 把新节点接在它后面，但它已经不在链表里了，所以新值从 `getValues` 里消失。不会报错，是一个安静的 bug。
> `tail` still points at the removed node. The next `insertTail` appends after it, but it's no longer in the list, so the new value never shows up in `getValues`. Nothing throws; it's a silent bug.

**Q4.** 为什么 `curr.next == tail` 的判断要放在 `curr.next = curr.next.next` 之前？ Why must the `curr.next == tail` check come before `curr.next = curr.next.next`?

> [!success]- 答案 Answer
> 断开之后 `curr.next` 已经是目标的下一个节点（删尾巴时是 `null`），再比较就不是在问“要删的是不是尾巴”了，`tail` 不会被更新。
> After unlinking, `curr.next` is the node after the target (`null` when removing the tail), so the comparison no longer asks "is the target the tail?" and `tail` never gets updated.

**Q5.** 删掉唯一的元素后，`tail` 应该指向哪里？为什么不是 `null`？ After removing the only element, where should `tail` point, and why not `null`?

> [!success]- 答案 Answer
> 指向哑节点。这和构造函数里空链表的状态一致，`insertTail` 执行 `tail.next = 新节点` 时就是 `head.next = 新节点`。如果是 `null`，`insertTail` 会空指针。
> At the dummy. That matches the empty state from the constructor, so `insertTail`'s `tail.next = new node` becomes `head.next = new node`. With `null`, `insertTail` would throw an NPE.

**Q6.** 链表和动态数组，`get(i)`、头部插入、尾部插入的复杂度分别是多少？ Compare `get(i)`, insert at head and insert at tail for this list vs a dynamic array.

> [!success]- 答案 Answer
> 链表：O(i)，O(1)，有尾指针时 O(1)。动态数组：O(1)，O(n)（要整体后移），均摊 O(1)。
> Linked list: O(i), O(1), O(1) with a tail pointer. Dynamic array: O(1), O(n) (shift everything), amortized O(1).

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[链表 Linked List|链表 Linked List]]（哑节点、停在前一个、先连后断 dummy head, stop at the predecessor, connect before you cut） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（尾指针用一个引用换 O(1) 尾插 one extra reference buys O(1) tail inserts）
- 双向版 Doubly linked version: [[Design Linked List|707. 设计链表 Design Linked List]]（双哨兵，停在目标本身 two sentinels, stop on the target itself）
- 对照 Counterpart: [[Design Dynamic Array|设计动态数组 Design Dynamic Array]]（随机访问 O(1)，头插 O(n) Random access O(1), head insert O(n)）
- 上一题 Previous: [[Reverse Linked List|206. 反转链表 Reverse Linked List]]（链表指针操作 linked-list pointer work）
- 下一题 Next: [[Merge Two Sorted Lists|21. 合并两个有序链表 Merge Two Sorted Lists]]（哑节点拼新链表，再加一个递归写法 a dummy head builds the result, plus a recursive version）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-26 |  | ✅ | `remove` 卡住过：从哑节点出发走 index 步停在前一个，删尾巴先把 tail 退回来 Got stuck on `remove`: walk index steps from the dummy to stop before the target, and move tail back when removing the last node |
