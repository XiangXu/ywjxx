---
title: "LLM Decoding — Temperature, Top-p, and Greedy Decoding"
aliases:
  - LLM Sampling
  - Temperature and Top-p
  - 贪心解码
tags:
  - AI
  - LLM
  - Machine-Learning
  - Interview-Prep
  - Token-Sampling
created: 2026-10-15
---

# LLM Decoding: Temperature, Top-p, and Greedy Decoding

## 1. 核心概念 Overview

大语言模型（LLM）生成文本时，会根据当前上下文预测下一个 Token，然后不断重复这个过程，直到生成完整回答。

例如，你问 AI：

> 我今天想喝……

模型预测下一个 Token 的概率可能如下（本笔记统一使用这个例子）：

| 候选词 | 概率 |
| --- | --- |
| 奶茶 | 70% |
| 咖啡 | 20% |
| 果汁 | 10% |

这里需要理解三个重要概念：

- **Temperature（温度）**：调整概率分布，让模型更偏向高概率词，或者更愿意尝试其他词。
- **Top-p（核采样）**：根据累计概率筛选候选 Token。
- **Greedy Decoding（贪心解码）**：每一步都选择当前概率最高的 Token，不进行随机抽样。

> [!abstract] 一句话区分
> - Temperature：调整概率分布。
> - Top-p：筛选候选范围。
> - Greedy Decoding：选择最高概率的 Token。

### 同一个例子，三种结果

| 方式 | 做法 | 结果 |
| --- | --- | --- |
| 贪心解码 | 直接选概率最高的词 | 永远是奶茶 |
| 随机采样 + Temperature | 先调整概率，再按调整后的概率随机抽 | 大概率奶茶，也可能是咖啡或果汁 |
| Top-p = 0.9 | 保留奶茶 + 咖啡（累计 90%），排除果汁，归一化后再抽 | 奶茶或咖啡 |

## 2. Temperature（温度）

### 2.1 通俗解释

把 Temperature 想象成一个控制 AI 有多愿意尝试不同答案的旋钮。

- **低 Temperature（T < 1）**：概率分布更集中，模型更偏向高概率选项。
- **Temperature = 1**：保持原始概率分布不变。
- **高 Temperature（T > 1）**：概率分布更平坦，低概率选项相对更容易被选中。
- **Temperature = 0**：常见推理系统会切换到贪心解码，而不是直接执行除以零的运算。

### 2.2 数学原理

常见的做法是先将 logits 除以温度，再经过 Softmax：

$$
P_i(T) = \frac{e^{z_i/T}}{\sum_j e^{z_j/T}}
$$

其中：

- $z_i$：Token $i$ 的 logit，即模型输出的原始分数。
- $T$：Temperature。
- $P_i(T)$：经过调整后的概率。

也可以直接用原始概率 $P_i$ 计算（两者等价）：

$$
P_i(T) = \frac{P_i^{1/T}}{\sum_j P_j^{1/T}}
$$

这个公式适用于 $T > 0$。Temperature 为零时，实际系统通常采用专门的解码逻辑。

### 2.3 数值例子：Temperature 如何改变概率？

用同一组原始概率（奶茶 70%、咖啡 20%、果汁 10%）计算：

| 候选词 | T = 0.5（低温） | T = 1（原样） | T = 2（高温） |
| --- | --- | --- | --- |
| 奶茶 | ≈ 90.74% | 70% | ≈ 52.29% |
| 咖啡 | ≈ 7.41% | 20% | ≈ 27.95% |
| 果汁 | ≈ 1.85% | 10% | ≈ 19.76% |

- **T = 0.5**：奶茶的优势被放大，但如果仍在随机采样，咖啡和果汁并非完全不可能被选中。
- **T = 1**：概率不变。
- **T = 2**：奶茶仍然最可能被选中，但咖啡和果汁的相对机会明显增加，输出更多样。

> [!note] 计算说明
> 以上数值用 $P_i^{1/T}$ 归一化得到，假设原始概率是 Softmax 输出，且只有这三个候选词。例如 T = 0.5 时：$0.7^2 : 0.2^2 : 0.1^2 = 0.49 : 0.04 : 0.01$，归一化后得到 90.74% / 7.41% / 1.85%。

