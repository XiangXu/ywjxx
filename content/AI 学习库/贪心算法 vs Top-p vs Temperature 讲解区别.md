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
When a large language model (LLM) generates text, it predicts the next token from the current context, then repeats this until the answer is complete.

例如，你问 AI：
For example, you ask an AI:

> 我今天想喝……
> "Today I'd like to drink…"

模型预测下一个 Token 的概率可能如下（本笔记统一使用这个例子）：
The model's probabilities for the next token might be (this note uses this example throughout):

| 候选词 Candidate | 概率 Probability |
| --- | --- |
| 奶茶 Milk tea | 70% |
| 咖啡 Coffee | 20% |
| 果汁 Juice | 10% |

这里需要理解三个重要概念：
Three key concepts:

- **温度 Temperature:** 调整概率分布，让模型更偏向高概率词，或者更愿意尝试其他词。
  Reshapes the probability distribution, making the model favor high-probability tokens or be more willing to try others.
- **核采样 Top-p:** 根据累计概率筛选候选 Token。
  Filters candidate tokens by cumulative probability.
- **贪心解码 Greedy decoding:** 每一步都选择当前概率最高的 Token，不进行随机抽样。
  Picks the highest-probability token at every step, with no random sampling.

> [!abstract] 一句话区分 One-line difference
> - Temperature：调整概率分布。
>   Reshapes the distribution.
> - Top-p：筛选候选范围。
>   Filters the candidate set.
> - Greedy Decoding：选择最高概率的 Token。
>   Picks the most likely token.

### 同一个例子，三种结果 One example, three outcomes

| 方式 Method | 做法 How | 结果 Result |
| --- | --- | --- |
| 贪心解码 Greedy decoding | 直接选概率最高的词 Pick the most likely token | 永远是奶茶 Always milk tea |
| 随机采样 + Temperature 温度采样 Random sampling + temperature | 先调整概率，再按调整后的概率随机抽 Reshape the probabilities, then draw randomly | 大概率奶茶，也可能是咖啡或果汁 Most likely milk tea, possibly coffee or juice |
| Top-p = 0.9 | 保留奶茶 + 咖啡（累计 90%），排除果汁，归一化后再抽 Keep milk tea + coffee (90% cumulative), drop juice, renormalize, then draw | 奶茶或咖啡 Milk tea or coffee |

## 2. 温度 Temperature

### 2.1 通俗解释 In plain words

把 Temperature 想象成一个控制 AI 有多愿意尝试不同答案的旋钮。
Think of temperature as a knob for how willing the AI is to try different answers.

- **低温 Low temperature (T < 1):** 概率分布更集中，模型更偏向高概率选项。
  The distribution gets more concentrated; the model favors likely options.
- **T = 1:** 保持原始概率分布不变。
  The original distribution is unchanged.
- **高温 High temperature (T > 1):** 概率分布更平坦，低概率选项相对更容易被选中。
  The distribution gets flatter; unlikely options get picked relatively more often.
- **T = 0:** 常见推理系统会切换到贪心解码，而不是直接执行除以零的运算。
  Common inference systems switch to greedy decoding rather than actually dividing by zero.

### 2.2 数学原理 The math

常见的做法是先将 logits 除以温度，再经过 Softmax：
The usual approach divides the logits by the temperature, then applies softmax:

$$
P_i(T) = \frac{e^{z_i/T}}{\sum_j e^{z_j/T}}
$$

其中：
Where:

- $z_i$：Token $i$ 的 logit，即模型输出的原始分数。
  The logit of token $i$, the raw score the model outputs.
- $T$：温度。
  The temperature.
- $P_i(T)$：经过调整后的概率。
  The adjusted probability.

也可以直接用原始概率 $P_i$ 计算（两者等价）：
You can also compute it directly from the original probabilities $P_i$ (the two are equivalent):

$$
P_i(T) = \frac{P_i^{1/T}}{\sum_j P_j^{1/T}}
$$

这个公式适用于 $T > 0$。Temperature 为零时，实际系统通常采用专门的解码逻辑。
This formula holds for $T > 0$. At temperature zero, real systems usually use dedicated decoding logic.

