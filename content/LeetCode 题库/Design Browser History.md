---
title: "1472. 设计浏览器历史记录 Design Browser History"
aliases:
  - 设计浏览器历史记录
  - LeetCode 1472
  - Design Browser History
  - BrowserHistory
tags:
  - LeetCode
  - Interview-Prep
  - Linked-List
  - Doubly-Linked-List
  - Design
difficulty: Medium
pattern: "Design / Doubly Linked List (Cursor)"
link: https://leetcode.com/problems/design-browser-history/
status: 🟡 review
created: 2026-10-29
publish: true
last-reviewed: 2026-10-29
---

# 🌐 1472. Design Browser History

> [!abstract] TL;DR
> 把浏览历史存成一条**双向链表**，再用一个 `curr` 指针指着**当前页**。后退就沿 `prev` 走，前进就沿 `next` 走，走到头就停。访问新页面时直接把新节点接在 `curr.next` 上，**原来的前进历史一下子全断开了**，没有引用的节点交给 GC 回收。
> Store the history as a **doubly linked list** with a `curr` pointer on the **current page**. Back walks `prev`, forward walks `next`, and both stop at the end. Visiting a page hangs a new node on `curr.next`, which **cuts off the whole forward history in one assignment**; the unreachable nodes are left to the GC. ⏱️ `visit` O(1), `back` / `forward` O(min(steps, k)), k = pages available · 🗄️ O(n)

## 1. 📋 题目 Problem

浏览器只有一个标签页，从主页 `homepage` 开始。你可以访问新网址，也可以后退或前进若干步。
A browser has one tab and starts on `homepage`. You can visit a new URL, or move back or forward some number of steps.

| 方法 Method | 作用 Behavior |
| --- | --- |
| `BrowserHistory(String homepage)` | 用主页初始化 Start on `homepage` |
| `void visit(String url)` | 从当前页访问 `url`，**清空所有前进历史** Visit `url` from the current page and **clear all forward history** |
| `String back(int steps)` | 最多后退 `steps` 步，返回到达的页面 Move back at most `steps` pages and return the page you land on |
| `String forward(int steps)` | 最多前进 `steps` 步，返回到达的页面 Move forward at most `steps` pages and return the page you land on |

```
操作 Calls:  ["BrowserHistory", "visit", "visit", "visit", "back", "back", "forward", "visit", "forward", "back", "back"]
参数 Args:   [["leetcode.com"], ["google.com"], ["facebook.com"], ["youtube.com"], [1], [1], [1], ["linkedin.com"], [2], [2], [7]]
输出 Output: [null, null, null, null, "facebook.com", "google.com", "facebook.com", null, "linkedin.com", "google.com", "leetcode.com"]
```

关键是第 8 步：在 `facebook.com` 上访问 `linkedin.com`，原来排在后面的 `youtube.com` 就没了，所以之后的 `forward(2)` 只能停在 `linkedin.com`。
The key is call 8: visiting `linkedin.com` from `facebook.com` drops `youtube.com`, which used to come next, so the later `forward(2)` can only reach `linkedin.com`.

约束 Constraints: 主页和网址长度在 `[1, 20]` 之间，只含 `.` 和小写字母；`steps` 在 `[1, 100]` 之间；三个方法总共最多调用 5000 次。
`homepage` and `url` have length in `[1, 20]` and contain only `.` and lowercase letters; `steps` is in `[1, 100]`; there are at most 5000 calls in total to `visit`, `back` and `forward`.

## 2. 💡 思路 Intuition

- **关键观察 Key insight:** 历史记录是一条线，当前页是线上的一个位置。后退和前进只是**移动这个位置**，不增删任何页面；只有 `visit` 会改动这条线，而且只改当前页后面那一段。
  History is a line and the current page is a position on it. Back and forward only **move that position** without adding or removing pages; only `visit` changes the line, and only the part after the current page.
- **为什么是双向链表 Why a doubly linked list:** 要往两个方向走，所以每个节点既要 `next` 又要 `prev`。`visit` 只需要改 `curr.next` 一个引用，就把整段前进历史“剪掉”。
  You walk in both directions, so each node needs both `next` and `prev`. `visit` rewires one reference, `curr.next`, and "cuts off" the whole forward history.