### 2.4 低 Temperature ≠ 贪心解码

- `temperature = 0.5`：通常仍然在采样，奶茶最可能被选中，但仍可能选到咖啡。
- `temperature = 2`：在更平坦的分布上采样，多样性更高。
- **贪心解码**：不抽样，只要奶茶的分数最高，就一定选奶茶。

### 2.5 怎么选 Temperature？

| 设置 | 特点 | 适用场景 |
| --- | --- | --- |
| 低（如 0.2） | 集中、稳定 | 分类、信息抽取、写代码 |
| 高（如 1.0） | 多样、有创意 | 头脑风暴、创意写作 |

> [!tip] 记忆方法
> Temperature 就像调整一个人的冒险程度：温度低时更保守，温度高时更愿意尝试不同选择。
> T = 1 保持原分布；T < 1 让分布更尖锐；T > 1 让分布更平坦；T = 0 通常对应贪心解码。

**Key takeaway:** Temperature changes the shape of the probability distribution, not the candidate set directly.

## 3. Top-p（核采样 Nucleus Sampling）

### 3.1 通俗解释

把 Top-p 想象成去奶茶店点饮料。

你规定：

> 只考虑最受欢迎的饮料，直到这些饮料的累计受欢迎程度达到 90%。

模型先按概率从高到低排列候选 Token，再累加概率，保留累计概率首次达到或超过指定阈值所需的最小候选集合，通常再归一化后采样。

### 3.2 中文例子：Top-p = 0.9

| 候选词 | 概率 | 累计概率 |
| --- | --- | --- |
| 奶茶 | 70% | 70% |
| 咖啡 | 20% | 90% |
| 果汁 | 10% | 100% |

当 `top_p = 0.9` 时：

1. 保留奶茶，累计概率为 70%。
2. 加入咖啡，累计概率达到 90%。
3. 果汁被排除，不参与后续采样。

保留的概率通常会重新归一化：

| 候选词 | 原始概率 | 归一化后概率 |
| --- | --- | --- |
| 奶茶 | 70% | 77.78% |
| 咖啡 | 20% | 22.22% |

最终，模型从奶茶和咖啡中进行采样。

> [!important] 关键区别
> Top-p 控制哪些 Token 可以参与采样，而不是直接控制概率分布有多尖锐。

### 3.3 Temperature 与 Top-p 的关系

Temperature 改变概率分布，Top-p 再根据（调整后的）分布筛选候选词。所以**改变 Temperature 也会改变 Top-p 保留下来的候选集合**。

用 2.3 的数值 + `top_p = 0.9` 举例（假设先应用 Temperature）：

| Temperature | 调整后分布 | Top-p = 0.9 保留 |
| --- | --- | --- |
| T = 0.5 | 奶茶 90.74% 已超过 90% | 只剩奶茶 |
| T = 1 | 奶茶 70% + 咖啡 20% = 90% | 奶茶、咖啡 |
| T = 2 | 奶茶 52.29% + 咖啡 27.95% = 80.24% < 90% | 奶茶、咖啡、果汁 |

具体系统中两者的执行顺序可能有所不同。

**Key takeaway:** Top-p filters the candidate set based on cumulative probability.

## 4. Greedy Decoding（贪心解码）

### 4.1 通俗解释

贪心解码的规则非常简单：

> 每一步都选择当前概率最高的 Token。

| 候选词 | 概率 | 是否选择 |
| --- | --- | --- |
| 奶茶 | 70% | 是 |
| 咖啡 | 20% | 否 |
| 果汁 | 10% | 否 |

贪心解码直接选择“奶茶”，而不是随机抽取一个候选词。

### 4.2 数学定义

$$
x_t = \arg\max_x P(x \mid x_{<t})
$$

其中：

- $x_t$：当前生成的 Token。
- $x_{<t}$：之前已经生成的 Token。
- $P(x \mid x_{<t})$：给定当前上下文时，下一个 Token 的概率。

### 4.3 中文生活化例子

> 中国的首都是哪里？

| 候选词 | 概率 |
| --- | --- |
| 北京 | 95% |
| 上海 | 3% |
| 广州 | 2% |

贪心解码会选择“北京”，因为它的概率最高。在普通采样中，模型则可能根据概率分布抽取 Token，而不是永远选择最高概率的选项。

