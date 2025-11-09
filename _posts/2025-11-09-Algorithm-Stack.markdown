---
layout: post
title:  Stack (LIFO) Notes
date:   2025-11-09 15:30
image:  algorithm.jpeg
tags:   [Fundation, Algorithm, Data Structure]
---

## Definition
A stack is a linear data structure that follows Last-In-First-Out (LIFO) ordering: the most recently added element is the first one removed. Primary operations are:
* push(x): add x to the top
* pop(): remove and return the top element
* peek()/top(): read the top element without removing it
* isEmpty(): check whether the stack has elements

Stacks are commonly implemented with arrays or linked lists and are used for function-call management, expression evaluation, backtracking, and more.

## When to Use
1. Expression evaluation and parsing
   * Convert infix to postfix (Shunting-yard algorithm)
   * Evaluate Reverse Polish Notation (RPN)
2. Backtracking / DFS
   * Maintain state history (undo operations)
   * Iterative depth-first search on graphs/trees
3. Language parsing and compilers
   * Matching parentheses, braces
   * Recursive-descent scaffolding (emulating recursion)
4. System-level stacks
   * Call stack, activation records
5. Misc
   * Min stack (track minimum in O(1))
   * Implementing other abstract data-types (e.g., stack-based queues)

## Core Idea
1. Keep a single pointer or index referencing the stack "top".
2. push: increment the top and write the new element (or insert at head for linked list).
3. pop: read the element at top, decrement the top (or remove head for linked list).
4. Keep invariants: top points to last inserted element (or -1/NULL when empty).

General array-backed formula (0-indexed):
```java
// push
stack[++top] = x;

// pop
int val = stack[top--];
```
For linked lists, the head serves as the top: push inserts at head; pop removes and returns head.

### Time/Space
* push/pop/peek: O(1) time
* Space: O(n) for n elements

### Java Example: Array-backed Stack
```java
class ArrayStack {
    private int[] data;
    private int top = -1;

    public ArrayStack(int cap) {
        data = new int[cap];
    }

    public void push(int x) {
        if (top + 1 == data.length) throw new IllegalStateException("stack overflow");
        data[++top] = x;
    }

    public int pop() {
        if (top == -1) throw new IllegalStateException("stack underflow");
        return data[top--];
    }

    public int peek() {
        if (top == -1) throw new IllegalStateException("empty stack");
        return data[top];
    }

    public boolean isEmpty() {
        return top == -1;
    }
}
```

### Java Example: Linked-list-backed Stack
```java
class ListNode { int val; ListNode next; ListNode(int v){val=v;} }

class LinkedStack {
    private ListNode head = null; // head is the top

    public void push(int x) {
        ListNode n = new ListNode(x);
        n.next = head;
        head = n;
    }

    public int pop() {
        if (head == null) throw new IllegalStateException("empty");
        int v = head.val;
        head = head.next;
        return v;
    }

    public int peek() {
        if (head == null) throw new IllegalStateException("empty");
        return head.val;
    }

    public boolean isEmpty() { return head == null; }
}
```

### Common Examples / Patterns
1. Valid Parentheses
```java
boolean isValid(String s) {
    Deque<Character> st = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.isEmpty()) return false;
            char t = st.pop();
            if ((c == ')' && t != '(') || (c == '}' && t != '{') || (c == ']' && t != '['))
                return false;
        }
    }
    return st.isEmpty();
}
```

2. Min Stack (track min in O(1)) — two-stack trick
```java
class MinStack {
    Deque<Integer> stack = new ArrayDeque<>();
    Deque<Integer> mins = new ArrayDeque<>();

    public void push(int x) {
        stack.push(x);
        if (mins.isEmpty() || x <= mins.peek()) mins.push(x);
    }

    public int pop() {
        int v = stack.pop();
        if (v == mins.peek()) mins.pop();
        return v;
    }

    public int getMin() { return mins.peek(); }
}
```

3. Evaluate Reverse Polish Notation (RPN)
4. Implementing DFS iteratively
5. Design problems: stack with constant-time max, stack using queues, queue using stacks