- **不需要哨兵 No sentinels needed:** 和 [[Design Linked List|707. 设计链表 Design Linked List]] 不同，这里链表永远不空（至少有主页），也从不删中间的节点，所以 `prev == null` 和 `next == null` 正好就是“到头了”的信号。
  Unlike 707, the list is never empty (the homepage is always there) and nothing is ever deleted from the middle, so `prev == null` and `next == null` are exactly the "can't go further" signals.
- **套路 Pattern:** 设计题 + 双向链表 + 游标指针。
  A design problem with a doubly linked list and a cursor pointer.

```
visit ×3 之后 After three visits:

  null ← [leetcode] ⇄ [google] ⇄ [facebook] ⇄ [youtube] → null
                                                  ▲ curr

back(1), back(1), forward(1):

  null ← [leetcode] ⇄ [google] ⇄ [facebook] ⇄ [youtube] → null
                                    ▲ curr

visit("linkedin.com"):

  null ← [leetcode] ⇄ [google] ⇄ [facebook] ⇄ [linkedin] → null
                                                  ▲ curr
                                    [youtube]  ← 没人指向它了，等 GC 回收
                                                 unreachable now; GC reclaims it
```

## 3. 🐢 暴力解 Brute Force

- 思路 Idea: 用一个 `ArrayList<String>` 存所有页面，再用下标 `curr` 表示当前页。`visit` 时先把 `curr` 后面的元素逐个删掉，再 `add` 新网址。
  Keep every page in an `ArrayList<String>` with an index `curr`. On `visit`, remove the elements after `curr` one by one, then `add` the new URL.
- 后退前进直接改下标，O(1)；但 `visit` 要把前进历史逐个删掉，单次最坏 O(n)（每页最多被删一次，所以均摊下来也是 O(1)）。
  Back and forward just move the index, O(1); but each `visit` deletes the forward history, O(n) in the worst case for one call (each page is deleted at most once, so it is amortized O(1) too).
- 能通过，而且只要不真删、改成“覆盖 + 记录最后一个有效位置”，就是下面均摊 O(1) 的数组写法。
  It passes, and if you overwrite instead of deleting and track the last valid index, it becomes the amortized O(1) array version below.

## 4. 🚀 最优解 Optimal Solution

我的解法 (My solution, Java):

```java
class ListNode {
    ListNode prev;
    ListNode next;
    String val;

    public ListNode(String val, ListNode prev, ListNode next) {
        this.val = val;
        this.prev = prev;
        this.next = next;
    }
}

class BrowserHistory {

    private ListNode curr;   // 当前页 the current page

    public BrowserHistory(String homepage) {
        curr = new ListNode(homepage, null, null);   // 只有主页 just the homepage
    }

    public void visit(String url) {
        curr.next = new ListNode(url, curr, null);   // 覆盖 next，前进历史全部断开 overwrite next; forward history is cut off
        curr = curr.next;                            // 移到新页 move to the new page
    }

    public String back(int steps) {
        while (curr != null && curr.prev != null && steps > 0) {   // 还有上一页才走 step only while there is a previous page
            curr = curr.prev;
            steps--;
        }
        return curr.val;
    }

    public String forward(int steps) {
        while (curr != null && curr.next != null && steps > 0) {   // 还有下一页才走 step only while there is a next page
            curr = curr.next;
            steps--;
        }
        return curr.val;
    }
}
```

| 操作 Operation | ⏱️ Time |
| --- | --- |
| `BrowserHistory` / `visit` | O(1) |
| `back(steps)` / `forward(steps)` | O(min(steps, k))，`k` 是那个方向上还能走的页数 where `k` is the number of pages available in that direction |

- 🗄️ Space: O(n)，`n` 是当前还能访问到的页面数；被 `visit` 剪掉的节点可以被 GC 回收（何时回收由 JVM 决定） `n` is the number of reachable pages; nodes cut off by `visit` become eligible for garbage collection (when is up to the JVM)

### 4.1 ✂️ 一行代码清空前进历史 One line clears the forward history

`visit` 的第一行 `curr.next = new ListNode(url, curr, null)` 同时做了三件事：
The first line of `visit`, `curr.next = new ListNode(url, curr, null)`, does three things at once:

1. 新节点的 `prev` 指向 `curr`，以后能退回来 → the new node's `prev` is `curr`, so you can come back
2. 新节点的 `next` 是 `null`，它就是新的最后一页 → the new node's `next` is `null`, so it's the new last page
3. 覆盖 `curr.next`，原来的整段前进历史从此不可达 → overwriting `curr.next` makes the old forward history unreachable