### 4.4 重要局限：局部最优 ≠ 全局最优

贪心解码是一种**局部决策策略**：它只保证每一步选当前概率最高的 Token，并不保证整句话的总概率最高（全局最优）。

另一个实际问题：贪心解码虽然确定，但输出**容易重复、死板**，因为每次都走同一条最可能的路径。

> [!tip] 记忆方法
> 贪心解码就像考试时每题都选自己最有把握的选项，不随机抽答案；也像每一步都走眼前最好的路，但不会探索其他路径。

**Key takeaway:** Greedy decoding is a selection strategy that always picks the highest-probability token at each step; Temperature and Top-p are sampling controls.

## 5. Top-k vs Top-p

### 5.1 通俗解释

Top-k 和 Top-p 都是用来**筛选 AI 可以选择哪些 Token** 的方法，区别在于：

- **Top-k**：按**数量**筛选，固定保留概率最高的 K 个候选词。
- **Top-p**：按**累计概率**筛选，保留累计概率达到指定阈值的最小候选集合。

> [!tip] 记忆方法
> Top-k 看数量，Top-p 看累计概率。
> - Top-k = Keep the top K tokens.
> - Top-p = Keep tokens until cumulative probability reaches p.

### 5.2 中文例子

三个候选词很难看出两者的区别，所以这里把奶茶例子扩展成五个候选词：

> 我今天想喝……

| 候选词 | 概率 |
| --- | --- |
| 奶茶 | 40% |
| 咖啡 | 30% |
| 果汁 | 15% |
| 牛奶 | 10% |
| 可乐 | 5% |

**Top-k：固定选几个（`top_k = 3`）**

保留概率最高的 3 个：奶茶、咖啡、果汁。牛奶和可乐被排除，因为只保留三个候选词。

**Top-p：累计概率达到多少（`top_p = 0.8`）**

| 候选词 | 概率 | 累计概率 | 是否保留 |
| --- | --- | --- | --- |
| 奶茶 | 40% | 40% | 是 |
| 咖啡 | 30% | 70% | 是 |
| 果汁 | 15% | 85% | 是 |
| 牛奶 | 10% | 95% | 否 |
| 可乐 | 5% | 100% | 否 |

加入果汁后，累计概率从 70% 变成 85%，首次达到 80%，因此保留前三个候选词。

> [!note] 注意
> Top-p 保留的是累计概率**首次达到或超过**阈值的最小集合，不要求恰好等于 80%。

在这个例子里两种方法恰好都保留了三个词，归一化后都是：奶茶 ≈ 47.06%、咖啡 ≈ 35.29%、果汁 ≈ 17.65%（例如 40 ÷ 85）。区别要在概率分布变化时才看得出来。

### 5.3 哪个更灵活？

同样设 `top_k = 3`、`top_p = 0.8`，换两种分布：

| 分布 | 概率 | Top-k = 3 保留 | Top-p = 0.8 保留 |
| --- | --- | --- | --- |
| 集中（模型很确定） | 奶茶 90%、咖啡 4%、果汁 3%、牛奶 2%、可乐 1% | 3 个 | **1 个**（奶茶 90% 已超过 80%） |
| 平坦（模型不确定） | 五个词各 20% | 3 个 | **4 个**（20% → 40% → 60% → 80%） |

- 一个词的概率特别高时，Top-p 只保留少量候选词。
- 很多词的概率接近时，Top-p 会保留更多候选词。
- Top-k 不管分布如何，都保留 K 个（前提是候选词足够多）。

所以 **Top-p 能根据概率分布动态调整候选集合的大小**，而 Top-k 的候选数量是固定的。

### 5.4 对比表

| 比较 | Top-k | Top-p |
| --- | --- | --- |
| 筛选依据 | 候选词数量 | 累计概率 |
| 参数示例 | `top_k = 3` | `top_p = 0.8` |
| 候选数量 | 固定为 K 个（候选充足时） | 随概率分布变化 |
| 概率分布集中时 | 仍保留 K 个，可能混入低概率词 | 可能只保留很少几个 |
| 概率分布平坦时 | 仍保留 K 个，可能砍掉合理选项 | 可能保留更多 |

### 5.5 和 Temperature 的关系

