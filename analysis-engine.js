// 数据分析引擎

// 扩展主类的分析方法
Object.assign(FeishuAnalysisPlugin.prototype, {
    
    // 计算基础统计信息
    calculateBasicStats(data, fieldType) {
        if (!data || data.length === 0) {
            return { count: 0 };
        }

        const stats = {
            count: data.length,
            nonNullCount: data.filter(v => v !== null && v !== undefined).length
        };

        // 数字类型的统计
        if (fieldType === 2) {
            const numericData = data.filter(v => typeof v === 'number' && !isNaN(v));
            if (numericData.length > 0) {
                stats.sum = numericData.reduce((a, b) => a + b, 0);
                stats.mean = stats.sum / numericData.length;
                stats.median = this.calculateMedian(numericData);
                stats.min = Math.min(...numericData);
                stats.max = Math.max(...numericData);
                stats.std = this.calculateStandardDeviation(numericData, stats.mean);
                stats.variance = stats.std * stats.std;
            }
        }

        // 文本类型的统计
        if (fieldType === 1) {
            const textData = data.filter(v => typeof v === 'string');
            if (textData.length > 0) {
                stats.uniqueCount = new Set(textData).size;
                stats.avgLength = textData.reduce((sum, text) => sum + text.length, 0) / textData.length;
                stats.maxLength = Math.max(...textData.map(text => text.length));
                stats.minLength = Math.min(...textData.map(text => text.length));
            }
        }

        // 日期类型的统计
        if (fieldType === 5) {
            const dateData = data.filter(v => v instanceof Date && !isNaN(v));
            if (dateData.length > 0) {
                stats.earliestDate = new Date(Math.min(...dateData));
                stats.latestDate = new Date(Math.max(...dateData));
                stats.dateRange = stats.latestDate - stats.earliestDate;
            }
        }

        // 布尔类型的统计
        if (fieldType === 7) {
            const boolData = data.filter(v => typeof v === 'boolean');
            stats.trueCount = boolData.filter(v => v === true).length;
            stats.falseCount = boolData.filter(v => v === false).length;
            stats.truePercentage = (stats.trueCount / boolData.length * 100).toFixed(2);
        }

        return stats;
    },

    // 计算中位数
    calculateMedian(data) {
        const sorted = [...data].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    },

    // 计算标准差
    calculateStandardDeviation(data, mean) {
        const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    },

    // 计算数据分布
    calculateDistribution(data, fieldType) {
        if (!data || data.length === 0) {
            return {};
        }

        const distribution = {};

        // 数字类型的分布（直方图）
        if (fieldType === 2) {
            const numericData = data.filter(v => typeof v === 'number' && !isNaN(v));
            if (numericData.length > 0) {
                distribution.histogram = this.createHistogram(numericData);
                distribution.quartiles = this.calculateQuartiles(numericData);
            }
        }

        // 分类数据的分布
        if ([1, 3, 4].includes(fieldType)) {
            const frequency = {};
            data.forEach(value => {
                const key = Array.isArray(value) ? value.join(', ') : String(value);
                frequency[key] = (frequency[key] || 0) + 1;
            });
            
            distribution.frequency = frequency;
            distribution.topValues = Object.entries(frequency)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
        }

        // 日期分布
        if (fieldType === 5) {
            const dateData = data.filter(v => v instanceof Date && !isNaN(v));
            if (dateData.length > 0) {
                distribution.dateDistribution = this.analyzeDateDistribution(dateData);
            }
        }

        return distribution;
    },

    // 创建直方图
    createHistogram(data, bins = 10) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binWidth = (max - min) / bins;
        
        const histogram = Array(bins).fill(0);
        const binLabels = [];
        
        for (let i = 0; i < bins; i++) {
            const start = min + i * binWidth;
            const end = min + (i + 1) * binWidth;
            binLabels.push(`${start.toFixed(2)}-${end.toFixed(2)}`);
        }
        
        data.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
            histogram[binIndex]++;
        });
        
        return { bins: histogram, labels: binLabels };
    },

    // 计算四分位数
    calculateQuartiles(data) {
        const sorted = [...data].sort((a, b) => a - b);
        const n = sorted.length;
        
        return {
            q1: this.calculatePercentile(sorted, 25),
            q2: this.calculatePercentile(sorted, 50), // 中位数
            q3: this.calculatePercentile(sorted, 75)
        };
    },

    // 计算百分位数
    calculatePercentile(sortedData, percentile) {
        const index = (percentile / 100) * (sortedData.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        
        if (upper >= sortedData.length) return sortedData[sortedData.length - 1];
        return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
    },

    // 分析日期分布
    analyzeDateDistribution(dateData) {
        const distribution = {
            byYear: {},
            byMonth: {},
            byDayOfWeek: {},
            byHour: {}
        };

        dateData.forEach(date => {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const dayOfWeek = date.getDay();
            const hour = date.getHours();

            distribution.byYear[year] = (distribution.byYear[year] || 0) + 1;
            distribution.byMonth[month] = (distribution.byMonth[month] || 0) + 1;
            distribution.byDayOfWeek[dayOfWeek] = (distribution.byDayOfWeek[dayOfWeek] || 0) + 1;
            distribution.byHour[hour] = (distribution.byHour[hour] || 0) + 1;
        });

        return distribution;
    },

    // 异常值检测
    detectOutliers(data, fieldType) {
        if (fieldType !== 2 || !data || data.length === 0) {
            return { outliers: [], method: 'not_applicable' };
        }

        const numericData = data.filter(v => typeof v === 'number' && !isNaN(v));
        if (numericData.length < 4) {
            return { outliers: [], method: 'insufficient_data' };
        }

        // 使用IQR方法检测异常值
        const quartiles = this.calculateQuartiles(numericData);
        const iqr = quartiles.q3 - quartiles.q1;
        const lowerBound = quartiles.q1 - 1.5 * iqr;
        const upperBound = quartiles.q3 + 1.5 * iqr;

        const outliers = numericData.filter(value => value < lowerBound || value > upperBound);

        return {
            outliers,
            method: 'IQR',
            bounds: { lower: lowerBound, upper: upperBound },
            count: outliers.length,
            percentage: (outliers.length / numericData.length * 100).toFixed(2)
        };
    },

    // 计算字段间相关性
    calculateCorrelation(records) {
        const numericFields = this.selectedFields.filter(field => field.type === 2);
        if (numericFields.length < 2) {
            return { message: '需要至少两个数字字段才能计算相关性' };
        }

        const correlations = [];
        
        for (let i = 0; i < numericFields.length; i++) {
            for (let j = i + 1; j < numericFields.length; j++) {
                const field1 = numericFields[i];
                const field2 = numericFields[j];
                
                const data1 = this.extractFieldData(records, field1);
                const data2 = this.extractFieldData(records, field2);
                
                const correlation = this.calculatePearsonCorrelation(data1, data2);
                
                correlations.push({
                    field1: field1.name,
                    field2: field2.name,
                    correlation: correlation,
                    strength: this.interpretCorrelation(correlation)
                });
            }
        }

        return { correlations };
    },

    // 计算皮尔逊相关系数
    calculatePearsonCorrelation(x, y) {
        if (x.length !== y.length || x.length === 0) return 0;

        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    },

    // 解释相关性强度
    interpretCorrelation(r) {
        const abs = Math.abs(r);
        if (abs >= 0.8) return '强相关';
        if (abs >= 0.6) return '中等相关';
        if (abs >= 0.3) return '弱相关';
        return '无相关';
    },

    // 趋势分析
    analyzeTrends(records) {
        const dateFields = this.selectedFields.filter(field => field.type === 5);
        const numericFields = this.selectedFields.filter(field => field.type === 2);
        
        if (dateFields.length === 0 || numericFields.length === 0) {
            return { message: '需要至少一个日期字段和一个数字字段才能进行趋势分析' };
        }

        const trends = [];
        
        dateFields.forEach(dateField => {
            numericFields.forEach(numericField => {
                const trendData = this.calculateTrend(records, dateField, numericField);
                trends.push({
                    dateField: dateField.name,
                    valueField: numericField.name,
                    trend: trendData
                });
            });
        });

        return { trends };
    },

    // 计算单个趋势
    calculateTrend(records, dateField, valueField) {
        const data = records.map(record => ({
            date: this.processCellValue(record.fields[dateField.id], dateField.type),
            value: this.processCellValue(record.fields[valueField.id], valueField.type)
        })).filter(item => item.date && typeof item.value === 'number');

        // 按日期排序
        data.sort((a, b) => a.date - b.date);

        if (data.length < 2) {
            return { message: '数据点不足，无法计算趋势' };
        }

        // 计算线性回归
        const regression = this.calculateLinearRegression(data);
        
        return {
            dataPoints: data.length,
            slope: regression.slope,
            intercept: regression.intercept,
            rSquared: regression.rSquared,
            trend: regression.slope > 0 ? '上升' : regression.slope < 0 ? '下降' : '平稳'
        };
    },

    // 计算线性回归
    calculateLinearRegression(data) {
        const n = data.length;
        const sumX = data.reduce((sum, point, i) => sum + i, 0);
        const sumY = data.reduce((sum, point) => sum + point.value, 0);
        const sumXY = data.reduce((sum, point, i) => sum + i * point.value, 0);
        const sumX2 = data.reduce((sum, point, i) => sum + i * i, 0);
        const sumY2 = data.reduce((sum, point) => sum + point.value * point.value, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // 计算R²
        const yMean = sumY / n;
        const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.value - yMean, 2), 0);
        const ssResidual = data.reduce((sum, point, i) => {
            const predicted = slope * i + intercept;
            return sum + Math.pow(point.value - predicted, 2);
        }, 0);
        const rSquared = 1 - (ssResidual / ssTotal);

        return { slope, intercept, rSquared };
    },

    // 生成AI洞察
    generateAIInsights(analysisResults) {
        const insights = [];

        // 基于数据量的洞察
        if (analysisResults.summary.totalRecords > 1000) {
            insights.push({
                title: '大数据集分析',
                description: `您的数据集包含${analysisResults.summary.totalRecords}条记录，这是一个相当大的数据集，分析结果具有较高的统计意义。`
            });
        }

        // 基于字段分析的洞察
        for (const [fieldName, analysis] of Object.entries(analysisResults.fieldAnalysis)) {
            if (analysis.basicStats && analysis.basicStats.std) {
                const cv = analysis.basicStats.std / analysis.basicStats.mean;
                if (cv > 1) {
                    insights.push({
                        title: `${fieldName}字段变异性较大`,
                        description: `该字段的变异系数为${cv.toFixed(2)}，表明数据分散程度较高，可能存在多个不同的数据群体。`
                    });
                }
            }

            if (analysis.outliers && analysis.outliers.count > 0) {
                insights.push({
                    title: `${fieldName}字段存在异常值`,
                    description: `检测到${analysis.outliers.count}个异常值（占${analysis.outliers.percentage}%），建议进一步调查这些异常数据的原因。`
                });
            }
        }

        // 基于相关性的洞察
        if (analysisResults.correlation && analysisResults.correlation.correlations) {
            const strongCorrelations = analysisResults.correlation.correlations.filter(c => Math.abs(c.correlation) > 0.7);
            strongCorrelations.forEach(corr => {
                insights.push({
                    title: `强相关关系发现`,
                    description: `${corr.field1}和${corr.field2}之间存在${corr.strength}（相关系数：${corr.correlation.toFixed(3)}），这可能表明两个变量之间存在重要的业务关联。`
                });
            });
        }

        return insights;
    }
});