被剪掉的那段里，第一个节点的 `prev` 还指着 `curr`，但方向是“它指向我们”，不是“我们指向它”。GC 只看从根出发能不能到达，所以整段都会被回收，不用一个个删。
The first node of the cut-off part still has `prev` pointing at `curr`, but that's "it points at us", not "we point at it". The GC only cares what's reachable from the roots, so the whole segment is reclaimed with no node-by-node deletion.

### 4.2 🧱 循环条件里的三个检查 The three checks in the loop

| 检查 Check | 作用 Purpose |
| --- | --- |
| `curr.prev != null` / `curr.next != null` | 到头就停，这就是“最多走 `steps` 步” stop at the end, which is the "at most `steps`" rule |
| `steps > 0` | 走够了就停 stop once you've taken enough steps |
| `curr != null` | 其实永远为真，可以删掉 always true, so it can go |

`curr` 一开始是主页节点，之后只会被赋成 `curr.prev`、`curr.next` 或新节点，而前两个都在确认不是 `null` 之后才赋值。所以 `curr` 永远不会是 `null`，这个检查是多余的；留着也不影响正确性，只是多读一次。
`curr` starts as the homepage node and is only ever set to `curr.prev`, `curr.next` (each checked for `null` first) or a new node. So `curr` is never `null` and the check is redundant; keeping it is harmless, just one extra comparison.

> [!example] 走一遍 Trace: 题目示例 The example
>
> | 操作 Op | 链表 List（`*` 是 curr `*` marks curr） | 返回 Returns |
> | --- | --- | --- |
> | `BrowserHistory("leetcode.com")` | `*leetcode` | |
> | `visit("google.com")` | `leetcode ⇄ *google` | |
> | `visit("facebook.com")` | `leetcode ⇄ google ⇄ *facebook` | |
> | `visit("youtube.com")` | `leetcode ⇄ google ⇄ facebook ⇄ *youtube` | |
> | `back(1)` | `leetcode ⇄ google ⇄ *facebook ⇄ youtube` | `"facebook.com"` |
> | `back(1)` | `leetcode ⇄ *google ⇄ facebook ⇄ youtube` | `"google.com"` |
> | `forward(1)` | `leetcode ⇄ google ⇄ *facebook ⇄ youtube` | `"facebook.com"` |
> | `visit("linkedin.com")` | `leetcode ⇄ google ⇄ facebook ⇄ *linkedin`（剪掉了 youtube 页 the youtube page is cut off） | |
> | `forward(2)` | `leetcode ⇄ google ⇄ facebook ⇄ *linkedin`（`next` 是 `null`，一步也走不了 `next` is `null`, no steps taken） | `"linkedin.com"` |
> | `back(2)` | `leetcode ⇄ *google ⇄ facebook ⇄ linkedin` | `"google.com"` |
> | `back(7)` | `*leetcode ⇄ google ⇄ facebook ⇄ linkedin`（只走了一步就到头 stopped after one step） | `"leetcode.com"` |