## Tips for using stacks
1. Always define what the "top" represents and how empty is encoded (top == -1 or head == null).
2. Watch for overflow/underflow for array-backed stacks.
3. When solving problems like parentheses, push the expected matching char rather than the opening one — it simplifies checks.
4. For "min"/"max" stacks maintain an auxiliary structure storing candidate extrema.
5. For converting recursive algorithms to iterative, emulate call frames with stack entries that hold both node and state.

### Prefer Deque (ArrayDeque) over java.util.Stack

In modern Java code prefer `Deque` (for example `ArrayDeque`) instead of the legacy `java.util.Stack` class. Reasons:

- Legacy design: `Stack` extends `Vector`, an older synchronized collection, and carries unnecessary legacy behavior.
- Synchronization overhead: `Vector` methods are synchronized which hurts single-threaded performance. `ArrayDeque` is unsynchronized and faster for typical use.
- Better API and flexibility: `Deque` supports both stack (LIFO) and queue (FIFO) semantics and provides clearer method names.
- Performance: `ArrayDeque` has better cache locality and lower constant factors than `Stack` or `LinkedList` in most cases.
- Null handling & safety: `ArrayDeque` forbids nulls (safer for many algorithms); if you need concurrency, choose a concurrent deque explicitly.

Method mapping (common):

- Stack-like (LIFO): `push(e)` -> `addFirst(e)`, `pop()` -> `removeFirst()`, `peek()` -> `peekFirst()`
- Queue-like (FIFO): `add(e)`/`offer(e)` -> `addLast(e)`/`offerLast(e)`, `poll()` -> `pollFirst()`

Example (preferred):
```java
Deque<Integer> st = new ArrayDeque<>();
st.push(1); // push as stack (addFirst)
st.push(2);
int v = st.pop(); // returns 2 (LIFO)
```

If you need thread-safety, use `ConcurrentLinkedDeque` or external synchronization — avoid `java.util.Stack` in new code.

## Common Interview Problems
* Valid Parentheses
* Evaluate Reverse Polish Notation
* Min Stack / Max Stack
* Next Greater Element (use stack of indices)
* Flatten nested lists using a stack
* Largest Rectangle in Histogram (monotonic stack)

## Detailed interview question answers

1) Valid Parentheses

Problem: Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid (every opening has a matching closing in the correct order).

Approach: Use a stack that stores opening brackets (or the expected closing bracket). When encountering an opening bracket push it (or its matching closing). When encountering a closing bracket, check stack non-empty and top matches; otherwise invalid. At the end the stack must be empty.

Complexity: O(n) time, O(n) space worst-case.

Java (readable) example:
```java
boolean isValid(String s) {
    Deque<Character> st = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(') st.push(')');
        else if (c == '{') st.push('}');
        else if (c == '[') st.push(']');
        else {
            if (st.isEmpty() || st.pop() != c) return false;
        }
    }
    return st.isEmpty();
}
```

Edge cases: empty string -> valid; single char -> invalid; characters other than brackets (problem-dependent).

2) Evaluate Reverse Polish Notation (RPN)

Problem: Evaluate an arithmetic expression given in RPN / postfix notation (tokens array). Operators are +, -, *, /.

Approach: Use a stack of numbers. Scan tokens left to right. If token is a number push it. If token is an operator pop two numbers (right operand first), compute, and push result. At the end stack has one number — the answer.

Complexity: O(n) time, O(n) space.

Java example:
```java
int evalRPN(String[] tokens) {
    Deque<Integer> st = new ArrayDeque<>();
    for (String t : tokens) {
        switch (t) {
            case "+": {int b = st.pop(), a = st.pop(); st.push(a + b); break;}
            case "-": {int b = st.pop(), a = st.pop(); st.push(a - b); break;}
            case "*": {int b = st.pop(), a = st.pop(); st.push(a * b); break;}
            case "/": {int b = st.pop(), a = st.pop(); st.push(a / b); break;}
            default: st.push(Integer.parseInt(t));
        }
    }
    return st.pop();
}
```

Note: Integer division in Java truncates toward zero — match the problem spec.

3) Min Stack / Max Stack

Problem: Design a stack that supports push, pop, top, and retrieving the minimum (or maximum) element in constant time.

