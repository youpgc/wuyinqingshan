import { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';

export function usePagination(data = [], defaultPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');

  // 过滤和排序数据
  const filteredData = useMemo(() => {
    let result = [...data];

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(term)
        )
      );
    }

    // 排序
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortField, sortDirection]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  // 总页数
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // 导出Excel
  const exportToExcel = useCallback((filename = 'data', columns = null) => {
    const exportData = filteredData.map(item => {
      if (columns) {
        const row = {};
        columns.forEach(col => {
          row[col.header] = col.formatter ? col.formatter(item[col.key]) : item[col.key];
        });
        return row;
      }
      return item;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredData]);

  // 处理排序
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  }, [sortField]);

  // 重置分页
  const reset = useCallback(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setSortField(null);
    setSortDirection('desc');
  }, []);

  return {
    // 数据
    data: paginatedData,
    allData: filteredData,
    totalCount: filteredData.length,
    
    // 分页状态
    currentPage,
    pageSize,
    totalPages,
    
    // 搜索和排序
    searchTerm,
    sortField,
    sortDirection,
    
    // 操作方法
    setCurrentPage,
    setPageSize,
    setSearchTerm,
    handleSort,
    exportToExcel,
    reset,
    
    // 分页选项
    pageSizeOptions: [10, 20, 30, 50, 100],
  };
}
