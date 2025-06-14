# 飞书多维表格深度分析插件

## 🎯 功能概述

这是一个强大的飞书多维表格插件，专门用于对表格数据进行深度分析。插件提供了多种分析功能，包括基础统计、数据分布、关联性分析、趋势分析、异常值检测和AI智能洞察等。

## ✨ 主要功能

### 📊 基础统计分析
- **数字字段**: 计数、求和、平均值、中位数、最大值、最小值、标准差、方差
- **文本字段**: 计数、唯一值数量、平均长度、最大/最小长度
- **日期字段**: 最早/最晚日期、日期范围
- **布尔字段**: 真/假值统计和百分比

### 📈 数据分布分析
- **数字分布**: 直方图、四分位数分析
- **分类分布**: 频次统计、Top值分析
- **日期分布**: 按年、月、星期、小时的分布分析

### 🔗 高级分析功能
- **关联性分析**: 计算字段间的皮尔逊相关系数
- **趋势分析**: 时间序列数据的线性回归分析
- **异常值检测**: 基于IQR方法的异常值识别
- **AI智能洞察**: 基于分析结果的智能建议

### 📊 可视化展示
- 直方图、饼图、柱状图
- 相关性热力图
- 趋势线图表
- 统计摘要图表

### 💾 导出功能
- JSON格式导出
- CSV格式导出
- HTML报告生成

## 🚀 使用方法

### 1. 安装插件

1. 在飞书多维表格中，点击右上角的"插件"按钮
2. 选择"添加插件" → "自定义插件"
3. 输入插件URL或上传插件文件

### 2. 基本操作流程

#### 步骤1: 选择数据源
- 从下拉菜单中选择要分析的数据表
- 勾选需要分析的字段（支持多选）
- 可选择性设置数据范围（起始行到结束行）

#### 步骤2: 选择分析类型
- **基础统计分析**: 计算基本统计指标
- **数据分布分析**: 分析数据的分布情况
- **关联性分析**: 发现字段间的关联关系
- **趋势分析**: 分析时间序列数据的趋势
- **异常值检测**: 识别数据中的异常值
- **AI智能洞察**: 获取基于AI的深度分析建议

#### 步骤3: 执行分析
- 点击"开始分析"按钮
- 等待分析完成（会显示进度条）
- 查看分析结果

#### 步骤4: 查看结果
- **数据摘要**: 查看总体统计信息
- **详细分析**: 查看各字段的详细分析结果
- **图表展示**: 查看可视化图表
- **AI洞察**: 查看智能分析建议

#### 步骤5: 导出结果
- 选择导出格式（JSON/CSV/报告）
- 下载分析结果文件

## 📋 支持的字段类型

| 字段类型 | 支持的分析 | 生成的图表 |
|---------|-----------|-----------|
| 文本 | 基础统计、分布分析 | 饼图、柱状图 |
| 数字 | 全部分析类型 | 直方图、统计图、相关性图 |
| 单选/多选 | 基础统计、分布分析 | 饼图、柱状图 |
| 日期 | 基础统计、分布分析、趋势分析 | 时间分布图、趋势图 |
| 复选框 | 基础统计 | 饼图 |

## 🎨 界面说明

### 主要区域
1. **数据源选择区域**: 选择表格和字段
2. **分析类型选择区域**: 选择要执行的分析类型
3. **操作按钮区域**: 开始分析、清空结果
4. **结果展示区域**: 显示分析结果和图表
5. **导出区域**: 导出分析结果

### 图表类型
- **直方图**: 显示数字字段的分布
- **饼图**: 显示分类字段的占比
- **柱状图**: 显示频次或统计值
- **折线图**: 显示趋势变化
- **相关性图**: 显示字段间的关联强度

## 🔧 技术特性

### 前端技术
- **HTML5 + CSS3**: 现代化的用户界面
- **JavaScript ES6+**: 高性能的数据处理
- **Chart.js**: 专业的图表库
- **响应式设计**: 适配不同屏幕尺寸

### 飞书集成
- **Base JSSDK**: 与飞书多维表格深度集成
- **实时数据**: 直接读取表格数据
- **权限控制**: 遵循飞书的权限体系

### 分析算法
- **统计学方法**: 标准的统计分析算法
- **机器学习**: 异常值检测、趋势预测
- **数据挖掘**: 关联性分析、模式识别

## 📊 分析结果解读

### 基础统计
- **计数**: 非空值的数量
- **平均值**: 数据的中心趋势
- **中位数**: 50%分位数，不受极值影响
- **标准差**: 数据的离散程度

### 相关性分析
- **强相关** (|r| ≥ 0.8): 两个变量高度相关
- **中等相关** (0.6 ≤ |r| < 0.8): 两个变量中度相关
- **弱相关** (0.3 ≤ |r| < 0.6): 两个变量轻度相关
- **无相关** (|r| < 0.3): 两个变量基本无关

### 异常值检测
- 使用IQR（四分位距）方法
- 超出 Q1-1.5×IQR 或 Q3+1.5×IQR 的值被认为是异常值

### 趋势分析
- **上升趋势**: 斜率 > 0
- **下降趋势**: 斜率 < 0
- **平稳趋势**: 斜率 ≈ 0
- **R²值**: 表示趋势线的拟合程度

## 🛠️ 故障排除

### 常见问题

**Q: 插件无法加载数据表？**
A: 请确保您有相应表格的访问权限，并且表格中有数据。

**Q: 分析结果不准确？**
A: 请检查数据质量，确保字段类型正确，清理异常数据。

**Q: 图表显示异常？**
A: 请刷新页面重试，或检查浏览器兼容性。

**Q: 导出功能不工作？**
A: 请检查浏览器的下载设置，确保允许下载文件。

### 性能优化建议
- 对于大数据集（>10000行），建议分批分析
- 选择必要的字段进行分析，避免全选
- 定期清理分析结果以释放内存

## 📞 技术支持

如果您在使用过程中遇到问题，请：
1. 查看本文档的故障排除部分
2. 检查浏览器控制台的错误信息
3. 联系技术支持团队

## 🔄 版本更新

### v1.0.0 (当前版本)
- 基础统计分析功能
- 数据分布分析
- 关联性分析
- 趋势分析
- 异常值检测
- AI智能洞察
- 多种图表展示
- 结果导出功能

## 📄 许可证

本插件遵循 MIT 许可证。

---

**注意**: 本插件需要在飞书多维表格环境中运行，请确保您有相应的访问权限。