### 2.3 数值例子：Temperature 如何改变概率？ Worked example: how temperature changes probabilities

用同一组原始概率（奶茶 70%、咖啡 20%、果汁 10%）计算：
Using the same original probabilities (milk tea 70%, coffee 20%, juice 10%):

| 候选词 Candidate | T = 0.5（低温 low） | T = 1（原样 unchanged） | T = 2（高温 high） |
| --- | --- | --- | --- |
| 奶茶 Milk tea | ≈ 90.74% | 70% | ≈ 52.29% |
| 咖啡 Coffee | ≈ 7.41% | 20% | ≈ 27.95% |
| 果汁 Juice | ≈ 1.85% | 10% | ≈ 19.76% |

- **T = 0.5:** 奶茶的优势被放大，但如果仍在随机采样，咖啡和果汁并非完全不可能被选中。
  Milk tea's lead grows, but if we're still sampling, coffee and juice aren't impossible.
- **T = 1:** 概率不变。
  The probabilities don't change.
- **T = 2:** 奶茶仍然最可能被选中，但咖啡和果汁的相对机会明显增加，输出更多样。
  Milk tea is still most likely, but coffee and juice gain noticeably, so the output is more varied.

> [!note] 计算说明 How these were computed
> 以上数值用 $P_i^{1/T}$ 归一化得到，假设原始概率是 Softmax 输出，且只有这三个候选词。例如 T = 0.5 时：$0.7^2 : 0.2^2 : 0.1^2 = 0.49 : 0.04 : 0.01$，归一化后得到 90.74% / 7.41% / 1.85%。
> These come from normalizing $P_i^{1/T}$, assuming the original probabilities are softmax outputs and there are only these three candidates. For example at T = 0.5: $0.7^2 : 0.2^2 : 0.1^2 = 0.49 : 0.04 : 0.01$, which normalizes to 90.74% / 7.41% / 1.85%.

### 2.4 低温 ≠ 贪心解码 Low temperature ≠ greedy decoding

- `temperature = 0.5`：通常仍然在采样，奶茶最可能被选中，但仍可能选到咖啡。
  Usually still sampling: milk tea is most likely, but coffee can still be picked.
- `temperature = 2`：在更平坦的分布上采样，多样性更高。
  Sampling from a flatter distribution, so more variety.
- **贪心解码 Greedy decoding:** 不抽样，只要奶茶的分数最高，就一定选奶茶。
  No sampling: as long as milk tea scores highest, it's always milk tea.

### 2.5 怎么选 Temperature？ Choosing a temperature

| 设置 Setting | 特点 Traits | 适用场景 Good for |
| --- | --- | --- |
| 低（如 0.2） Low (e.g. 0.2) | 集中、稳定 Focused, stable | 分类、信息抽取、写代码 Classification, extraction, code |
| 高（如 1.0） High (e.g. 1.0) | 多样、有创意 Varied, creative | 头脑风暴、创意写作 Brainstorming, creative writing |

> [!tip] 记忆方法 How to remember it
> Temperature 就像调整一个人的冒险程度：温度低时更保守，温度高时更愿意尝试不同选择。
> Temperature is like a person's appetite for risk: cautious when low, more adventurous when high.
> T = 1 保持原分布；T < 1 让分布更尖锐；T > 1 让分布更平坦；T = 0 通常对应贪心解码。
> T = 1 keeps the distribution; T < 1 sharpens it; T > 1 flattens it; T = 0 usually means greedy decoding.

**要点 Key takeaway:** Temperature 改变的是概率分布的形状，而不是直接改变候选集合。
Temperature changes the shape of the probability distribution, not the candidate set directly.

## 3. 核采样 Top-p (Nucleus Sampling)

### 3.1 通俗解释 In plain words

把 Top-p 想象成去奶茶店点饮料。
Think of top-p as ordering at a bubble tea shop.

你规定：
Your rule:

> 只考虑最受欢迎的饮料，直到这些饮料的累计受欢迎程度达到 90%。
> Only consider the most popular drinks, until their combined popularity reaches 90%.

