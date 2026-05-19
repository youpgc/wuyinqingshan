import { useEffect, useRef, memo } from 'react';
import * as echarts from 'echarts';

// 迷你趋势柱状图（表格内使用）
export const MiniBarChart = memo(function MiniBarChart({ data, color = '#a855f7', height = 32 }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current, 'dark');
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !data || data.length === 0) return;
    chartInstance.current.setOption({
      backgroundColor: 'transparent',
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: { type: 'category', show: false, data: data.map(d => d.date) },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'bar',
        data: data.map(d => d.visits),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color },
            { offset: 1, color: color + '60' },
          ]),
          borderRadius: [2, 2, 0, 0],
        },
        barWidth: '60%',
      }],
    });
  }, [data, color]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
});

// 饼图
export const PieChart = memo(function PieChart({ data, height = 300 }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current, 'dark');
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !data) return;
    chartInstance.current.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 12 },
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        itemStyle: { borderRadius: 6, borderColor: '#0a0a0f', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
          },
        },
        data: data.map(d => ({
          name: `${d.icon} ${d.name}`,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      }],
    });
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
});
