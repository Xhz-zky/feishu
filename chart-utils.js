// 图表生成工具

// 扩展主类的图表方法
Object.assign(FeishuAnalysisPlugin.prototype, {
    
    // 生成所有图表
    async generateCharts(analysisResults) {
        const chartsContainer = document.getElementById('chartsContainer');
        chartsContainer.innerHTML = '';

        // 为每个字段生成相应的图表
        for (const [fieldName, analysis] of Object.entries(analysisResults.fieldAnalysis)) {
            const field = this.selectedFields.find(f => f.name === fieldName);
            
            if (analysis.distribution) {
                await this.createDistributionChart(fieldName, analysis.distribution, field.type, chartsContainer);
            }
            
            if (analysis.basicStats && field.type === 2) {
                await this.createStatisticsChart(fieldName, analysis.basicStats, chartsContainer);
            }
        }

        // 相关性热力图
        if (analysisResults.correlation && analysisResults.correlation.correlations) {
            await this.createCorrelationChart(analysisResults.correlation, chartsContainer);
        }

        // 趋势图
        if (analysisResults.trends && analysisResults.trends.trends) {
            await this.createTrendCharts(analysisResults.trends, chartsContainer);
        }
    },

    // 创建分布图表
    async createDistributionChart(fieldName, distribution, fieldType, container) {
        const wrapper = this.createChartWrapper(`${fieldName} - 数据分布`, container);
        const canvas = wrapper.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        let chartConfig;

        // 数字类型 - 直方图
        if (fieldType === 2 && distribution.histogram) {
            chartConfig = {
                type: 'bar',
                data: {
                    labels: distribution.histogram.labels,
                    datasets: [{
                        label: '频次',
                        data: distribution.histogram.bins,
                        backgroundColor: 'rgba(102, 126, 234, 0.6)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `${fieldName} 分布直方图`
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '频次'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: '数值区间'
                            }
                        }
                    }
                }
            };
        }
        
        // 分类类型 - 饼图或柱状图
        else if ([1, 3, 4].includes(fieldType) && distribution.frequency) {
            const entries = Object.entries(distribution.frequency);
            const topEntries = entries.sort(([,a], [,b]) => b - a).slice(0, 10);
            
            if (topEntries.length <= 6) {
                // 饼图
                chartConfig = {
                    type: 'pie',
                    data: {
                        labels: topEntries.map(([key]) => key),
                        datasets: [{
                            data: topEntries.map(([,value]) => value),
                            backgroundColor: this.generateColors(topEntries.length),
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `${fieldName} 分布饼图`
                            },
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                };
            } else {
                // 柱状图
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: topEntries.map(([key]) => key.length > 15 ? key.substring(0, 15) + '...' : key),
                        datasets: [{
                            label: '频次',
                            data: topEntries.map(([,value]) => value),
                            backgroundColor: 'rgba(102, 126, 234, 0.6)',
                            borderColor: 'rgba(102, 126, 234, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `${fieldName} 分布柱状图（前10项）`
                            },
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: '频次'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: '类别'
                                }
                            }
                        }
                    }
                };
            }
        }

        // 日期类型 - 时间分布
        else if (fieldType === 5 && distribution.dateDistribution) {
            const yearData = distribution.dateDistribution.byYear;
            chartConfig = {
                type: 'line',
                data: {
                    labels: Object.keys(yearData).sort(),
                    datasets: [{
                        label: '记录数',
                        data: Object.keys(yearData).sort().map(year => yearData[year]),
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `${fieldName} 按年份分布`
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '记录数'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: '年份'
                            }
                        }
                    }
                }
            };
        }

        if (chartConfig) {
            const chart = new Chart(ctx, chartConfig);
            this.charts.push(chart);
        }
    },

    // 创建统计图表
    async createStatisticsChart(fieldName, stats, container) {
        const wrapper = this.createChartWrapper(`${fieldName} - 统计摘要`, container);
        const canvas = wrapper.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        const chartConfig = {
            type: 'bar',
            data: {
                labels: ['最小值', '第一四分位数', '中位数', '平均值', '第三四分位数', '最大值'],
                datasets: [{
                    label: '数值',
                    data: [stats.min, stats.min, stats.median, stats.mean, stats.max, stats.max],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 205, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${fieldName} 统计摘要`
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '数值'
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, chartConfig);
        this.charts.push(chart);
    },

    // 创建相关性热力图
    async createCorrelationChart(correlationData, container) {
        const wrapper = this.createChartWrapper('字段相关性分析', container);
        const canvas = wrapper.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        const correlations = correlationData.correlations;
        const labels = correlations.map(c => `${c.field1} vs ${c.field2}`);
        const values = correlations.map(c => c.correlation);

        const chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '相关系数',
                    data: values,
                    backgroundColor: values.map(v => {
                        const abs = Math.abs(v);
                        if (abs >= 0.8) return 'rgba(255, 99, 132, 0.8)';
                        if (abs >= 0.6) return 'rgba(255, 159, 64, 0.8)';
                        if (abs >= 0.3) return 'rgba(255, 205, 86, 0.8)';
                        return 'rgba(201, 203, 207, 0.8)';
                    }),
                    borderColor: values.map(v => {
                        const abs = Math.abs(v);
                        if (abs >= 0.8) return 'rgba(255, 99, 132, 1)';
                        if (abs >= 0.6) return 'rgba(255, 159, 64, 1)';
                        if (abs >= 0.3) return 'rgba(255, 205, 86, 1)';
                        return 'rgba(201, 203, 207, 1)';
                    }),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '字段间相关性分析'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: -1,
                        max: 1,
                        title: {
                            display: true,
                            text: '相关系数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '字段对'
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, chartConfig);
        this.charts.push(chart);
    },

    // 创建趋势图表
    async createTrendCharts(trendsData, container) {
        trendsData.trends.forEach(trendInfo => {
            if (trendInfo.trend.dataPoints) {
                const wrapper = this.createChartWrapper(`${trendInfo.valueField} 随 ${trendInfo.dateField} 的趋势`, container);
                const canvas = wrapper.querySelector('canvas');
                const ctx = canvas.getContext('2d');

                const trend = trendInfo.trend;
                const chartConfig = {
                    type: 'line',
                    data: {
                        labels: Array.from({length: trend.dataPoints}, (_, i) => `点${i + 1}`),
                        datasets: [{
                            label: trendInfo.valueField,
                            data: [], // 实际数据需要从原始记录中提取
                            borderColor: 'rgba(102, 126, 234, 1)',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            fill: false,
                            tension: 0.1
                        }, {
                            label: '趋势线',
                            data: Array.from({length: trend.dataPoints}, (_, i) => trend.slope * i + trend.intercept),
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            fill: false,
                            borderDash: [5, 5]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `趋势: ${trend.trend} (R² = ${trend.rSquared.toFixed(3)})`
                            }
                        },
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: trendInfo.valueField
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: '时间序列'
                                }
                            }
                        }
                    }
                };

                const chart = new Chart(ctx, chartConfig);
                this.charts.push(chart);
            }
        });
    },

    // 创建图表包装器
    createChartWrapper(title, container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-wrapper';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'chart-title';
        titleElement.textContent = title;
        
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        
        wrapper.appendChild(titleElement);
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);
        
        return wrapper;
    },

    // 生成颜色数组
    generateColors(count) {
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)',
            'rgba(99, 255, 132, 0.8)'
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }
});
