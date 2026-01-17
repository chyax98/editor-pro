# Mermaid 深度语法参考手册 (Expert Guide)

本手册涵盖 Mermaid 的全量语法与高级特性。AI 在生成图表时，应优先查阅此文档以获取最佳实践。

## 🗺️ 官方图表索引 (Chart Index)

| 类型 | 关键词 | 用途 | 关键特性 |
| :--- | :--- | :--- | :--- |
| **流程图** | `graph` / `flowchart` | 逻辑步骤、决策树 | 子图、多形状节点、样式类 |
| **时序图** | `sequenceDiagram` | 交互时序、API调用 | 激活块、并发(par)、循环(loop) |
| **类图** | `classDiagram` | OOP 架构设计 | 继承/组合关系、方法可见性 |
| **状态图** | `stateDiagram-v2` | 状态机、生命周期 | 复合状态、并发状态 |
| **实体关系图** | `erDiagram` | 数据库建模 | 1:1, 1:N, M:N 关系符号 |
| **甘特图** | `gantt` | 项目进度管理 | 日期排除、依赖关系 |
| **饼图** | `pie` | 简单占比统计 | 简单键值对 |
| **思维导图** | `mindmap` | 头脑风暴、层级结构 | 缩进语法、图标支持 |
| **Git图** | `gitGraph` | 版本分支管理 | commit, branch, merge, checkout |
| **象限图** | `quadrantChart` | 四象限分析 | x/y 轴标签、点位分布 |
| **时间轴** | `timeline` | 历史事件流 | 简单的时间-事件映射 |

---

## 🛡️ 最佳实践规范 (Best Practices)

### 1. ID 命名规范
*   **安全字符**：节点 ID 仅使用英文字母、数字和下划线（如 `Node_A`）。
*   **显示文本**：将显示文本放在 `[]`, `()` 等括号中。
    *   ✅ `A[开始 Process]`
    *   ❌ `开始 Process --> 结束` (中文 ID 易导致渲染解析错误)

### 2. 样式管理规范
*   **避免内联**：尽量不要在每个节点后写 `style A fill:#f9f`。
*   **使用类 (Class)**：使用 `classDef` 定义通用样式，然后批量应用。
    ```mermaid
    classDef error fill:#f96,stroke:#333;
    ErrorNode:::error
    ```

### 3. 先进特性使用
*   **FontAwesome**: 在新版 Mermaid 中，优先使用 `fa:fa-user` 语法插入图标（需字体支持）。
*   **Subgraphs**: 复杂逻辑务必通过 `subgraph` 分组，提高可读性。

---

## 0. 高级配置指令 (Configuration Directives)

通过 `%%{init: { ... }}%%` 可以控制 Mermaid 的全局渲染行为（主题、字体、曲线）。这对于美化图表至关重要。

### 0.1 更改主题 (Theme)
```mermaid
%%{init: {'theme': 'forest'}}%%
graph TD
    A --> B
```
*   可用主题：`default`, `base`, `dark`, `forest`, `neutral`.

### 0.2 自定义样式与布局 (Custom Config)
```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#ff0000',
    'edgeLabelBackground':'#ffffff',
    'tertiaryColor': '#fff0f0'
  },
  'flowchart': { 'curve': 'stepAfter' } 
}}%%
graph LR
    A --> B
```
*   `curve` 选项：`basis` (平滑), `linear` (直线), `stepAfter` (阶梯线)。

---

## 1. 流程图 (Flowchart) - 逻辑可视化的核心

### 1.1 方向与节点形状
```mermaid
graph TD
    %% 节点形状速查
    id1[矩形]
    id2(圆角矩形)
    id3([体育场形])
    id4[[子程序]]
    id5[(数据库)]
    id6((圆形))
    id7{{菱形/判断}}
    id8>非对称]
    id9{六边形}
    id10[/平行四边形/]
    id11[\反向平行四边形\]
```

### 1.2 连线样式 (Links)
- `-->` 实线箭头
- `---` 实线无箭头
- `-.->` 虚线箭头
- `==>` 粗实线箭头
- `-- text -->` 带标签的实线
- `-. text .->` 带标签的虚线
- `== text ==>` 带标签的粗线