模型先按概率从高到低排列候选 Token，再累加概率，保留累计概率首次达到或超过指定阈值所需的最小候选集合，通常再归一化后采样。
The model sorts the candidate tokens from most to least likely, adds up their probabilities, keeps the smallest set whose cumulative probability first reaches or passes the threshold, and usually renormalizes before sampling.

### 3.2 例子：Top-p 取 0.9 时 Example: top-p = 0.9

| 候选词 Candidate | 概率 Probability | 累计概率 Cumulative |
| --- | --- | --- |
| 奶茶 Milk tea | 70% | 70% |
| 咖啡 Coffee | 20% | 90% |
| 果汁 Juice | 10% | 100% |

当 `top_p = 0.9` 时：
With `top_p = 0.9`:

1. 保留奶茶，累计概率为 70%。
   Keep milk tea; cumulative probability is 70%.
2. 加入咖啡，累计概率达到 90%。
   Add coffee; cumulative probability reaches 90%.
3. 果汁被排除，不参与后续采样。
   Juice is dropped and takes no part in sampling.

保留的概率通常会重新归一化：
The kept probabilities are usually renormalized:

| 候选词 Candidate | 原始概率 Original | 归一化后概率 Renormalized |
| --- | --- | --- |
| 奶茶 Milk tea | 70% | 77.78% |
| 咖啡 Coffee | 20% | 22.22% |

最终，模型从奶茶和咖啡中进行采样。
In the end, the model samples from milk tea and coffee.

> [!important] 关键区别 Key difference
> Top-p 控制哪些 Token 可以参与采样，而不是直接控制概率分布有多尖锐。
> Top-p controls which tokens may be sampled, not how sharp the distribution is.

### 3.3 Temperature 与 Top-p 的关系 How temperature and top-p interact

Temperature 改变概率分布，Top-p 再根据（调整后的）分布筛选候选词。所以**改变 Temperature 也会改变 Top-p 保留下来的候选集合**。
Temperature reshapes the distribution, and top-p then filters candidates from the (reshaped) distribution. So **changing the temperature also changes which candidates top-p keeps**.

用 2.3 的数值 + `top_p = 0.9` 举例（假设先应用温度）：
Using the numbers from 2.3 with `top_p = 0.9` (assuming temperature is applied first):

| 温度 Temperature | 调整后分布 Reshaped distribution | Top-p = 0.9 保留 Kept |
| --- | --- | --- |
| T = 0.5 | 奶茶 90.74% 已超过 90% Milk tea 90.74% already passes 90% | 只剩奶茶 Milk tea only |
| T = 1 | 奶茶 70% + 咖啡 20% = 90% Milk tea 70% + coffee 20% = 90% | 奶茶、咖啡 Milk tea, coffee |
| T = 2 | 奶茶 52.29% + 咖啡 27.95% = 80.24% < 90% 未达到 Milk tea 52.29% + coffee 27.95% = 80.24% < 90% | 奶茶、咖啡、果汁 Milk tea, coffee, juice |

具体系统中两者的执行顺序可能有所不同。
The order of the two can differ between systems.

**要点 Key takeaway:** Top-p 根据累计概率筛选候选集合。
Top-p filters the candidate set based on cumulative probability.

## 4. 贪心解码 Greedy Decoding

### 4.1 通俗解释 In plain words

贪心解码的规则非常简单：
The rule for greedy decoding is very simple:

> 每一步都选择当前概率最高的 Token。
> At every step, pick the token with the highest probability.

| 候选词 Candidate | 概率 Probability | 是否选择 Picked? |
| --- | --- | --- |
| 奶茶 Milk tea | 70% | 是 Yes |
| 咖啡 Coffee | 20% | 否 No |
| 果汁 Juice | 10% | 否 No |

贪心解码直接选择“奶茶”，而不是随机抽取一个候选词。
Greedy decoding picks "milk tea" directly instead of drawing a candidate at random.

### 4.2 数学定义 Definition

$$
x_t = \arg\max_x P(x \mid x_{<t})
$$

其中：
Where:

- $x_t$：当前生成的 Token。
  The token generated now.
- $x_{<t}$：之前已经生成的 Token。
  The tokens generated so far.
- $P(x \mid x_{<t})$：给定当前上下文时，下一个 Token 的概率。
  The probability of the next token given the current context.