Approach (two stacks): maintain the normal stack and an auxiliary stack that stores the current min (push also when new value <= current min; pop both when equal). Alternatively store pairs (value,minAtPush) on the main stack or use a delta trick for O(1) extra memory per element.

Complexity: O(1) per operation, O(n) space.

Java (two-stack) example:
```java
class MinStack {
    Deque<Integer> st = new ArrayDeque<>();
    Deque<Integer> mins = new ArrayDeque<>();

    void push(int x) {
        st.push(x);
        if (mins.isEmpty() || x <= mins.peek()) mins.push(x);
    }

    int pop() {
        int v = st.pop();
        if (v == mins.peek()) mins.pop();
        return v;
    }

    int top() { return st.peek(); }
    int getMin() { return mins.peek(); }
}
```

Edge: handle duplicate minima correctly (use <= on push).

4) Next Greater Element (array)

Problem: For each element in an array, find the next greater element to its right (or -1 if none).

Approach: Monotonic decreasing stack of indices. Iterate from left to right, when current element > element at stack top index, pop index and set result[index] = current. Push current index. At the end remaining indices have -1.

Complexity: O(n) time, O(n) space.

Java example:
```java
int[] nextGreater(int[] a) {
    int n = a.length;
    int[] res = new int[n]; Arrays.fill(res, -1);
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        while (!st.isEmpty() && a[i] > a[st.peek()]) {
            res[st.pop()] = a[i];
        }
        st.push(i);
    }
    return res;
}
```

5) Flatten Nested Lists (stack)

Problem: Given a nested list of integers (list elements are either integers or lists), return a flattened sequence of integers.

Approach: Use a stack of iterators or a stack of NestedInteger objects. For iteration you can push elements in reverse order and pop: if popped item is integer yield it, otherwise push its sublist elements (again reversed) so the next pop is the first element.

Complexity: O(n) total time to output n integers, O(h) auxiliary space where h is nesting depth (or O(n) if you push all items at once).

Sketch (push reversed):
```java
// assume NestedInteger API: boolean isInteger(); Integer getInteger(); List<NestedInteger> getList();
class NestedIterator implements Iterator<Integer> {
    Deque<NestedInteger> st = new ArrayDeque<>();
    NestedIterator(List<NestedInteger> nestedList) {
        for (int i = nestedList.size()-1; i >= 0; --i) st.push(nestedList.get(i));
    }
    public Integer next() {
        makeTopInteger();
        return st.pop().getInteger();
    }
    public boolean hasNext() {
        makeTopInteger();
        return !st.isEmpty();
    }
    private void makeTopInteger() {
        while (!st.isEmpty() && !st.peek().isInteger()) {
            List<NestedInteger> lst = st.pop().getList();
            for (int i = lst.size()-1; i >= 0; --i) st.push(lst.get(i));
        }
    }
}
```

6) Largest Rectangle in Histogram (monotonic stack)

Problem: Given bar heights, find the largest rectangle area that can be formed in the histogram.

Approach: Use a monotonic increasing stack of indices. Iterate from left to right, and when current height is less than height at stack top, pop top index hIdx and compute area = height[hIdx] * width where width is (i - stack.peek() - 1) after popping. Use sentinel zero heights at both ends or append a zero at the end to flush the stack.

Complexity: O(n) time, O(n) space.

Java example:
```java
int largestRectangleArea(int[] h) {
    int n = h.length;
    Deque<Integer> st = new ArrayDeque<>();
    int max = 0;
    for (int i = 0; i <= n; i++) {
        int cur = (i == n) ? 0 : h[i];
        while (!st.isEmpty() && cur < h[st.peek()]) {
            int height = h[st.pop()];
            int left = st.isEmpty() ? -1 : st.peek();
            int width = i - left - 1;
            max = Math.max(max, height * width);
        }
        st.push(i);
    }
    return max;
}
```

Edge: use sentinel or final pass with 0 to ensure stack empties. Watch for int overflow if heights * width can be large (use long if necessary).

### Final note
Stacks are simple but powerful. Once you master push/pop invariants and common patterns (monotonic stacks, auxiliary stacks for extrema), you can apply stacks to parsing, graph search, expression evaluation, and many algorithmic design problems.
