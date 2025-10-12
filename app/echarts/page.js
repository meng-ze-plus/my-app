'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SearchStudent() {
  const [searchValue, setSearchValue] = useState('')
  const [searchType, setSearchType] = useState('id') // 'id' 或 'name'
  const [matchedStudents, setMatchedStudents] = useState([]) // 存储匹配的学生列表（去重后）
  const [selectedStudent, setSelectedStudent] = useState(null) // 选中的学生信息
  const [studentsData, setStudentsData] = useState([]) // 存储选中学生的所有成绩记录
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showStudentList, setShowStudentList] = useState(false) // 控制是否显示学生列表
  const [selectedSubjects, setSelectedSubjects] = useState([]) // 选中的科目
  const [selectedDisplayOptions, setSelectedDisplayOptions] = useState([]) // 选中的显示项目
  const [chartInstance, setChartInstance] = useState(null) // ECharts 实例
  
  const chartRef = useRef(null)
  
  // 科目列表
  const subjects = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "政治", "地理", "总分"]
  
  // 显示项目列表
  const displayOptions = ['得分', '校次', '班次', '联考名次']

  // 查询学生姓名的函数（模糊匹配）
  const searchStudentNames = async () => {
    if (!searchValue.trim()) {
      setError('请输入一个有效的学生姓名')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setMatchedStudents([])
      setSelectedStudent(null)
      setStudentsData([])

      const supabase = createClient()
      
      // 使用 Supabase JS SDK 查询匹配姓名的学生
      const { data, error } = await supabase
        .from('学生成绩数据库')
        .select('*')
        .ilike('姓名', `%${searchValue}%`) // 模糊匹配姓名
        .order('姓名', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        // 按学生去重处理 - 基于姓名、年级和班级
        const uniqueStudents = data.reduce((acc, current) => {
          // 创建唯一标识符：姓名+年级+班级
          //const studentKey = `${current.姓名}-${current.年级}-${current.班级}`;
          
          // 如果这个学生还没有被添加到结果中
          if (!acc.some(student => 
            student.姓名 === current.姓名 && 
            student.年级 === current.年级 && 
            student.班级 === current.班级
          )) {
            // 添加学生信息（只保留基本信息，不需要所有成绩记录）
            acc.push({
              姓名: current.姓名,
              年级: current.年级,
              班级: current.班级,
              // 保存一个ID用于后续查询（使用第一条记录的ID）
              representativeId: current.id
            });
          }
          return acc;
        }, []);
        
        setMatchedStudents(uniqueStudents)
        setShowStudentList(true)
      } else {
        setError('未找到对应姓名的学生')
      }

    } catch (err) {
      console.error('查询失败:', err)
      setError(`查询失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 根据选中的学生查询详细成绩
  const searchStudentDetails = async (student) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedStudent(student)
      setShowStudentList(false)

      const supabase = createClient()
      
      // 查询该学生的所有成绩记录（根据姓名、年级和班级）
      const { data, error } = await supabase
        .from('学生成绩数据库')
        .select("*")
        .eq('姓名', student.姓名)
        .eq('年级', student.年级)
        .eq('班级', student.班级)
        .order('考次', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setStudentsData(data)
        // 初始化选中状态 - 默认选中总分和语文的得分
        setSelectedSubjects(['总分', '语文'])
        setSelectedDisplayOptions(['得分'])
      } else {
        setError('未找到该学生的成绩记录')
      }

    } catch (err) {
      console.error('查询失败:', err)
      setError(`查询失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 根据ID查询学生成绩的函数
  const searchStudentById = async () => {
    if (!searchValue.trim()) {
      setError('请输入一个有效的学生ID')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setMatchedStudents([])
      setSelectedStudent(null)
      setStudentsData([])
      setShowStudentList(false)

      const supabase = createClient()
      
      // 使用 Supabase JS SDK 查询匹配ID的学生成绩
      const { data, error } = await supabase
        .from('学生成绩数据库')
        .select("*")
        .eq('id', searchValue)
        .order('考次', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setStudentsData(data)
        // 设置选中的学生信息（使用第一条记录）
        setSelectedStudent({
          姓名: data[0].姓名,
          年级: data[0].年级,
          班级: data[0].班级
        })
        // 初始化选中状态 - 默认选中总分和语文的得分
        setSelectedSubjects(['总分', '语文'])
        setSelectedDisplayOptions(['得分'])
      } else {
        setError('未找到对应ID的学生记录')
      }

    } catch (err) {
      console.error('查询失败:', err)
      setError(`查询失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 处理科目选择变化
  const handleSubjectChange = (subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  // 处理显示项目选择变化
  const handleDisplayOptionChange = (option) => {
    setSelectedDisplayOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
  }

  // 渲染图表
  useEffect(() => {
    if (!studentsData.length || !selectedSubjects.length || !selectedDisplayOptions.length) return
    
    // 动态导入 ECharts
    const loadECharts = async () => {
      const echarts = await import('echarts')
      return echarts.default || echarts
    }
    
    loadECharts().then(echarts => {
      if (!chartRef.current) return
      
      // 销毁之前的图表实例
      if (chartInstance) {
        chartInstance.dispose()
      }
      
      // 创建新的图表实例
      const myChart = echarts.init(chartRef.current)
      setChartInstance(myChart)
      
      // 生成维度数组
      const resultArray = selectedSubjects.flatMap(subject =>
        selectedDisplayOptions.map(option => `${subject}_${option}`)
      )
      
      let updatedDimensions = [...resultArray]
      updatedDimensions.unshift('考次')
      
      // 准备数据源
      const source = studentsData.map(item => {
        const row = { 考次: item.考次 }
        selectedSubjects.forEach(subject => {
          selectedDisplayOptions.forEach(option => {
            const key = `${subject}_${option}`
            row[key] = item[key]
          })
        })
        return row
      })
      
      // 配置图表选项
      const option = {
        title: {
          text: `${selectedStudent.姓名} - 成绩趋势图`,
          top: 10,
          left: 10,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: updatedDimensions,
          top: 'top'
        },
        toolbox: {
          show: true,
          orient: 'horizontal',
          left: 'right',
          top: 'top',
          feature: {
            saveAsImage: { show: true }
          }
        },
        dataset: {
          dimensions: updatedDimensions,
          source: source
        },
        dataZoom: [{
          type: 'slider',
          start: 0,
          end: 100
        }],
        series: (function () {
          var series = []
          for (let i = 1; i < updatedDimensions.length; i++) {
            var sname = updatedDimensions[i]
            // 如果是排名相关的数据，使用折线图和右侧y轴
            if (sname.includes("次") || sname.includes("名次")) {
              series.push({
                name: sname,
                type: 'line',
                barGap: 0,
                barWidth: 20,
                emphasis: { focus: 'series' },
                yAxisIndex: 1,
                label: {
                  show: true,
                  position: "top",
                  formatter: function (params) {
                    return `${params.seriesName}: ${params.value[sname]}`
                  }
                }
              })
            } else {
              // 得分数据使用柱状图和左侧y轴
              series.push({
                name: sname,
                type: 'bar',
                emphasis: { focus: 'series' },
                yAxisIndex: 0,
                label: {
                  show: true,
                  position: "insideTop",
                  formatter: function (params) {
                    return `${params.seriesName}: ${params.value[sname]}`
                  }
                }
              })
            }
          }
          return series
        })(),
        xAxis: { 
          type: 'category',
          name: '考次'
        },
        yAxis: [
          {
            name: '得分',
            type: 'value',
            inverse: false,
            nameLocation: 'end',
          },
          {
            name: '排名',
            type: 'value',
            inverse: true, // 排名数字越小越靠前，所以需要逆序
            nameLocation: 'start',
          }
        ],
      }
      
      myChart.setOption(option)
      
      // 响应窗口大小变化
      const handleResize = () => {
        myChart.resize()
      }
      window.addEventListener('resize', handleResize)
      
      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    })
  }, [studentsData, selectedSubjects, selectedDisplayOptions, selectedStudent])

  // 处理输入框变化
  const handleInputChange = (e) => {
    setSearchValue(e.target.value)
  }

  // 处理查询类型变化
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value)
    setSearchValue('')
    setStudentsData([])
    setMatchedStudents([])
    setSelectedStudent(null)
    setShowStudentList(false)
    setError(null)
    setSelectedSubjects([])
    setSelectedDisplayOptions([])
  }

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchType === 'id') {
      searchStudentById()
    } else {
      searchStudentNames()
    }
  }

  // 处理选择学生
  const handleSelectStudent = (student) => {
    searchStudentDetails(student)
  }

  // 返回搜索界面
  const handleBackToSearch = () => {
    setSelectedStudent(null)
    setStudentsData([])
    setMatchedStudents([])
    setShowStudentList(false)
    setSelectedSubjects([])
    setSelectedDisplayOptions([])
  }

  // 返回学生列表
  const handleBackToStudentList = () => {
    setSelectedStudent(null)
    setStudentsData([])
    setShowStudentList(true)
    setSelectedSubjects([])
    setSelectedDisplayOptions([])
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>学生成绩查询系统</h1>
      
      {/* 只有当没有选中学生或显示学生列表时才显示搜索界面 */}
      {(!selectedStudent || showStudentList) && (
        <>
          {/* 查询条件选择 */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <label style={{ marginRight: '15px' }}>
              <input
                type="radio"
                value="id"
                checked={searchType === 'id'}
                onChange={handleSearchTypeChange}
                style={{ marginRight: '5px' }}
              />
              按学号查询
            </label>
            <label>
              <input
                type="radio"
                value="name"
                checked={searchType === 'name'}
                onChange={handleSearchTypeChange}
                style={{ marginRight: '5px' }}
              />
              按姓名查询
            </label>
          </div>
          
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={searchValue}
                onChange={handleInputChange}
                placeholder={searchType === 'id' ? "输入学生ID" : "输入学生姓名"}
                style={{ 
                  flexGrow: 1, 
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: loading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* 显示错误信息 */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* 显示匹配的学生列表 */}
      {showStudentList && matchedStudents.length > 0 && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
            找到 {matchedStudents.length} 位匹配的学生，请选择：
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '10px' 
          }}>
            {matchedStudents.map((student, index) => (
              <div 
                key={`${student.姓名}-${student.年级}-${student.班级}-${index}`}
                style={{ 
                  padding: '15px', 
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSelectStudent(student)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0f8ff';
                  e.target.style.borderColor = '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {student.姓名}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {student.年级} {student.班级}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 显示查询结果 - 选中学生的所有成绩记录 */}
      {selectedStudent && studentsData.length > 0 && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}>
          {/* 返回按钮 */}
          <button 
            onClick={searchType === 'name' ? handleBackToStudentList : handleBackToSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '15px'
            }}
          >
            ← 返回{searchType === 'name' ? '学生列表' : '搜索'}
          </button>
          
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
            {selectedStudent.姓名} 的成绩记录 - 共 {studentsData.length} 次考试
          </h3>
          
          {/* 学生基本信息 */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{selectedStudent.姓名}</h4>
                <p style={{ margin: '0', color: '#666' }}>
                  <strong>年级:</strong> {selectedStudent.年级} | 
                  <strong> 班级:</strong> {selectedStudent.班级}
                </p>
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                共 {studentsData.length} 次考试
              </div>
            </div>
          </div>
          
          {/* 图表配置区域 */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ marginBottom: '15px' }}>图表配置</h4>
            
            {/* 科目选择 */}
            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ marginBottom: '10px' }}>选择科目:</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {subjects.map(subject => (
                  <label key={subject} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                      style={{ marginRight: '5px' }}
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>
            
            {/* 显示项目选择 */}
            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ marginBottom: '10px' }}>选择显示项目:</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {displayOptions.map(option => (
                  <label key={option} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedDisplayOptions.includes(option)}
                      onChange={() => handleDisplayOptionChange(option)}
                      style={{ marginRight: '5px' }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* 图表容器 */}
          <div 
            ref={chartRef}
            style={{ 
              width: '100%', 
              height: '400px',
              marginBottom: '20px'
            }}
          />
          
          {/* 考试记录列表 */}
          <div>
            {studentsData.map((record, index) => (
              <div key={index} style={{ 
                marginBottom: '15px', 
                padding: '15px', 
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  marginBottom: '10px', 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h5 style={{ margin: 0 }}>考试名称： {record.考次} </h5>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    总分: <strong>{record.总分_得分}</strong> (原始分: {record.总分_原始分})
                  </div>
                </div>
                
                {/* 排名信息 */}
                <div style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  <div>
                    <strong>校次:</strong> {record.总分_校次}
                  </div>
                  <div>
                    <strong>班次:</strong> {record.总分_班次}
                  </div>
                  <div>
                    <strong>联考名次:</strong> {record.总分_联考名次}
                  </div>
                </div>
                
                {/* 各科成绩 */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '10px' 
                }}>
                  {/* 语文 */}
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    fontSize: '0.9em',
                    borderLeft: '4px solid #3498db'
                  }}>
                    <strong style={{ color: '#3498db' }}>语文</strong>
                    <div style={{ marginTop: '5px' }}>
                      <div>得分: {record.语文_得分}</div>
                      <div>原始分: {record.语文_原始分}</div>
                      <div>校次: {record.语文_校次}</div>
                      <div>班次: {record.语文_班次}</div>
                    </div>
                  </div>
                  
                  {/* 数学 */}
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    fontSize: '0.9em',
                    borderLeft: '4px solid #e74c3c'
                  }}>
                    <strong style={{ color: '#e74c3c' }}>数学</strong>
                    <div style={{ marginTop: '5px' }}>
                      <div>得分: {record.数学_得分}</div>
                      <div>原始分: {record.数学_原始分}</div>
                      <div>校次: {record.数学_校次}</div>
                      <div>班次: {record.数学_班次}</div>
                    </div>
                  </div>
                  
                  {/* 英语 */}
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    fontSize: '0.9em',
                    borderLeft: '4px solid #2ecc71'
                  }}>
                    <strong style={{ color: '#2ecc71' }}>英语</strong>
                    <div style={{ marginTop: '5px' }}>
                      <div>得分: {record.英语_得分}</div>
                      <div>原始分: {record.英语_原始分}</div>
                      <div>校次: {record.英语_校次}</div>
                      <div>班次: {record.英语_班次}</div>
                    </div>
                  </div>
                  
                  {/* 物理 */}
                  {record.物理_原始分 && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px', 
                      fontSize: '0.9em',
                      borderLeft: '4px solid #9b59b6'
                    }}>
                      <strong style={{ color: '#9b59b6' }}>物理</strong>
                      <div style={{ marginTop: '5px' }}>
                        <div>得分: {record.物理_得分}</div>
                        <div>原始分: {record.物理_原始分}</div>
                        <div>校次: {record.物理_校次}</div>
                        <div>班次: {record.物理_班次}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* 化学 */}
                  {record.化学_原始分 && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px', 
                      fontSize: '0.9em',
                      borderLeft: '4px solid #f39c12'
                    }}>
                      <strong style={{ color: '#f39c12' }}>化学</strong>
                      <div style={{ marginTop: '5px' }}>
                        <div>得分: {record.化学_得分}</div>
                        <div>原始分: {record.化学_原始分}</div>
                        <div>校次: {record.化学_校次}</div>
                        <div>班次: {record.化学_班次}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* 生物 */}
                  {record.生物_原始分 && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px', 
                      fontSize: '0.9em',
                      borderLeft: '4px solid #1abc9c'
                    }}>
                      <strong style={{ color: '#1abc9c' }}>生物</strong>
                      <div style={{ marginTop: '5px' }}>
                        <div>得分: {record.生物_得分}</div>
                        <div>原始分: {record.生物_原始分}</div>
                        <div>校次: {record.生物_校次}</div>
                        <div>班次: {record.生物_班次}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* 历史 */}
                  {record.历史_原始分 && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px', 
                      fontSize: '0.9em',
                      borderLeft: '4px solid #d35400'
                    }}>
                      <strong style={{ color: '#d35400' }}>历史</strong>
                      <div style={{ marginTop: '5px' }}>
                        <div>得分: {record.历史_得分}</div>
                        <div>原始分: {record.历史_原始分}</div>
                        <div>校次: {record.历史_校次}</div>
                        <div>班次: {record.历史_班次}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* 政治 */}
                  {record.政治_原始分 && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px', 
                      fontSize: '0.9em',
                      borderLeft: '4px solid #7f8c8d'
                    }}>
                      <strong style={{ color: '#7f8c8d' }}>政治</strong>
                      <div style={{ marginTop: '5px' }}>
                        <div>得分: {record.政治_得分}</div>
                        <div>原始分: {record.政治_原始分}</div>
                        <div>校次: {record.政治_校次}</div>
                        <div>班次: {record.政治_班次}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* 地理 */}
                  {record.地理_原始分 && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px', 
                      fontSize: '0.9em',
                      borderLeft: '4px solid #34495e'
                    }}>
                      <strong style={{ color: '#34495e' }}>地理</strong>
                      <div style={{ marginTop: '5px' }}>
                        <div>得分: {record.地理_得分}</div>
                        <div>原始分: {record.地理_原始分}</div>
                        <div>校次: {record.地理_校次}</div>
                        <div>班次: {record.地理_班次}</div>
                      </div>
                    </div>
                  )}
                  {/* 其他科目... */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
