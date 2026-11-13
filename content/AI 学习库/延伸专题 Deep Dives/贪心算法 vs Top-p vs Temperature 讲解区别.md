---
title: "大模型解码：温度、Top-p 与贪心解码 LLM Decoding — Temperature, Top-p, and Greedy Decoding"
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

LLM 每一步都根据上下文预测下一个 Token 的概率分布，选一个，再重复。本笔记统一用这个例子：
At every step an LLM predicts a probability distribution for the next token, picks one, and repeats. This note uses one example throughout:

> 我今天想喝……
> "Today I'd like to drink…"

| 候选词 Candidate | 概率 Probability |
| --- | --- |
| 奶茶 Milk tea | 70% |
| 咖啡 Coffee | 20% |
| 果汁 Juice | 10% |

> [!abstract] 一句话区分 One-line difference
> - **Temperature：** 调整概率分布的形状。
>   Reshapes the distribution.
> - **Top-p：** 按累计概率筛选候选集合。
>   Filters the candidate set by cumulative probability.
> - **Greedy decoding：** 不抽样，直接选概率最高的 Token。
>   No sampling; picks the most likely token.

| 方式 Method | 做法 How | 结果 Result |
| --- | --- | --- |
| 贪心解码 Greedy decoding | 直接选概率最高的词 Pick the most likely token | 永远是奶茶 Always milk tea |
| 温度采样 Temperature sampling | 先调整概率，再随机抽 Reshape the probabilities, then draw randomly | 大概率奶茶，也可能是咖啡或果汁 Most likely milk tea, possibly coffee or juice |
| Top-p = 0.9 | 保留奶茶 + 咖啡（累计 90%），归一化后再抽 Keep milk tea + coffee (90% cumulative), renormalize, then draw | 奶茶或咖啡 Milk tea or coffee |

## 2. 温度 Temperature

Temperature 是一个控制模型有多愿意尝试其他答案的旋钮：
Temperature is a knob for how willing the model is to try other answers:

- **T < 1：** 分布更尖锐，更偏向高概率词。
  Sharper distribution; favors likely tokens.
- **T = 1：** 保持原始分布。
  The original distribution.
- **T > 1：** 分布更平坦，低概率词更容易被选中。
  Flatter distribution; unlikely tokens get picked more often.
- **T = 0：** 常见推理系统会切换到贪心解码，而不是真的除以零。
  Common inference systems switch to greedy decoding rather than actually dividing by zero.

**数学 The math:** 先把 logits 除以 $T$，再做 Softmax；等价于把原始概率取 $1/T$ 次方再归一化（$T > 0$）。
Divide the logits by $T$ before softmax; equivalently, raise the original probabilities to the power $1/T$ and renormalize ($T > 0$).

$$
P_i(T) = \frac{e^{z_i/T}}{\sum_j e^{z_j/T}} = \frac{P_i^{1/T}}{\sum_j P_j^{1/T}}
$$

| 候选词 Candidate | T = 0.5（低温 low） | T = 1（原样 unchanged） | T = 2（高温 high） |
| --- | --- | --- | --- |
| 奶茶 Milk tea | ≈ 90.74% | 70% | ≈ 52.29% |
| 咖啡 Coffee | ≈ 7.41% | 20% | ≈ 27.95% |
| 果汁 Juice | ≈ 1.85% | 10% | ≈ 19.76% |

假设只有这三个候选词；T = 0.5 那一列就是 $0.7^2 : 0.2^2 : 0.1^2$ 归一化的结果。
This assumes only these three candidates; the T = 0.5 column is $0.7^2 : 0.2^2 : 0.1^2$ renormalized.

注意**低温 ≠ 贪心解码**：T = 0.5 时通常仍在采样，咖啡仍可能被选中；贪心解码则一定选奶茶。
Note that **low temperature ≠ greedy decoding**: at T = 0.5 the model is usually still sampling, so coffee can still be picked; greedy decoding always picks milk tea.

| 设置 Setting | 特点 Traits | 适用场景 Good for |
| --- | --- | --- |
| 低（如 0.2） Low (e.g. 0.2) | 集中、稳定 Focused, stable | 分类、信息抽取、写代码 Classification, extraction, code |
| 高（如 1.0） High (e.g. 1.0) | 多样、有创意 Varied, creative | 头脑风暴、创意写作 Brainstorming, creative writing |

**要点 Key takeaway:** Temperature 改变的是概率分布的形状，不直接改变候选集合。
Temperature changes the shape of the distribution, not the candidate set directly.

## 3. 核采样 Top-p (Nucleus Sampling)

