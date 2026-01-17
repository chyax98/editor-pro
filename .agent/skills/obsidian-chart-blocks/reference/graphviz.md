# Graphviz (DOT) 深度语法参考手册 (Expert Guide)

Graphviz 使用 DOT 语言描述图形结构，擅长自动计算复杂节点的最佳布局。对于架构图、数据库关系图和状态机，它是最佳选择。

## 🗺️ 引擎与布局索引 (Layout Engines)

AI 应根据图形特征选择 `layout` 属性（默认是 `dot`）。

| 引擎 | 适用场景 | 布局特点 |
| :--- | :--- | :--- |
| **`dot`** | **有向图**、层级结构 | 节点分层排列，减少交叉边，适合流程图/树。 |
| **`neato`** | **无向图**、网络拓扑 | 基于弹簧模型，节点均匀分布，适合网状结构。 |
| **`fdp`** | **无向图**、聚类 | 类似 neato 但支持 cluster。 |
| **`circo`** | **环形结构** | 节点排列在同心圆上。 |

---

## 🎨 全局配置与样式 (Global Attributes)

在 `digraph` 开头定义的属性会应用到全局。

```graphviz
digraph Architecture {
    // === 布局控制 ===
    rankdir=LR;          // 方向: LR (左->右), TB (上->下)
    splines=ortho;       // 连线风格: ortho (折线), spline (曲线), line (直线)
    nodesep=0.8;         // 同层节点间距
    ranksep=1.2;         // 层级间距
    fontname="Helvetica"; // 全局字体

    // === 默认样式 ===
    node [shape=box, style="filled,rounded", color="#999999", fillcolor="#f9f9f9", fontname="Helvetica"];
    edge [fontname="Helvetica", color="#666666", arrowsize=0.8];

    // === 定义层级 (强制对齐) ===
    { rank=same; NodeA; NodeB; } // 将 NodeA 和 NodeB 强制放在同一层
}
```

---

## 🧩 高级节点类型 (Advanced Nodes)

### 1. HTML 类表格节点 (Record-based HTML)
Graphviz 的杀手锏。使用 HTML 表格语法定义复杂的节点结构（如数据库表、UML类）。

*   **注意**：`label` 必须用 `<...>` 包裹，而非双引号。

```graphviz
digraph Database {
    node [shape=plain]; // 必须设为 plain 才能用 HTML

    UserTable [label=<
        <table border="0" cellborder="1" cellspacing="0">
            <tr><td bgcolor="lightblue"><b>Users</b></td></tr>
            <tr><td port="id">id: INT (PK)</td></tr>
            <tr><td port="email">email: VARCHAR</td></tr>
            <tr><td port="role_id">role_id: INT (FK)</td></tr>
        </table>
    >];

    RoleTable [label=<
        <table border="0" cellborder="1" cellspacing="0">
            <tr><td bgcolor="lightgrey"><b>Roles</b></td></tr>
            <tr><td port="id">id: INT (PK)</td></tr>
            <tr><td>name: VARCHAR</td></tr>
        </table>
    >];

    // 连接具体端口 (Port)
    UserTable:role_id -> RoleTable:id;
}
```

### 2. 传统 Record 节点
旧式语法，不如 HTML 灵活，但写起来简单。使用 `|` 分隔列，使用 `{...}` 嵌套行。

```graphviz
digraph Structs {
    node [shape=record];
    struct1 [label="<f0> left|<f1> mid\dle|<f2> right"];
    struct2 [label="<f0> one|<f1> two"];
    
    struct1:f1 -> struct2:f0;
}
```

---

## 🔗 边与关系 (Edges)

### 3.1 箭头与样式
```graphviz
digraph Edges {
    A -> B [dir=both];              // 双向箭头
    B -> C [arrowhead=open];        // 开放箭头
    C -> D [arrowhead=diamond];     // 菱形箭头 (聚合关系)
    D -> E [arrowhead=odot];        // 圆圈
    
    // 复合样式
    E -> F [style=dashed, penwidth=2, label="Async Call"];
    F -> G [style=dotted, color="red"];
}
```

---

## 📦 子图与聚类 (Subgraphs & Clusters)

**必须以 `cluster_` 开头**，否则只作为逻辑分组而不显示边框。

```graphviz
digraph G {
    compound=true; // 允许连线连接子图边界

    subgraph cluster_backend {
        label="Backend Services";
        style=filled;
        color=lightgrey;
        node [style=filled, color=white];
        
        API_Gateway -> Auth_Service;
        Auth_Service -> DB;
    }

    subgraph cluster_frontend {
        label="Frontend App";
        color=blue;
        
        Dashboard -> Login;
    }

    // 跨子图连接
    Login -> API_Gateway [lhead=cluster_backend]; // lhead需配合 compound=true
}
```