> [!note] 其他写法 Alternatives
> **数组 + 两个下标 Array plus two indices:** `curr` 是当前页，`last` 是最后一个有效页。`visit` 不删任何东西，先把 `curr` 移到 `curr + 1` 并覆盖那个位置，再把 `last` 设成新的 `curr`，后面的旧数据就“作废”了。后退前进用 `Math.max` / `Math.min` 一步算出结果，不用循环。
> `curr` is the current page and `last` the last valid one. `visit` deletes nothing: it moves `curr` to slot `curr + 1`, overwrites that slot, then sets `last` to the new `curr`, which "invalidates" anything after it. Back and forward clamp with `Math.max` / `Math.min` in one step, no loop.
> ```java
> class BrowserHistory {
>     private final List<String> history = new ArrayList<>();
>     private int curr = 0;   // 当前页 current page
>     private int last = 0;   // 最后一个有效页 last valid page
>
>     public BrowserHistory(String homepage) {
>         history.add(homepage);
>     }
>
>     public void visit(String url) {
>         curr++;
>         if (curr < history.size()) {
>             history.set(curr, url);   // 覆盖旧的前进历史 overwrite old forward history
>         } else {
>             history.add(url);
>         }
>         last = curr;                  // 后面的都作废 everything after is now invalid
>     }
>
>     public String back(int steps) {
>         curr = Math.max(0, curr - steps);
>         return history.get(curr);
>     }
>
>     public String forward(int steps) {
>         curr = Math.min(last, curr + steps);
>         return history.get(curr);
>     }
> }
> ```
> 代价是作废的旧网址还留在数组里，直到被覆盖；数组只会变长，不会变短。
> The price: invalidated URLs stay in the array until overwritten, and the array only grows.
>
> **两个栈 Two stacks:** 后退栈的栈顶是当前页，前进栈存“后退时离开的页”。`visit` 压入后退栈并清空前进栈；后退时从后退栈弹出压到前进栈（保留至少一页），前进反过来。`back` / `forward` 是 O(min(steps, k))，`visit` 清空前进栈的代价可以均摊到之前 `back` 把这些页面压进前进栈的操作上（假设清空花的时间和栈大小成正比）。见 [[栈 Stack|栈 Stack]]。
> The back stack's top is the current page; the forward stack holds pages you left by going back. `visit` pushes onto the back stack and clears the forward stack; `back` pops from the back stack onto the forward stack (keeping at least one page), and `forward` does the reverse. `back` / `forward` are O(min(steps, k)), and the cost of clearing the forward stack in `visit` amortizes against the `back` calls that pushed those pages onto it (assuming clearing costs time proportional to the stack size).

| 写法 Approach | `visit` | `back` / `forward` | 说明 Notes |
| --- | --- | --- | --- |
| 双向链表（我的解法） Doubly linked list (mine) | O(1) | O(min(steps, k)) | 剪断一个引用就清空前进历史 one reference cut clears forward history |
| 数组 + 两个下标 Array + two indices | 均摊 O(1) Amortized O(1) | O(1) | 通常最快，作废的数据留在数组里 usually the fastest; stale entries stay in the array |
| 两个栈 Two stacks | 均摊 O(1) Amortized O(1) | O(min(steps, k)) | 思路直观，`visit` 要清空前进栈 intuitive; `visit` clears the forward stack |

## 5. ⚠️ 易错点 Edge Cases & Pitfalls

- [x] 后退超过开头 Back past the start: 停在主页，返回主页 → stop on the homepage and return it (`back(7)` in the example)
- [x] 前进超过结尾 Forward past the end: 停在最后一页 → stop on the last page (`forward(2)` after a `visit`)
- [x] ⚠️ 忘了清空前进历史 Forgetting to clear forward history: 如果 `visit` 把新节点插在 `curr` 和 `curr.next` 中间，旧的前进页还在，`forward` 会走到不该存在的页面 → if `visit` inserts between `curr` and `curr.next`, the old forward pages survive and `forward` reaches pages that should be gone
- [x] ⚠️ 新节点漏设 `prev` Missing `prev` on the new node: 写成 `new ListNode(url, null, null)` 的话，`visit` 之后就退不回去了 → with `new ListNode(url, null, null)`, you can't go back after a `visit`
- [x] 先移动再接 Moving before linking: 只写 `curr = new ListNode(url, curr, null)` 的话，旧页的 `next` 没有更新，退回去之后前进到不了新页面；要先接 `curr.next` 再移动 `curr` → with only `curr = new ListNode(url, curr, null)`, the old page's `next` is never updated, so after going back, `forward` never reaches the new page; link `curr.next` first, then move `curr`
- [x] 多余的 `curr != null` Redundant `curr != null`: `curr` 永远不是 `null`，可以删掉，不影响结果 → `curr` is never `null`, so this check can go without changing the result
- [x] 数组写法的 `last` The array version's `last`: `forward` 必须用 `last` 而不是 `history.size() - 1` 当上界，否则会走进作废的旧页面 → `forward` must clamp to `last`, not `history.size() - 1`, or it walks into stale pages

## 6. 🔁 进阶 Follow-ups