### 4.3 生活化例子 An everyday example

> 中国的首都是哪里？
> "What is the capital of China?"

| 候选词 Candidate | 概率 Probability |
| --- | --- |
| 北京 Beijing | 95% |
| 上海 Shanghai | 3% |
| 广州 Guangzhou | 2% |

贪心解码会选择“北京”，因为它的概率最高。在普通采样中，模型则可能根据概率分布抽取 Token，而不是永远选择最高概率的选项。
Greedy decoding picks "Beijing" because it's the most likely. With ordinary sampling, the model draws from the distribution instead of always taking the top option.

### 4.4 重要局限：局部最优 ≠ 全局最优 Key limit: locally best ≠ globally best

贪心解码是一种**局部决策策略**：它只保证每一步选当前概率最高的 Token，并不保证整句话的总概率最高（全局最优）。
Greedy decoding is a **local decision strategy**: it only guarantees the most likely token at each step, not the most likely sentence overall (the global optimum).

另一个实际问题：贪心解码虽然确定，但输出**容易重复、死板**，因为每次都走同一条最可能的路径。
Another practical problem: although deterministic, greedy output **tends to be repetitive and stiff**, because it always takes the same most-likely path.

> [!tip] 记忆方法 How to remember it
> 贪心解码就像考试时每题都选自己最有把握的选项，不随机抽答案；也像每一步都走眼前最好的路，但不会探索其他路径。
> Greedy decoding is like picking your most confident answer on every exam question instead of guessing at random, or always taking the best-looking road in front of you without exploring other routes.

**要点 Key takeaway:** 贪心解码是一种选择策略，每一步都选概率最高的 Token；Temperature 和 Top-p 是采样控制参数。
Greedy decoding is a selection strategy that always picks the highest-probability token at each step; temperature and top-p are sampling controls.

## 5. Top-k vs Top-p

### 5.1 通俗解释 In plain words

Top-k 和 Top-p 都是用来**筛选 AI 可以选择哪些 Token** 的方法，区别在于：
Top-k and top-p both **restrict which tokens the AI may choose**. The difference:

- **Top-k**：按**数量**筛选，固定保留概率最高的 K 个候选词。
  Filters by **count**: always keeps the K most likely candidates.
- **Top-p**：按**累计概率**筛选，保留累计概率达到指定阈值的最小候选集合。
  Filters by **cumulative probability**: keeps the smallest set whose cumulative probability reaches the threshold.

> [!tip] 记忆方法 How to remember it
> Top-k 看数量，Top-p 看累计概率。
> Top-k looks at the count; top-p looks at cumulative probability.
> - Top-k = Keep the top K tokens.
> - Top-p = Keep tokens until cumulative probability reaches p.

### 5.2 例子 Example

三个候选词很难看出两者的区别，所以这里把奶茶例子扩展成五个候选词：
With three candidates the difference is hard to see, so this extends the milk tea example to five:

> 我今天想喝……
> "Today I'd like to drink…"

| 候选词 Candidate | 概率 Probability |
| --- | --- |
| 奶茶 Milk tea | 40% |
| 咖啡 Coffee | 30% |
| 果汁 Juice | 15% |
| 牛奶 Milk | 10% |
| 可乐 Cola | 5% |

**Top-k：固定选几个 a fixed count (`top_k = 3`)**

保留概率最高的 3 个：奶茶、咖啡、果汁。牛奶和可乐被排除，因为只保留三个候选词。
Keep the 3 most likely: milk tea, coffee, juice. Milk and cola are dropped because only three are kept.

**Top-p：累计概率达到多少 a cumulative threshold (`top_p = 0.8`)**

| 候选词 Candidate | 概率 Probability | 累计概率 Cumulative | 是否保留 Kept? |
| --- | --- | --- | --- |
| 奶茶 Milk tea | 40% | 40% | 是 Yes |
| 咖啡 Coffee | 30% | 70% | 是 Yes |
| 果汁 Juice | 15% | 85% | 是 Yes |
| 牛奶 Milk | 10% | 95% | 否 No |
| 可乐 Cola | 5% | 100% | 否 No |