### 1.3 子图 (Subgraphs) & 嵌套
```mermaid
graph TB
    c1-->c2
    subgraph one [主要流程]
    c1-->a2
    end
    subgraph two [次要流程]
    b1-->b2
    end
    subgraph three [Exception Handling]
    c3-->c4
    end
```

### 1.4 高级样式与图标 (Class & Styles)
**Tip**: 使用 `classDef` 定义样式类，批量应用样式。

```mermaid
graph LR
    A:::someclass --> B
    classDef someclass fill:#f96,stroke:#333,stroke-width:4px;
```

---

## 2. 时序图 (Sequence Diagram) - 交互与生命周期

### 2.1 核心语法
- `participant`: 定义参与者（控制顺序）。
- `actor`: 定义小人形状参与者。
- `activate`/`deactivate` (或 `+`/`-`): 控制生命线激活块。

### 2.2 消息类型
- `->` 实线无箭头
- `->>` 实线箭头 (同步调用)
- `-->` 虚线无箭头
- `-->>` 虚线箭头 (返回消息)
- `-x` 实线箭头加叉 (异步丢失)

### 2.3 逻辑控制块 (Fragments)
支持 `alt` (if/else), `opt` (if), `loop` (for/while), `par` (并行), `critical` (临界区)。

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App
    participant DB

    User->>App: Login()
    activate App
    App->>DB: Query User
    alt User Found
        DB-->>App: User Data
        App-->>User: Success
    else User Not Found
        DB-->>App: Null
        App-->>User: Error
    end
    deactivate App
```

---

## 3. 类图 (Class Diagram) - 架构设计

### 3.1 关系符号
- `<|--` 继承 (Inheritance)
- `*--` 组合 (Composition)
- `o--` 聚合 (Aggregation)
- `-->` 关联 (Association)
- `..>` 依赖 (Dependency)

### 3.2 成员可见性
- `+` Public
- `-` Private
- `#` Protected
- `~` Package/Internal

```mermaid
classDiagram
    class BankAccount {
        +String owner
        -BigDecimal balance
        +deposit(amount)
        +withdraw(amount)
    }
    class SavingsAccount
    BankAccount <|-- SavingsAccount
```

---

## 4. 状态图 (State Diagram v2) - 状态机

```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> [*]
    
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
    
    state Moving {
        Accelerating --> Decelerating
        Decelerating --> Accelerating
    }
```

---

## 5. 实体关系图 (ER Diagram) - 数据库建模

符号含义：
- `||` : 1
- `|{` : 1..n
- `}|` : 0..n
- `o|` : 0..1

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
```

---

## 6. 甘特图 (Gantt) - 项目管理

```mermaid
gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    axisFormat  %m-%d
    excludes    weekends

    section 需求阶段
    需求分析       :done,    des1, 2024-01-01,2024-01-05
    UI 设计       :active,  des2, 2024-01-06, 3d

    section 开发阶段
    后端 API      :         cod1, after des2, 5d
    前端实现       :         cod2, after des1, 5d
```

---

## 7. 思维导图 (Mindmap) - 2024 新特性

使用缩进语法来表示层级，支持图标。

```mermaid
mindmap
  root((核心主题))
    Origin
      Long history
      ::icon(fa fa-book)
      Popularisation
    Organisation
      Definitions
      Strategic planning
    Tools
      Pen and paper
      Mermaid
```

---

## 8. 时间轴 (Timeline)

类似于甘特图，但更侧重于历史事件的叙述。

```mermaid
timeline
    title History of Social Media Platform
    2002 : LinkedIn
    2004 : Facebook
         : Google
    2005 : Youtube
    2006 : Twitter
```

---

## 9. 象限图 (Quadrant Chart)

用于分析 SWOT 或 优先级排序 (Eisenhower Matrix)。

```mermaid
quadrantChart
    title Reach and engagement of campaigns
    x-axis Low Reach --> High Reach
    y-axis Low Engagement --> High Engagement
    quadrant-1 We should expand
    quadrant-2 Need to promote
    quadrant-3 Re-evaluate
    quadrant-4 May be improved
    Campaign A: [0.3, 0.6]
    Campaign B: [0.45, 0.23]
    Campaign C: [0.57, 0.69]
    Campaign D: [0.78, 0.34]
```

---

## 10. 饼图 (Pie Chart)

```mermaid
pie title 市场份额
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
```