| 题目 Problem | 和本题的关系 Connection |
| --- | --- |
| [[Design Linked List\|707. 设计链表 Design Linked List]] | 同样是双向链表，加了双哨兵和按下标增删 the same doubly linked list, plus two sentinels and indexed inserts and deletes · Medium |
| 146. LRU 缓存 LRU Cache | 哈希表 + 双向链表，节点要在链表里移动 a hash map plus a doubly linked list where nodes move around · Medium |
| 155. 最小栈 Min Stack | 另一道“设计一个类”的题，可以对比两个栈的写法 another design-a-class problem; compare with the two-stack approach · Medium |
| 641. 设计循环双端队列 Design Circular Deque | 两端都能进出，双向链表或环形数组 both ends open; a doubly linked list or a circular array · Medium |

## 7. ❓ 复习题 Review Questions

**Q1.** `visit` 怎样用一行代码清空所有前进历史？ How does `visit` clear all forward history in one line?

> [!success]- 答案 Answer
> 把 `curr.next` 覆盖成新节点。原来的前进历史只能通过 `curr.next` 到达，覆盖之后就不可达了，GC 会回收整段。
> It overwrites `curr.next` with the new node. The old forward history was reachable only through `curr.next`, so it becomes unreachable and the GC reclaims the whole segment.

**Q2.** 被剪掉的第一个节点的 `prev` 还指着 `curr`，会不会导致内存泄漏？ The first cut-off node's `prev` still points at `curr`. Is that a memory leak?

> [!success]- 答案 Answer
> 不会。GC 看的是从根（比如 `BrowserHistory` 对象）出发能不能到达。它指向我们没关系，只要我们这边没有引用指向它，它就会被回收。
> No. The GC checks reachability from the roots (such as the `BrowserHistory` object). It pointing at us doesn't matter; as long as nothing on our side points at it, it gets collected.

**Q3.** 为什么这题不需要哨兵，707 却需要？ Why does this problem need no sentinels when 707 does?

> [!success]- 答案 Answer
> 这里链表永远不空，也从不删中间节点，只在当前页后面接新节点；`prev == null` 和 `next == null` 正好表示“到头了”。707 要在任意位置插入删除，哨兵才能省掉空链表和首尾的特殊情况。
> Here the list is never empty and nothing is deleted from the middle; new nodes only go after the current page, and `prev == null` / `next == null` mean exactly "can't go further". 707 inserts and deletes anywhere, which is where sentinels remove the empty-list and first/last special cases.

**Q4.** 数组写法为什么需要 `last`，而不是直接用 `history.size() - 1`？ Why does the array version need `last` instead of `history.size() - 1`?

> [!success]- 答案 Answer
> `visit` 只覆盖 `curr + 1` 这一个位置，后面的旧网址还留在数组里。`last` 记录真正有效的最后一页；用 `size() - 1` 的话，`forward` 会走到已经作废的页面。
> `visit` overwrites only slot `curr + 1`, so older URLs remain after it. `last` marks the real last page; with `size() - 1`, `forward` would reach invalidated pages.

**Q5.** 链表写法的 `back(steps)` 是 O(steps) 还是 O(1)？ Is the linked-list `back(steps)` O(steps) or O(1)?

> [!success]- 答案 Answer
> O(min(steps, k))，`k` 是后面还能退的页数，因为链表只能一步一步走。数组写法能直接算出下标，所以是 O(1)。这题 `steps ≤ 100`，两种都很快。
> O(min(steps, k)), where `k` is the number of pages you can go back, because a linked list moves one node at a time. The array version computes the index directly, so it's O(1). With `steps ≤ 100`, both are fast here.

## 8. 🔗 相关题目 Related

- [[📌 LeetCode 总览]]
- 🧠 概念 Concepts: [[链表 Linked List|链表 Linked List]]（双向链表加游标 a doubly linked list with a cursor） · [[复杂度分析 Big-O|复杂度分析 Big-O]]（链表 O(steps) 对比数组 O(1) linked list O(steps) vs array O(1)）
- 对照 Compare with: [[Design Linked List|707. 设计链表 Design Linked List]]（双哨兵，可以在任意位置增删 two sentinels, inserts and deletes anywhere）
- 上一题 Previous: [[Design Linked List|707. 设计链表 Design Linked List]]（双向链表 doubly linked list）

## 9. 🔁 复习记录 Review Log

| 📅 Date | ⏱️ Time spent | ✅ Solved alone? | 📝 Notes |
| --- | --- | --- | --- |
| 2026-10-29 |  | ✅ | 覆盖 `curr.next` 就清空前进历史；后退前进到头就停 Overwriting `curr.next` clears forward history; back and forward stop at the ends |