加入果汁后，累计概率从 70% 变成 85%，首次达到 80%，因此保留前三个候选词。
Adding juice takes the cumulative probability from 70% to 85%, the first time it reaches 80%, so the first three are kept.

> [!note] 注意 Note
> Top-p 保留的是累计概率**首次达到或超过**阈值的最小集合，不要求恰好等于 80%。
> Top-p keeps the smallest set whose cumulative probability **first reaches or passes** the threshold; it doesn't have to equal exactly 80%.

在这个例子里两种方法恰好都保留了三个词，归一化后都是：奶茶 ≈ 47.06%、咖啡 ≈ 35.29%、果汁 ≈ 17.65%（例如 40 ÷ 85）。区别要在概率分布变化时才看得出来。
Here both methods happen to keep three tokens, renormalized to milk tea ≈ 47.06%, coffee ≈ 35.29%, juice ≈ 17.65% (e.g. 40 ÷ 85). The difference shows only when the distribution changes.

### 5.3 哪个更灵活？ Which is more flexible?

同样设 `top_k = 3`、`top_p = 0.8`，换两种分布：
With the same `top_k = 3` and `top_p = 0.8`, try two distributions:

| 分布 Distribution | 概率 Probabilities | Top-k = 3 保留 Kept | Top-p = 0.8 保留 Kept |
| --- | --- | --- | --- |
| 集中（模型很确定） Peaked (model is sure) | 奶茶 90%、咖啡 4%、果汁 3%、牛奶 2%、可乐 1% Milk tea 90%, coffee 4%, juice 3%, milk 2%, cola 1% | 保留 3 个 Keeps 3 | **只保留 1 个**（奶茶 90% 已超过 80%） **Keeps only 1** (milk tea's 90% already passes 80%) |
| 平坦（模型不确定） Flat (model is unsure) | 五个词各 20% Five tokens at 20% each | 保留 3 个 Keeps 3 | **保留 4 个**（前 4 个累计 80%） **Keeps 4** (the first 4 add up to 80%) |

- 一个词的概率特别高时，Top-p 只保留少量候选词。
  When one token is very likely, top-p keeps only a few candidates.
- 很多词的概率接近时，Top-p 会保留更多候选词。
  When many tokens are about equally likely, top-p keeps more.
- Top-k 不管分布如何，都保留 K 个（前提是候选词足够多）。
  Top-k keeps K whatever the distribution (as long as there are enough candidates).

所以 **Top-p 能根据概率分布动态调整候选集合的大小**，而 Top-k 的候选数量是固定的。
So **top-p adapts the size of the candidate set to the distribution**, while top-k's count is fixed.

### 5.4 对比表 Comparison table

| 比较 Aspect | Top-k | Top-p |
| --- | --- | --- |
| 筛选依据 Filters by | 候选词数量 Candidate count | 累计概率 Cumulative probability |
| 参数示例 Example | `top_k = 3` | `top_p = 0.8` |
| 候选数量 Candidates kept | 固定为 K 个（候选充足时） Fixed at K (when there are enough) | 随概率分布变化 Varies with the distribution |
| 概率分布集中时 Peaked distribution | 仍保留 K 个，可能混入低概率词 Still K, may include unlikely tokens | 可能只保留很少几个 May keep only a few |
| 概率分布平坦时 Flat distribution | 仍保留 K 个，可能砍掉合理选项 Still K, may cut reasonable options | 可能保留更多 May keep more |

### 5.5 和 Temperature 的关系 How they relate to temperature

- **Temperature**：调整概率分布。
  Reshapes the distribution.
- **Top-k**：按排名保留前 K 个候选 Token。
  Keeps the top K candidates by rank.
- **Top-p**：按累计概率保留候选 Token。
  Keeps candidates by cumulative probability.

常见流程是：先用 Temperature 调整分布 → 再用 Top-k 或 Top-p 筛选 → 归一化后采样。实际实现的执行顺序可能不同。
A common pipeline: reshape with temperature → filter with top-k or top-p → renormalize and sample. Real implementations may order these differently.

**要点 Key takeaway:** Top-k 保留固定数量的候选；Top-p 让候选数量随分布形状变化。
Top-k keeps a fixed number of candidates; top-p adapts the number of candidates to the shape of the distribution.

## 6. 三者的区别 Comparison

| 概念 Concept | 主要作用 What it does | 类比 Analogy |
| --- | --- | --- |
| Temperature | 调整概率分布的形状 Reshapes the distribution | 调节选择时的保守程度 How cautious the choice is |
| Top-p | 按累计概率筛选候选 Token Filters by cumulative probability | 限制可以选择的菜单范围 Limits how much of the menu you can order from |
| Top-k | 按数量保留前 K 个候选 Keeps the top K | 菜单只留前 K 名 Only the top K items stay on the menu |
| Greedy Decoding | 选择最高概率的 Token Picks the most likely token | 每次都选最有把握的答案 Always the most confident answer |

### 一般规律 Rules of thumb

- Temperature 越低，采样结果通常越集中、越可预测。
  The lower the temperature, the more focused and predictable the samples usually are.
- Temperature 越高，采样结果通常越多样。
  The higher the temperature, the more varied the samples usually are.
- Top-p 越低，候选范围通常越小。
  The lower top-p is, the smaller the candidate set usually is.
- 贪心解码始终选择当前概率最高的 Token。
  Greedy decoding always picks the most likely token.

Temperature 和 Top-p 通常一起用于采样。贪心解码则是一种不同的 Token 选择策略，通常不需要这两个参数。具体系统对参数的执行顺序和组合方式可能有所不同。
Temperature and top-p are usually used together for sampling. Greedy decoding is a different selection strategy that usually needs neither. Systems differ in how they order and combine these parameters.

> [!warning] 实践中的 Claude API 注意事项 In practice: the Claude API
> 最新 Claude 模型（Opus 5.5 等）**不再接受** `temperature` / `top_p` / `top_k`，发送会返回 **400 错误**（Sonnet 5.5 只接受默认值）。实际开发中用 **prompt** 和 **`effort` 参数**（`output_config.effort`）引导输出。
> The latest Claude models (Opus 5.5 and others) **no longer accept** `temperature` / `top_p` / `top_k`; sending them returns a **400 error** (Sonnet 5.5 accepts only the defaults). In practice, steer the output with the **prompt** and the **`effort` parameter** (`output_config.effort`).
> 面试仍会问这些概念：要能讲清 Temperature 和 Top-p 各自作用在哪一步，以及为什么 Temperature = 0 仍不完全可重复。详见 [[LLM 基础 - Lesson 1|第 1 课 Lesson 1]]。
> Interviews still ask about them: be able to explain where temperature and top-p each act, and why temperature = 0 still isn't fully reproducible. See [[LLM 基础 - Lesson 1|第 1 课 Lesson 1]].

## 7. 为什么 Temperature = 0 仍不能保证完全可重复？ Why Temperature = 0 Still Isn't Fully Reproducible

这是面试中最值得深入理解的部分。
This is the part most worth understanding deeply for interviews.

### 7.1 第一步：Temperature = 0 通常意味着贪心解码 Step 1: temperature 0 usually means greedy decoding

在常见推理系统中，Temperature 为零通常意味着：
In common inference systems, temperature zero usually means:

- 不进行普通的随机采样。
  No ordinary random sampling.
- 每一步选择当前分数最高的 Token。
  At each step, pick the highest-scoring token.
- 在计算结果完全一致且不存在并列最高分等情况时，相同上下文通常会选择相同 Token。
  As long as the computation is exactly the same and there's no tie for the top score, the same context usually yields the same token.

但这并不意味着整个计算系统绝对确定。
But that doesn't make the whole computation fully deterministic.

### 7.2 第二步：GPU 浮点计算可能产生微小差异 Step 2: GPU floating-point math can differ slightly

GPU 会并行执行大量计算。由于浮点数精度有限，不同的运算顺序可能导致非常微小的数值差异。
GPUs run huge numbers of calculations in parallel. Because floating-point precision is limited, a different order of operations can cause tiny numerical differences.

假设两个候选 Token 的分数非常接近：
Suppose two candidate tokens have very close scores:

| 运行 Run | Token A 分数 score | Token B 分数 score | 选择 Picked |
| --- | --- | --- | --- |
| 第一次 First | 9.001 | 9.000 | A |
| 第二次 Second | 8.999 | 9.000 | B |

这些数字仅用于说明原理，并不代表真实 GPU 误差的典型大小。即使没有随机采样，只要计算结果发生变化，最高分的 Token 就可能变化。
These numbers only illustrate the idea; they aren't typical GPU error sizes. Even without random sampling, if the computed scores change, the top token can change.

> [!note] 为什么会有这种差异？ Where do the differences come from?
> - 浮点数精度有限。
>   Limited floating-point precision.
> - 并行计算的执行顺序（如并行归约顺序）可能不同。
>   The order of parallel work (e.g. reduction order) can differ.
> - 某些 GPU 运算或计算内核具有非确定性，除非使用确定性实现。
>   Some GPU operations or kernels are non-deterministic unless a deterministic implementation is used.

### 7.3 第三步：批处理也可能影响计算结果 Step 3: batching can change the results too

推理服务通常会将多个用户请求合并成一个 Batch，以提高 GPU 利用率。
Inference services usually combine many users' requests into one batch to keep the GPU busy.

以下因素都可能影响数值结果：
All of these can affect the numbers:

- 批处理组合 Batch composition
- 张量形状 Tensor shapes
- 计算内核 Execution kernels
- 数值精度 Numerical precision
- 并行归约顺序 Parallel reduction order

因此，即使 Prompt 完全相同，不同的推理环境也不一定产生完全相同的结果。
So even with an identical prompt, different inference environments won't necessarily produce identical results.

### 7.4 第四步：一个 Token 的差异可能改变整段回答 Step 4: one different token can change the whole answer

LLM 是逐 Token（自回归）生成文本的。
LLMs generate text one token at a time (autoregressively).

> 第一次：我今天想喝奶茶，因为天气很热。
> First run: "Today I'd like milk tea, because it's hot."
> 第二次：我今天想喝咖啡，因为今晚还要工作。
> Second run: "Today I'd like coffee, because I'm working tonight."

一旦某个关键 Token 不同，后续上下文就会发生变化，差异可能逐渐扩大：
Once a key token differs, the rest of the context changes and the difference can grow:

1. GPU 计算产生微小数值差异。
   GPU math produces a tiny numerical difference.
2. 最高分的 Token 发生变化。
   The top-scoring token changes.
3. 后续生成的上下文发生变化。
   The context for what follows changes.
4. 后续 Token 的预测也随之变化。
   The predictions for later tokens change with it.
5. 最终回答可能明显不同。
   The final answer can be noticeably different.

> [!important] 核心结论 Bottom line
> Temperature = 0 通常消除了普通采样带来的随机性，但不一定消除 GPU 浮点计算、并行执行和批处理造成的所有非确定性。
> Temperature = 0 usually removes the randomness of ordinary sampling, but not necessarily all the non-determinism from GPU floating-point math, parallel execution and batching.

### 7.5 如何提高可重复性？ How to improve reproducibility

可以尽量固定以下条件：
Pin down as much of this as you can:

- 模型权重和模型版本。
  Model weights and version.
- GPU 硬件和数值精度。
  GPU hardware and numerical precision.
- 推理框架与计算内核。
  Inference framework and kernels.
- Batch 组成和执行配置。
  Batch composition and execution settings.
- Temperature、Top-p 等解码配置。
  Decoding settings such as temperature and top-p.
- 随机种子（当使用随机采样时）。
  The random seed (when sampling randomly).

使用确定性计算内核并固定环境通常有帮助，但仍不能保证跨硬件、跨软件版本的结果完全一致。
Deterministic kernels and a pinned environment usually help, but still can't guarantee identical results across hardware or software versions.

## 8. 面试答案 Interview Answer

### 简短版 Short version

Temperature 控制 Token 概率分布是更集中还是更平坦。Top-p 根据累计概率筛选候选 Token。贪心解码则始终选择当前概率最高的 Token，而不是随机采样。

Temperature 为零通常对应贪心解码，但并不能保证完全可重复，因为 GPU 浮点计算、并行执行和批处理可能产生微小的数值差异。如果两个 Token 的分数非常接近，最终选择就可能变化，而逐 Token 生成机制会进一步放大这种差异。

Temperature controls how sharp or flat the token probability distribution is. Top-p filters candidate tokens based on their cumulative probability. Greedy decoding is different: it always selects the highest-probability token at each step instead of sampling randomly.

Temperature zero typically corresponds to greedy decoding. However, it does not guarantee perfect reproducibility because GPU floating-point computations, parallel execution, and batching can introduce small numerical differences. If two tokens have very similar scores, the selected token may change, and autoregressive generation can amplify that difference.

### 追问：Top-k 和 Top-p 的区别 Follow-up: Top-k vs Top-p

Top-k 和 Top-p 都是限制候选 Token 的采样策略。Top-k 保留固定数量的最高概率 Token，而 Top-p 保留累计概率达到指定阈值所需的最小候选集合。因此，Top-k 的候选数量固定，而 Top-p 会根据概率分布动态调整候选数量。

Top-k and Top-p are both sampling strategies that restrict the candidate tokens. Top-k keeps a fixed number of the highest-probability tokens, whereas Top-p keeps the smallest set of tokens whose cumulative probability reaches a specified threshold. Therefore, Top-k uses a fixed candidate count, while Top-p adapts the candidate set size to the probability distribution.

### 关键词 Keywords

- 概率分布 Probability distribution
- 原始分数与 Softmax Logits and softmax
- 核采样 Nucleus sampling
- 贪心解码 Greedy decoding
- 浮点精度 Floating-point precision
- GPU 非确定性 GPU non-determinism
- 批处理 Batching
- 自回归生成 Autoregressive generation

## 9. 快速复习 Quick Revision

- **Temperature**：调整概率分布的形状（T < 1 更尖锐，T > 1 更平坦）。
  Reshapes the distribution (T < 1 sharper, T > 1 flatter).
- **Top-p**：根据累计概率筛选候选 Token；Temperature 变化会影响它保留哪些词。
  Filters candidates by cumulative probability; changing the temperature changes which tokens it keeps.
- **Top-k**：只保留概率最高的 K 个候选；数量固定，不随分布变化。
  Keeps only the K most likely candidates; the count is fixed regardless of the distribution.
- **Top-k vs Top-p**：Top-k 看数量，Top-p 看累计概率；Top-p 会根据分布自动调整候选数量。
  Top-k looks at the count, top-p at cumulative probability; top-p adjusts the count to the distribution.
- **Greedy decoding**：每一步都选择最高概率的 Token；确定但容易重复，局部最优不保证全局最优。
  Picks the most likely token at each step; deterministic but repetitive, and locally best isn't globally best.
- **Claude API**：新模型不接受采样参数（400），改用 prompt + `effort`。
  New models reject sampling parameters (400); use the prompt + `effort` instead.
- **Temperature = 0**：通常采用贪心解码，而不是直接执行除以零。
  Usually means greedy decoding rather than actually dividing by zero.
- **GPU non-determinism**：浮点精度和并行计算可能导致微小差异。
  Floating-point precision and parallel math can cause tiny differences.
- **Batching**：批处理方式和执行内核可能影响数值结果。
  How requests are batched and which kernels run can change the numbers.
- **Autoregressive generation**：前面 Token 的差异可能影响后续整段回答。
  A difference in an early token can change the whole rest of the answer.

> [!quote] 一句话总结 One-sentence summary
> Temperature 控制概率分布，Top-p 控制候选范围，贪心解码选择最高概率的 Token，而 Temperature 为零并不能保证完全可重复，因为 GPU 计算仍可能存在非确定性。
>
> Temperature controls the shape of the probability distribution, Top-p controls the candidate set, greedy decoding selects the highest-probability token, and temperature zero does not guarantee perfect reproducibility because GPU computation can still be non-deterministic.

## 10. 🔗 相关笔记 Related Notes

- [[LLM 基础 - Lesson 1|第 1 课：LLM 基础 Lesson 1: LLM Basics]]
- [[Prompt 设计与结构化输出 - Lesson 2|第 2 课：Prompt 设计 Lesson 2: Prompt Design]]
