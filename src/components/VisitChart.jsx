import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { BarChart3, LineChart, Calendar } from 'lucide-react';

export default function VisitChart({ data, title = '访问统计' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartType, setChartType] = useState('bar');
  const [dateRange, setDateRange] = useState('7'); // 7, 30, 90 days

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current, 'dark');

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !data) return;

    // 处理数据
    const processedData = processData(data, dateRange);

    const option = {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#fff',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: processedData.labels,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
      series: [
        {
          name: '访问量',
          type: chartType,
          data: processedData.values,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#a855f7' },
              { offset: 1, color: '#ec4899' },
            ]),
            borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
          },
          lineStyle: {
            color: '#a855f7',
            width: 3,
          },
          areaStyle: chartType === 'line' ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(168, 85, 247, 0.3)' },
              { offset: 1, color: 'rgba(168, 85, 247, 0)' },
            ]),
          } : undefined,
          smooth: chartType === 'line',
        },
      ],
    };

    chartInstance.current.setOption(option);
  }, [data, chartType, dateRange, title]);

  const processData = (rawData, range) => {
    // 如果没有数据，生成模拟数据
    if (!rawData || rawData.length === 0) {
      const labels = [];
      const values = [];
      const days = parseInt(range);
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
        values.push(Math.floor(Math.random() * 100) + 50);
      }
      return { labels, values };
    }

    // 处理真实数据
    const grouped = {};
    const days = parseInt(range);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // 初始化所有日期为0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toISOString().split('T')[0];
      grouped[key] = 0;
    }

    // 统计访问量
    rawData.forEach(item => {
      const date = new Date(item.created_at);
      if (date >= startDate && date <= endDate) {
        const key = date.toISOString().split('T')[0];
        grouped[key] = (grouped[key] || 0) + 1;
      }
    });

    const sortedKeys = Object.keys(grouped).sort();
    return {
      labels: sortedKeys.map(k => {
        const date = new Date(k);
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      }),
      values: sortedKeys.map(k => grouped[k]),
    };
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      {/* 控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        <div className="flex items-center gap-4">
          {/* 日期范围选择 */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            <Calendar className="w-4 h-4 text-white/60 ml-2" />
            {[
              { value: '7', label: '7天' },
              { value: '30', label: '30天' },
              { value: '90', label: '90天' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  dateRange === option.value
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* 图表类型切换 */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'bar'
                  ? 'bg-purple-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="柱状图"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-purple-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="折线图"
            >
              <LineChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 图表容器 */}
      <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
}