把候选 Token 按概率从高到低排列，累加概率，保留累计概率**首次达到或超过**阈值的最小集合，通常归一化后再采样。
Sort the candidates from most to least likely, add up their probabilities, keep the smallest set whose cumulative probability **first reaches or passes** the threshold, and usually renormalize before sampling.

`top_p = 0.9` 时：
With `top_p = 0.9`:

| 候选词 Candidate | 概率 Probability | 累计概率 Cumulative | 保留 Kept? | 归一化后 Renormalized |
| --- | --- | --- | --- | --- |
| 奶茶 Milk tea | 70% | 70% | 是 Yes | 77.78% |
| 咖啡 Coffee | 20% | 90% | 是 Yes | 22.22% |
| 果汁 Juice | 10% | 100% | 否 No | — |

> [!important] 关键区别 Key difference
> Top-p 控制**哪些 Token 可以参与采样**，而不是分布有多尖锐。
> Top-p controls **which tokens may be sampled**, not how sharp the distribution is.

**和 Temperature 的关系 Interaction with temperature:** 常见流程是先用 Temperature 调整分布，再用 Top-p 筛选，所以**改变 Temperature 也会改变 Top-p 保留的候选集合**（具体系统的执行顺序可能不同）：
A common pipeline reshapes with temperature first and then filters with top-p, so **changing the temperature also changes which candidates top-p keeps** (the order can differ between systems):

| 温度 Temperature | 调整后分布 Reshaped distribution | Top-p = 0.9 保留 Kept |
| --- | --- | --- |
| T = 0.5 | 奶茶 90.74% 已超过 90% Milk tea 90.74% already passes 90% | 只剩奶茶 Milk tea only |
| T = 1 | 奶茶 70% + 咖啡 20% = 90% Milk tea 70% + coffee 20% = 90% | 奶茶、咖啡 Milk tea, coffee |
| T = 2 | 奶茶 52.29% + 咖啡 27.95% = 80.24% < 90% 未达到 Milk tea 52.29% + coffee 27.95% = 80.24% < 90% | 奶茶、咖啡、果汁 Milk tea, coffee, juice |

## 4. 贪心解码 Greedy Decoding

每一步都选当前概率最高的 Token，不随机抽样：
At every step, pick the most likely token, with no random sampling:

$$
x_t = \arg\max_x P(x \mid x_{<t})
$$

- **局部最优 ≠ 全局最优 Locally best ≠ globally best:** 只保证每一步选当前最高概率的 Token，不保证整句话的总概率最高。
  It only guarantees the most likely token at each step, not the most likely sentence overall.
- **容易重复、死板 Repetitive and stiff:** 确定性强，但每次都走同一条最可能的路径。
  Deterministic, but it always takes the same most-likely path.

## 5. Top-k vs Top-p

- **Top-k：** 按**数量**筛选，固定保留概率最高的 K 个候选。
  Filters by **count**: always keeps the K most likely candidates.
- **Top-p：** 按**累计概率**筛选，候选数量随分布变化。
  Filters by **cumulative probability**: the count varies with the distribution.

区别在分布变化时才看得出来。五个候选词，设 `top_k = 3`、`top_p = 0.8`：
The difference shows when the distribution changes. Five candidates, with `top_k = 3` and `top_p = 0.8`:

| 分布 Distribution | 概率 Probabilities | Top-k = 3 保留 Kept | Top-p = 0.8 保留 Kept |
| --- | --- | --- | --- |
| 集中（模型很确定） Peaked (model is sure) | 90% / 4% / 3% / 2% / 1% | 保留 3 个，混入低概率词 Keeps 3, including unlikely tokens | **只保留 1 个**（90% 已超过 80%） **Keeps only 1** (90% already passes 80%) |
| 平坦（模型不确定） Flat (model is unsure) | 五个词各 20% Five tokens at 20% each | 保留 3 个，砍掉合理选项 Keeps 3, cutting reasonable options | **保留 4 个**（前 4 个累计 80%） **Keeps 4** (the first 4 add up to 80%) |

**要点 Key takeaway:** Top-k 的候选数量固定；Top-p 能根据分布动态调整候选集合的大小。
Top-k keeps a fixed number of candidates; top-p adapts the size of the candidate set to the distribution.

## 6. 四者的区别 Comparison

| 概念 Concept | 主要作用 What it does | 类比 Analogy |
| --- | --- | --- |
| Temperature | 调整概率分布的形状 Reshapes the distribution | 调节选择时的保守程度 How cautious the choice is |
| Top-p | 按累计概率筛选候选 Token Filters by cumulative probability | 限制可以点的菜单范围 Limits how much of the menu you can order from |
| Top-k | 按数量保留前 K 个候选 Keeps the top K | 菜单只留前 K 名 Only the top K items stay on the menu |
| Greedy decoding | 选择最高概率的 Token Picks the most likely token | 每次都选最有把握的答案 Always the most confident answer |

