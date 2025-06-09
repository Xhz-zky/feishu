// 飞书多维表格深度分析插件主文件

class FeishuAnalysisPlugin {
    constructor() {
        this.base = null;
        this.currentTable = null;
        this.selectedFields = [];
        this.analysisData = null;
        this.charts = [];
        
        this.init();
    }

    async init() {
        try {
            // 初始化飞书Base SDK
            this.base = await window.bitable.base.getActiveTable();
            console.log('飞书Base SDK初始化成功');
            
            // 加载数据表列表
            await this.loadTables();
            
            // 绑定事件监听器
            this.bindEvents();
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('插件初始化失败，请确保在飞书多维表格环境中运行');
        }
    }

    async loadTables() {
        try {
            const tables = await window.bitable.base.getTableList();
            const tableSelect = document.getElementById('tableSelect');
            
            // 清空现有选项
            tableSelect.innerHTML = '<option value="">请选择数据表...</option>';
            
            // 添加表格选项
            tables.forEach(table => {
                const option = document.createElement('option');
                option.value = table.id;
                option.textContent = table.name;
                tableSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('加载数据表失败:', error);
            this.showError('加载数据表失败');
        }
    }

    async loadFields(tableId) {
        try {
            const table = await window.bitable.base.getTable(tableId);
            this.currentTable = table;
            
            const fields = await table.getFieldList();
            const fieldContainer = document.getElementById('fieldCheckboxes');
            
            // 清空现有字段
            fieldContainer.innerHTML = '';
            
            // 添加字段复选框
            fields.forEach(field => {
                const label = document.createElement('label');
                label.className = 'checkbox-label';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = field.id;
                checkbox.dataset.fieldName = field.name;
                checkbox.dataset.fieldType = field.type;
                
                const span = document.createElement('span');
                span.textContent = `${field.name} (${this.getFieldTypeLabel(field.type)})`;
                
                label.appendChild(checkbox);
                label.appendChild(span);
                fieldContainer.appendChild(label);
            });
            
        } catch (error) {
            console.error('加载字段失败:', error);
            this.showError('加载字段失败');
        }
    }

    getFieldTypeLabel(type) {
        const typeMap = {
            1: '文本',
            2: '数字',
            3: '单选',
            4: '多选',
            5: '日期',
            7: '复选框',
            11: '人员',
            13: '电话',
            15: '网址',
            17: '附件',
            18: '关联',
            19: '公式',
            20: '创建时间',
            21: '修改时间',
            22: '创建人',
            23: '修改人'
        };
        return typeMap[type] || '未知';
    }

    bindEvents() {
        // 表格选择事件
        document.getElementById('tableSelect').addEventListener('change', async (e) => {
            if (e.target.value) {
                await this.loadFields(e.target.value);
            }
        });

        // 分析按钮事件
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.startAnalysis();
        });

        // 清空按钮事件
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearResults();
        });

        // 导出按钮事件
        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            this.exportResults('json');
        });

        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            this.exportResults('csv');
        });

        document.getElementById('exportReportBtn').addEventListener('click', () => {
            this.exportResults('report');
        });
    }

    async startAnalysis() {
        try {
            // 验证输入
            if (!this.validateInputs()) {
                return;
            }

            // 显示进度
            this.showProgress();

            // 获取选中的字段
            this.selectedFields = this.getSelectedFields();

            // 获取数据
            const records = await this.fetchData();
            
            // 更新进度
            this.updateProgress(30, '正在处理数据...');

            // 执行分析
            const analysisResults = await this.performAnalysis(records);
            
            // 更新进度
            this.updateProgress(70, '正在生成图表...');

            // 显示结果
            await this.displayResults(analysisResults);
            
            // 完成
            this.updateProgress(100, '分析完成！');
            setTimeout(() => {
                this.hideProgress();
            }, 1000);

        } catch (error) {
            console.error('分析失败:', error);
            this.showError('分析过程中发生错误: ' + error.message);
            this.hideProgress();
        }
    }

    validateInputs() {
        const tableId = document.getElementById('tableSelect').value;
        if (!tableId) {
            this.showError('请选择数据表');
            return false;
        }

        const selectedFields = this.getSelectedFields();
        if (selectedFields.length === 0) {
            this.showError('请至少选择一个字段进行分析');
            return false;
        }

        const analysisTypes = this.getSelectedAnalysisTypes();
        if (analysisTypes.length === 0) {
            this.showError('请至少选择一种分析类型');
            return false;
        }

        return true;
    }

    getSelectedFields() {
        const checkboxes = document.querySelectorAll('#fieldCheckboxes input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => ({
            id: cb.value,
            name: cb.dataset.fieldName,
            type: parseInt(cb.dataset.fieldType)
        }));
    }

    getSelectedAnalysisTypes() {
        const types = [];
        if (document.getElementById('basicStats').checked) types.push('basicStats');
        if (document.getElementById('distribution').checked) types.push('distribution');
        if (document.getElementById('correlation').checked) types.push('correlation');
        if (document.getElementById('trend').checked) types.push('trend');
        if (document.getElementById('outlier').checked) types.push('outlier');
        if (document.getElementById('aiInsights').checked) types.push('aiInsights');
        if (document.getElementById('prediction').checked) types.push('prediction');
        return types;
    }

    async fetchData() {
        try {
            const startRecord = parseInt(document.getElementById('startRecord').value) || 1;
            const endRecord = parseInt(document.getElementById('endRecord').value) || null;

            // 获取记录
            const records = await this.currentTable.getRecords({
                pageSize: endRecord ? (endRecord - startRecord + 1) : 5000
            });

            // 处理数据范围
            let filteredRecords = records.records;
            if (startRecord > 1 || endRecord) {
                const start = startRecord - 1;
                const end = endRecord ? endRecord : filteredRecords.length;
                filteredRecords = filteredRecords.slice(start, end);
            }

            return filteredRecords;

        } catch (error) {
            console.error('获取数据失败:', error);
            throw new Error('获取数据失败');
        }
    }

    async performAnalysis(records) {
        const analysisTypes = this.getSelectedAnalysisTypes();
        const results = {
            summary: {
                totalRecords: records.length,
                selectedFields: this.selectedFields.length,
                analysisTypes: analysisTypes.length
            },
            fieldAnalysis: {},
            charts: [],
            insights: []
        };

        // 为每个字段执行分析
        for (const field of this.selectedFields) {
            const fieldData = this.extractFieldData(records, field);
            const fieldAnalysis = {};

            // 基础统计分析
            if (analysisTypes.includes('basicStats')) {
                fieldAnalysis.basicStats = this.calculateBasicStats(fieldData, field.type);
            }

            // 数据分布分析
            if (analysisTypes.includes('distribution')) {
                fieldAnalysis.distribution = this.calculateDistribution(fieldData, field.type);
            }

            // 异常值检测
            if (analysisTypes.includes('outlier')) {
                fieldAnalysis.outliers = this.detectOutliers(fieldData, field.type);
            }

            results.fieldAnalysis[field.name] = fieldAnalysis;
        }

        // 关联性分析
        if (analysisTypes.includes('correlation') && this.selectedFields.length > 1) {
            results.correlation = this.calculateCorrelation(records);
        }

        // 趋势分析
        if (analysisTypes.includes('trend')) {
            results.trends = this.analyzeTrends(records);
        }

        // AI洞察
        if (analysisTypes.includes('aiInsights')) {
            results.aiInsights = this.generateAIInsights(results);
        }

        this.analysisData = results;
        return results;
    }

    extractFieldData(records, field) {
        return records.map(record => {
            const cellValue = record.fields[field.id];
            return this.processCellValue(cellValue, field.type);
        }).filter(value => value !== null && value !== undefined);
    }

    processCellValue(cellValue, fieldType) {
        if (!cellValue) return null;

        switch (fieldType) {
            case 2: // 数字
                return typeof cellValue === 'number' ? cellValue : parseFloat(cellValue);
            case 5: // 日期
                return new Date(cellValue);
            case 7: // 复选框
                return Boolean(cellValue);
            case 3: // 单选
            case 4: // 多选
                return Array.isArray(cellValue) ? cellValue : [cellValue];
            default:
                return String(cellValue);
        }
    }

    showProgress() {
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
    }

    updateProgress(percentage, text) {
        document.getElementById('progressFill').style.width = percentage + '%';
        document.getElementById('progressText').textContent = text;
    }

    hideProgress() {
        document.getElementById('progressSection').style.display = 'none';
    }

    showError(message) {
        alert('错误: ' + message);
    }

    async displayResults(results) {
        // 显示结果区域
        document.getElementById('resultsSection').style.display = 'block';

        // 显示摘要
        this.displaySummary(results.summary);

        // 显示详细分析
        this.displayDetailedAnalysis(results.fieldAnalysis);

        // 生成图表
        await this.generateCharts(results);

        // 显示AI洞察
        if (results.aiInsights) {
            this.displayAIInsights(results.aiInsights);
        }
    }

    displaySummary(summary) {
        const summaryContent = document.getElementById('summaryContent');
        summaryContent.innerHTML = `
            <div class="summary-item">
                <span class="summary-value">${summary.totalRecords}</span>
                <div class="summary-label">总记录数</div>
            </div>
            <div class="summary-item">
                <span class="summary-value">${summary.selectedFields}</span>
                <div class="summary-label">分析字段数</div>
            </div>
            <div class="summary-item">
                <span class="summary-value">${summary.analysisTypes}</span>
                <div class="summary-label">分析类型数</div>
            </div>
            <div class="summary-item">
                <span class="summary-value">${new Date().toLocaleString()}</span>
                <div class="summary-label">分析时间</div>
            </div>
        `;
    }

    displayDetailedAnalysis(fieldAnalysis) {
        const detailsContent = document.getElementById('detailsContent');
        let html = '<table class="details-table"><thead><tr><th>字段名</th><th>数据类型</th><th>统计信息</th></tr></thead><tbody>';

        for (const [fieldName, analysis] of Object.entries(fieldAnalysis)) {
            html += `<tr><td>${fieldName}</td><td>`;

            if (analysis.basicStats) {
                const stats = analysis.basicStats;
                html += `<div>基础统计: 计数=${stats.count}, `;
                if (stats.mean !== undefined) html += `平均值=${stats.mean.toFixed(2)}, `;
                if (stats.sum !== undefined) html += `总和=${stats.sum}, `;
                html += `</div>`;
            }

            html += `</td></tr>`;
        }

        html += '</tbody></table>';
        detailsContent.innerHTML = html;
    }

    displayAIInsights(insights) {
        const aiCard = document.getElementById('aiInsightsCard');
        const aiContent = document.getElementById('aiInsightsContent');

        let html = '';
        insights.forEach(insight => {
            html += `
                <div class="insight-item">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-description">${insight.description}</div>
                </div>
            `;
        });

        aiContent.innerHTML = html;
        aiCard.style.display = 'block';
    }

    exportResults(format) {
        if (!this.analysisData) {
            this.showError('没有可导出的分析结果');
            return;
        }

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `analysis_results_${timestamp}`;

        switch (format) {
            case 'json':
                this.downloadJSON(this.analysisData, filename + '.json');
                break;
            case 'csv':
                this.downloadCSV(this.analysisData, filename + '.csv');
                break;
            case 'report':
                this.generateReport(filename + '.html');
                break;
        }
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    downloadCSV(data, filename) {
        let csv = 'Field,Metric,Value\n';

        for (const [fieldName, analysis] of Object.entries(data.fieldAnalysis)) {
            if (analysis.basicStats) {
                const stats = analysis.basicStats;
                csv += `${fieldName},Count,${stats.count}\n`;
                if (stats.mean !== undefined) csv += `${fieldName},Mean,${stats.mean}\n`;
                if (stats.sum !== undefined) csv += `${fieldName},Sum,${stats.sum}\n`;
            }
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, filename);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearResults() {
        document.getElementById('resultsSection').style.display = 'none';
        this.charts.forEach(chart => chart.destroy());
        this.charts = [];
        this.analysisData = null;
    }
}

// 初始化插件
document.addEventListener('DOMContentLoaded', () => {
    new FeishuAnalysisPlugin();
});