- **Temperature**：调整概率分布。
- **Top-k**：按排名保留前 K 个候选 Token。
- **Top-p**：按累计概率保留候选 Token。

常见流程是：先用 Temperature 调整分布 → 再用 Top-k 或 Top-p 筛选 → 归一化后采样。实际实现的执行顺序可能不同。

**Key takeaway:** Top-k keeps a fixed number of candidates; Top-p adapts the number of candidates to the shape of the distribution.

## 6. 三者的区别 Comparison

| 概念 | 主要作用 | 中文类比 |
| --- | --- | --- |
| Temperature | 调整概率分布的形状 | 调节选择时的保守程度 |
| Top-p | 按累计概率筛选候选 Token | 限制可以选择的菜单范围 |
| Top-k | 按数量保留前 K 个候选 | 菜单只留前 K 名 |
| Greedy Decoding | 选择最高概率的 Token | 每次都选最有把握的答案 |

### 一般规律

- Temperature 越低，采样结果通常越集中、越可预测。
- Temperature 越高，采样结果通常越多样。
- Top-p 越低，候选范围通常越小。
- 贪心解码始终选择当前概率最高的 Token。

Temperature 和 Top-p 通常一起用于采样。贪心解码则是一种不同的 Token 选择策略，通常不需要这两个参数。具体系统对参数的执行顺序和组合方式可能有所不同。

> [!warning] 实践注意：Claude API
> 最新 Claude 模型（Opus 5.5 等）**不再接受** `temperature` / `top_p` / `top_k`，发送会返回 **400 错误**（Sonnet 5.5 只接受默认值）。实际开发中用 **prompt** 和 **`effort` 参数**（`output_config.effort`）引导输出。
> 面试仍会问这些概念：要能讲清 Temperature 和 Top-p 各自作用在哪一步，以及为什么 Temperature = 0 仍不完全可重复。详见 [[LLM 基础 - Lesson 1]]。

## 7. 为什么 Temperature = 0 仍不能保证完全可重复？

这是面试中最值得深入理解的部分。

### 7.1 第一步：Temperature = 0 通常意味着贪心解码

在常见推理系统中，Temperature 为零通常意味着：

- 不进行普通的随机采样。
- 每一步选择当前分数最高的 Token。
- 在计算结果完全一致且不存在并列最高分等情况时，相同上下文通常会选择相同 Token。

但这并不意味着整个计算系统绝对确定。

### 7.2 第二步：GPU 浮点计算可能产生微小差异

GPU 会并行执行大量计算。由于浮点数精度有限，不同的运算顺序可能导致非常微小的数值差异。

假设两个候选 Token 的分数非常接近：

| 运行 | Token A 分数 | Token B 分数 | 选择 |
| --- | --- | --- | --- |
| 第一次 | 9.001 | 9.000 | A |
| 第二次 | 8.999 | 9.000 | B |

这些数字仅用于说明原理，并不代表真实 GPU 误差的典型大小。即使没有随机采样，只要计算结果发生变化，最高分的 Token 就可能变化。

> [!note] 为什么会有这种差异？
> - 浮点数精度有限。
> - 并行计算的执行顺序（如并行归约顺序）可能不同。
> - 某些 GPU 运算或计算内核具有非确定性，除非使用确定性实现。

### 7.3 第三步：Batching（批处理）也可能影响计算结果

推理服务通常会将多个用户请求合并成一个 Batch，以提高 GPU 利用率。

以下因素都可能影响数值结果：

- Batch composition（批处理组合）
- Tensor shapes（张量形状）
- Execution kernels（计算内核）
- Numerical precision（数值精度）
- Parallel reduction order（并行归约顺序）

因此，即使 Prompt 完全相同，不同的推理环境也不一定产生完全相同的结果。

### 7.4 第四步：一个 Token 的差异可能改变整段回答

LLM 是逐 Token（自回归）生成文本的。

> 第一次：我今天想喝奶茶，因为天气很热。
> 第二次：我今天想喝咖啡，因为今晚还要工作。

一旦某个关键 Token 不同，后续上下文就会发生变化，差异可能逐渐扩大：

1. GPU 计算产生微小数值差异。
2. 最高分的 Token 发生变化。
3. 后续生成的上下文发生变化。
4. 后续 Token 的预测也随之变化。
5. 最终回答可能明显不同。