常见流程：Temperature 调整分布 → Top-k 或 Top-p 筛选 → 归一化后采样。贪心解码是另一种选择策略，通常不需要这些参数。具体系统的执行顺序和组合方式可能不同。
A common pipeline: reshape with temperature → filter with top-k or top-p → renormalize and sample. Greedy decoding is a different selection strategy that usually needs none of these parameters. Systems differ in how they order and combine them.

> [!warning] 实践中的 Claude API 注意事项 In practice: the Claude API
> 最新 Claude 模型**不再接受** `temperature` / `top_p` / `top_k`（返回 400），改用 prompt 和 `output_config.effort` 引导输出；面试仍会问这些概念。详见 [[LLM 基础 - Lesson 1|第 1 课 Lesson 1]]。
> The latest Claude models **no longer accept** `temperature` / `top_p` / `top_k` (400 error); steer with the prompt and `output_config.effort` instead. Interviews still ask about these concepts. See [[LLM 基础 - Lesson 1|第 1 课 Lesson 1]].

## 7. 为什么 Temperature = 0 仍不能保证完全可重复？ Why Temperature = 0 Still Isn't Fully Reproducible

1. **温度为 0 通常即贪心 T = 0 usually means greedy decoding:** 不再随机采样，每一步选分数最高的 Token。只要分数完全一致且没有并列，相同上下文就会选相同 Token。但整个计算系统并不绝对确定。
   No more random sampling; each step picks the highest-scoring token. As long as the scores are identical and there's no tie, the same context yields the same token. But the computation itself isn't fully deterministic.
2. **浮点计算有微小差异 GPU floating-point math can differ slightly:** 浮点精度有限，并行计算的执行顺序（如并行归约顺序）可能不同，某些计算内核本身非确定性。两个候选分数很接近时（例如 9.001 vs 9.000），最高分的 Token 就可能变化。
   Floating-point precision is limited, the order of parallel work (e.g. reduction order) can differ, and some kernels are non-deterministic. When two candidates score very close (e.g. 9.001 vs 9.000), the top token can change.
3. **批处理也会影响结果 Batching changes the numbers too:** 推理服务会把多个请求合并成一个 Batch。Batch 组合、张量形状、计算内核和数值精度都可能影响数值结果。
   Inference services merge many requests into one batch. Batch composition, tensor shapes, kernels and numerical precision can all affect the numbers.
4. **一个 Token 的差异会放大 One different token gets amplified:** 生成是自回归的，关键 Token 一变，后续上下文就变，整段回答可能明显不同。
   Generation is autoregressive: once a key token differs, the rest of the context changes and the whole answer can differ noticeably.

> [!important] 核心结论 Bottom line
> Temperature = 0 通常消除了采样的随机性，但不一定消除 GPU 浮点计算、并行执行和批处理造成的非确定性。
> Temperature = 0 usually removes the randomness of sampling, but not necessarily the non-determinism from GPU floating-point math, parallel execution and batching.

**提高可重复性 Improving reproducibility:** 固定模型版本、GPU 硬件与数值精度、推理框架与计算内核、Batch 配置、解码参数和随机种子。确定性内核通常有帮助，但仍不能保证跨硬件、跨软件版本的结果完全一致。
Pin the model version, GPU hardware and numerical precision, inference framework and kernels, batch settings, decoding parameters and random seed. Deterministic kernels usually help, but still can't guarantee identical results across hardware or software versions.

## 8. 面试答案 Interview Answer

Temperature 控制 Token 概率分布是更集中还是更平坦。Top-p 根据累计概率筛选候选 Token（Top-k 则固定保留前 K 个）。贪心解码始终选择当前概率最高的 Token，而不是随机采样。

Temperature 为零通常对应贪心解码，但并不能保证完全可重复，因为 GPU 浮点计算、并行执行和批处理可能产生微小的数值差异。如果两个 Token 的分数非常接近，最终选择就可能变化，而逐 Token 生成会进一步放大这种差异。

Temperature controls how sharp or flat the token probability distribution is. Top-p filters candidate tokens by cumulative probability (top-k keeps a fixed top K instead). Greedy decoding always selects the highest-probability token at each step instead of sampling randomly.

Temperature zero typically corresponds to greedy decoding, but it does not guarantee perfect reproducibility because GPU floating-point computations, parallel execution and batching can introduce small numerical differences. If two tokens have very similar scores, the selected token may change, and autoregressive generation can amplify that difference.

## 9. 🔗 相关笔记 Related Notes

- [[LLM 基础 - Lesson 1|第 1 课：LLM 基础 Lesson 1: LLM Basics]]
- [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]