> [!important] 核心结论
> Temperature = 0 通常消除了普通采样带来的随机性，但不一定消除 GPU 浮点计算、并行执行和批处理造成的所有非确定性。

### 7.5 如何提高可重复性？

可以尽量固定以下条件：

- 模型权重和模型版本。
- GPU 硬件和数值精度。
- 推理框架与计算内核。
- Batch 组成和执行配置。
- Temperature、Top-p 等解码配置。
- 随机种子（当使用随机采样时）。

使用确定性计算内核并固定环境通常有帮助，但仍不能保证跨硬件、跨软件版本的结果完全一致。

## 8. Interview Answer（英文面试答案）

### Short version

Temperature controls how sharp or flat the token probability distribution is. Top-p filters candidate tokens based on their cumulative probability. Greedy decoding is different: it always selects the highest-probability token at each step instead of sampling randomly.

Temperature zero typically corresponds to greedy decoding. However, it does not guarantee perfect reproducibility because GPU floating-point computations, parallel execution, and batching can introduce small numerical differences. If two tokens have very similar scores, the selected token may change, and autoregressive generation can amplify that difference.

### 中文理解

Temperature 控制 Token 概率分布是更集中还是更平坦。Top-p 根据累计概率筛选候选 Token。贪心解码则始终选择当前概率最高的 Token，而不是随机采样。

Temperature 为零通常对应贪心解码，但并不能保证完全可重复，因为 GPU 浮点计算、并行执行和批处理可能产生微小的数值差异。如果两个 Token 的分数非常接近，最终选择就可能变化，而逐 Token 生成机制会进一步放大这种差异。

### Follow-up: Top-k vs Top-p

Top-k and Top-p are both sampling strategies that restrict the candidate tokens. Top-k keeps a fixed number of the highest-probability tokens, whereas Top-p keeps the smallest set of tokens whose cumulative probability reaches a specified threshold. Therefore, Top-k uses a fixed candidate count, while Top-p adapts the candidate set size to the probability distribution.

**中文理解：** Top-k 和 Top-p 都是限制候选 Token 的采样策略。Top-k 保留固定数量的最高概率 Token，而 Top-p 保留累计概率达到指定阈值所需的最小候选集合。因此，Top-k 的候选数量固定，而 Top-p 会根据概率分布动态调整候选数量。

### Keywords

- Probability distribution（概率分布）
- Logits and Softmax（原始分数与 Softmax）
- Nucleus sampling（核采样）
- Greedy decoding（贪心解码）
- Floating-point precision（浮点精度）
- GPU non-determinism（GPU 非确定性）
- Batching（批处理）
- Autoregressive generation（自回归生成）

## 9. Quick Revision（快速复习）

- **Temperature**：调整概率分布的形状（T < 1 更尖锐，T > 1 更平坦）。
- **Top-p**：根据累计概率筛选候选 Token；Temperature 变化会影响它保留哪些词。
- **Top-k**：只保留概率最高的 K 个候选；数量固定，不随分布变化。
- **Top-k vs Top-p**：Top-k 看数量，Top-p 看累计概率；Top-p 会根据分布自动调整候选数量。
- **Greedy decoding**：每一步都选择最高概率的 Token；确定但容易重复，局部最优不保证全局最优。
- **Claude API**：新模型不接受采样参数（400），改用 prompt + `effort`。
- **Temperature = 0**：通常采用贪心解码，而不是直接执行除以零。
- **GPU non-determinism**：浮点精度和并行计算可能导致微小差异。
- **Batching**：批处理方式和执行内核可能影响数值结果。
- **Autoregressive generation**：前面 Token 的差异可能影响后续整段回答。

> [!quote] 一句话总结
> Temperature controls the shape of the probability distribution, Top-p controls the candidate set, greedy decoding selects the highest-probability token, and temperature zero does not guarantee perfect reproducibility because GPU computation can still be non-deterministic.
>
> Temperature 控制概率分布，Top-p 控制候选范围，贪心解码选择最高概率的 Token，而 Temperature 为零并不能保证完全可重复，因为 GPU 计算仍可能存在非确定性。

## Related Notes

- [[LLM 基础 - Lesson 1]]
