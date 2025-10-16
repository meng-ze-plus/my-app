'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'

// 定义类型
interface Student {
  姓名: string;
  年级: string;
  班级: string;
  representativeId?: string | number;
}

interface StudentRecord {
  考次: string;
  总分_得分: number;
  总分_原始分: number;
  总分_校次: number;
  总分_班次: number;
  总分_联考名次: number;
  语文_得分?: number;
  语文_原始分?: number;
  语文_校次?: number;
  语文_班次?: number;
  数学_得分?: number;
  数学_原始分?: number;
  数学_校次?: number;
  数学_班次?: number;
  英语_得分?: number;
  英语_原始分?: number;
  英语_校次?: number;
  英语_班次?: number;
  物理_得分?: number;
  物理_原始分?: number;
  物理_校次?: number;
  物理_班次?: number;
  化学_得分?: number;
  化学_原始分?: number;
  化学_校次?: number;
  化学_班次?: number;
  生物_得分?: number;
  生物_原始分?: number;
  生物_校次?: number;
  生物_班次?: number;
  历史_得分?: number;
  历史_原始分?: number;
  历史_校次?: number;
  历史_班次?: number;
  政治_得分?: number;
  政治_原始分?: number;
  政治_校次?: number;
  政治_班次?: number;
  地理_得分?: number;
  地理_原始分?: number;
  地理_校次?: number;
  地理_班次?: number;
  [key: string]: any;
}

export default function SearchStudent() {
  const [searchValue, setSearchValue] = useState('')
  const [searchType, setSearchType] = useState('id')
  const [matchedStudents, setMatchedStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentsData, setStudentsData] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStudentList, setShowStudentList] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedDisplayOptions, setSelectedDisplayOptions] = useState<string[]>([])
  const [chartInstance, setChartInstance] = useState<any>(null)

  const { theme } = useTheme()
  const chartRef = useRef<HTMLDivElement>(null)

  const subjects = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "政治", "地理", "总分"]
  const displayOptions = ['得分', '校次', '班次', '联考名次']

  // 获取基于主题的图表颜色配置 - 使用 useCallback 避免不必要的重新创建
  const getChartColors = useCallback(() => {
    if (theme === 'dark') {
      return {
        backgroundColor: '#1e1e1e',
        textColor: '#ffffff',
        gridColor: '#2a2a2a',
        axisLineColor: '#555555',
        seriesColors: [
          '#5470c6', '#91cc75', '#fac858', '#ee6666',
          '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
          '#ea7ccc'
        ]
      }
    } else {
      return {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        gridColor: '#f0f0f0',
        axisLineColor: '#cccccc',
        seriesColors: [
          '#5470c6', '#91cc75', '#fac858', '#ee6666',
          '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
          '#ea7ccc'
        ]
      }
    }
  }, [theme])

  // 查询学生姓名的函数
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

      const { data, error: supabaseError } = await supabase
        .from('学生成绩数据库')
        .select('*')
        .ilike('姓名', `%${searchValue}%`)
        .order('姓名', { ascending: true })

      if (supabaseError) throw supabaseError

      if (data && data.length > 0) {
        const uniqueStudents = data.reduce<Student[]>((acc, current) => {
          if (!acc.some((student: Student) =>
            student.姓名 === current.姓名 &&
            student.年级 === current.年级 &&
            student.班级 === current.班级
          )) {
            acc.push({
              姓名: current.姓名,
              年级: current.年级,
              班级: current.班级,
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
      setError(`查询失败: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // 根据选中的学生查询详细成绩
  const searchStudentDetails = async (student: Student) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedStudent(student)
      setShowStudentList(false)

      const supabase = createClient()

      const { data, error: supabaseError } = await supabase
        .from('学生成绩数据库')
        .select("*")
        .eq('姓名', student.姓名)
        .eq('年级', student.年级)
        .eq('班级', student.班级)
        .order('考次', { ascending: true })

      if (supabaseError) throw supabaseError

      if (data && data.length > 0) {
        setStudentsData(data as StudentRecord[])
        setSelectedSubjects(['总分', '语文'])
        setSelectedDisplayOptions(['得分'])
      } else {
        setError('未找到该学生的成绩记录')
      }

    } catch (err) {
      console.error('查询失败:', err)
      setError(`查询失败: ${err instanceof Error ? err.message : String(err)}`)
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

      const { data, error: supabaseError } = await supabase
        .from('学生成绩数据库')
        .select("*")
        .eq('id', searchValue)
        .order('考次', { ascending: true })

      if (supabaseError) throw supabaseError

      if (data && data.length > 0) {
        setStudentsData(data as StudentRecord[])
        setSelectedStudent({
          姓名: data[0].姓名,
          年级: data[0].年级,
          班级: data[0].班级
        })
        setSelectedSubjects(['总分', '语文'])
        setSelectedDisplayOptions(['得分'])
      } else {
        setError('未找到对应ID的学生记录')
      }

    } catch (err) {
      console.error('查询失败:', err)
      setError(`查询失败: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // 处理科目选择变化
  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  // 处理显示项目选择变化
  const handleDisplayOptionChange = (option: string) => {
    setSelectedDisplayOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
  }

  // 渲染图表
  useEffect(() => {
    if (!studentsData.length || !selectedSubjects.length || !selectedDisplayOptions.length) return

    const loadECharts = async () => {
      const echarts = await import('echarts')
      return echarts.default || echarts
    }

    loadECharts().then(echarts => {
      if (!chartRef.current) return

      if (chartInstance) {
        chartInstance.dispose()
      }

      const myChart = echarts.init(chartRef.current, theme === 'dark' ? 'dark' : null)
      setChartInstance(myChart)

      const colors = getChartColors()
      const resultArray = selectedSubjects.flatMap(subject =>
        selectedDisplayOptions.map(option => `${subject}_${option}`)
      )

      const updatedDimensions = [...resultArray]
      updatedDimensions.unshift('考次')

      const source = studentsData.map(item => {
        const row: Record<string, any> = { 考次: item.考次 }
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
        backgroundColor: colors.backgroundColor,
        title: {
          text: `${selectedStudent?.姓名} - 成绩趋势图`,
          top: 10,
          left: 10,
          textStyle: {
            color: colors.textColor
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: colors.backgroundColor,
          borderColor: colors.axisLineColor,
          textStyle: {
            color: colors.textColor
          }
        },
        legend: {
          data: updatedDimensions,
          top: 'top',
          textStyle: {
            color: colors.textColor
          }
        },
        toolbox: {
          show: true,
          orient: 'horizontal',
          left: 'right',
          top: 'top',
          feature: {
            saveAsImage: {
              show: true,
              backgroundColor: colors.backgroundColor
            }
          }
        },
        dataset: {
          dimensions: updatedDimensions,
          source: source
        },
        dataZoom: [{
          type: 'slider',
          start: 0,
          end: 100,
          textStyle: {
            color: colors.textColor
          }
        }],
        series: (function () {
          const series: any[] = []
          for (let i = 1; i < updatedDimensions.length; i++) {
            const dimensionName = updatedDimensions[i];
            const colorIndex = (i - 1) % colors.seriesColors.length;

            // 如果是排名相关的数据，使用折线图和右侧y轴
            if (dimensionName.includes("次") || dimensionName.includes("名次")) {
              series.push({
                name: dimensionName,
                type: 'line',
                barGap: 0,
                barWidth: 20,
                emphasis: { focus: 'series' },
                yAxisIndex: 1,
                lineStyle: {
                  color: colors.seriesColors[colorIndex]
                },
                itemStyle: {
                  color: colors.seriesColors[colorIndex]
                },
                label: {
                  show: true,
                  position: "top",
                  color: colors.textColor,
                  textBorderColor: theme === 'dark' ? '#000' : '#fff',
                  textBorderWidth: 2,
                  formatter: function (params: any) {
                    const value = params.data[dimensionName];
                    return `${params.seriesName}: ${value}`;
                  }
                }
              })
            } else {
              // 得分数据使用柱状图和左侧y轴
              series.push({
                name: dimensionName,
                type: 'bar',
                emphasis: { focus: 'series' },
                yAxisIndex: 0,
                itemStyle: {
                  color: colors.seriesColors[colorIndex]
                },
                label: {
                  show: true,
                  position: "insideTop",
                  color: colors.textColor,
                  textBorderColor: theme === 'dark' ? '#000' : '#fff',
                  textBorderWidth: 2,
                  formatter: function (params: any) {
                    const value = params.data[dimensionName];
                    return `${params.seriesName}: ${value}`;
                  }
                }
              })
            }
          }
          return series
        })(),
        xAxis: {
          type: 'category',
          name: '考次',
          nameTextStyle: {
            color: colors.textColor
          },
          axisLine: {
            lineStyle: {
              color: colors.axisLineColor
            }
          },
          axisLabel: {
            color: colors.textColor
          }
        },
        yAxis: [
          {
            name: '得分',
            type: 'value',
            inverse: false,
            nameLocation: 'end',
            nameTextStyle: {
              color: colors.textColor
            },
            axisLine: {
              lineStyle: {
                color: colors.axisLineColor
              }
            },
            axisLabel: {
              color: colors.textColor
            },
            splitLine: {
              lineStyle: {
                color: colors.gridColor,
                type: 'dashed'
              }
            }
          },
          {
            name: '排名',
            type: 'value',
            inverse: true,
            nameLocation: 'start',
            nameTextStyle: {
              color: colors.textColor
            },
            axisLine: {
              lineStyle: {
                color: colors.axisLineColor
              }
            },
            axisLabel: {
              color: colors.textColor
            },
            splitLine: {
              lineStyle: {
                color: colors.gridColor,
                type: 'dashed'
              }
            }
          }
        ],
        grid: {
          backgroundColor: colors.backgroundColor
        }
      }

      myChart.setOption(option)

      const handleResize = () => {
        myChart.resize()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    })
  }, [studentsData, selectedSubjects, selectedDisplayOptions, selectedStudent, theme, chartInstance, getChartColors])

  // 其他函数保持不变...
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const handleSearchTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchType === 'id') {
      searchStudentById()
    } else {
      searchStudentNames()
    }
  }

  const handleSelectStudent = (student: Student) => {
    searchStudentDetails(student)
  }

  const handleBackToSearch = () => {
    setSelectedStudent(null)
    setStudentsData([])
    setMatchedStudents([])
    setShowStudentList(false)
    setSelectedSubjects([])
    setSelectedDisplayOptions([])
  }

  const handleBackToStudentList = () => {
    setSelectedStudent(null)
    setStudentsData([])
    setShowStudentList(true)
    setSelectedSubjects([])
    setSelectedDisplayOptions([])
  }

  return (
    <div className="w-full">
      <h1 className="text-center mb-8 text-3xl font-bold dark:text-white">学生成绩查询系统</h1>

      {/* 只有当没有选中学生或显示学生列表时才显示搜索界面 */}
      {(!selectedStudent || showStudentList) && (
        <>
          {/* 查询条件选择 */}
          <div className="mb-5 text-center dark:text-white">
            <label className="mr-4">
              <input
                type="radio"
                value="id"
                checked={searchType === 'id'}
                onChange={handleSearchTypeChange}
                className="mr-2"
              />
              按学号查询
            </label>
            <label>
              <input
                type="radio"
                value="name"
                checked={searchType === 'name'}
                onChange={handleSearchTypeChange}
                className="mr-2"
              />
              按姓名查询
            </label>
          </div>

          <form onSubmit={handleSubmit} className="mb-5">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchValue}
                onChange={handleInputChange}
                placeholder={searchType === 'id' ? "输入学生ID" : "输入学生姓名"}
                className="flex-grow p-3 border border-gray-300 rounded-lg text-base dark:bg-gray-800 dark:text-white dark:border-gray-700"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-black dark:bg-gray-700 text-white border-none rounded-lg cursor-pointer text-base disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* 显示错误信息 */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-lg mb-5">
          {error}
        </div>
      )}

      {/* 显示匹配的学生列表 */}
      {showStudentList && matchedStudents.length > 0 && (
        <div className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-center mb-5 text-xl dark:text-white">
            找到 {matchedStudents.length} 位匹配的学生，请选择：
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {matchedStudents.map((student, index) => (
              <div
                key={`${student.姓名}-${student.年级}-${student.班级}-${index}`}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer text-center transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-500"
                onClick={() => handleSelectStudent(student)}
              >
                <div className="text-lg font-bold mb-2 dark:text-white">
                  {student.姓名}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {student.年级} {student.班级}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 显示查询结果 - 选中学生的所有成绩记录 */}
      {selectedStudent && studentsData.length > 0 && (
        <div className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          {/* 返回按钮 */}
          <button
            onClick={searchType === 'name' ? handleBackToStudentList : handleBackToSearch}
            className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white border-none rounded-lg cursor-pointer text-sm mb-4"
          >
            ← 返回{searchType === 'name' ? '学生列表' : '搜索'}
          </button>

          <h3 className="text-center mb-5 text-xl dark:text-white">
            {selectedStudent.姓名} 的成绩记录 - 共 {studentsData.length} 次考试
          </h3>

          {/* 学生基本信息 */}
          <div className="mb-5 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="m-0 mb-1 text-lg dark:text-white">{selectedStudent.姓名}</h4>
                <p className="m-0 text-gray-600 dark:text-gray-300">
                  <strong>年级:</strong> {selectedStudent.年级} |
                  <strong> 班级:</strong> {selectedStudent.班级}
                </p>
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                共 {studentsData.length} 次考试
              </div>
            </div>
          </div>

          {/* 图表配置区域 */}
          <div className="mb-5 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h4 className="mb-4 text-lg dark:text-white">图表配置</h4>

            {/* 科目选择 */}
            <div className="mb-4">
              <h5 className="mb-2 font-medium dark:text-white">选择科目:</h5>
              <div className="flex flex-wrap gap-3">
                {subjects.map(subject => (
                  <label key={subject} className="flex items-center cursor-pointer dark:text-white">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                      className="mr-2"
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>

            {/* 显示项目选择 */}
            <div className="mb-4">
              <h5 className="mb-2 font-medium dark:text-white">选择显示项目:</h5>
              <div className="flex flex-wrap gap-3">
                {displayOptions.map(option => (
                  <label key={option} className="flex items-center cursor-pointer dark:text-white">
                    <input
                      type="checkbox"
                      checked={selectedDisplayOptions.includes(option)}
                      onChange={() => handleDisplayOptionChange(option)}
                      className="mr-2"
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
            className="w-full h-96 mb-5"
          />

          {/* 考试记录列表 */}
          <div>
            {studentsData.map((record, index) => (
              <div key={index} className="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="mb-3 flex justify-between items-center">
                  <h5 className="m-0 text-lg dark:text-white">考试名称： {record.考次} </h5>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    总分: <strong>{record.总分_得分}</strong> (原始分: {record.总分_原始分})
                  </div>
                </div>

                {/* 排名信息 */}
                <div className="flex gap-4 mb-4 text-sm dark:text-white">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {['语文', '数学', '英语', '物理', '化学', '生物', '历史', '政治', '地理'].map((subject, idx) => (
                    record[`${subject}_原始分`] && (
                      <div
                        key={subject}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm border-l-4 dark:text-white"
                        style={{ borderLeftColor: getChartColors().seriesColors[idx % getChartColors().seriesColors.length] }}
                      >
                        <strong style={{ color: getChartColors().seriesColors[idx % getChartColors().seriesColors.length] }}>
                          {subject}
                        </strong>
                        <div className="mt-2">
                          <div>得分: {record[`${subject}_得分`]}</div>
                          <div>原始分: {record[`${subject}_原始分`]}</div>
                          <div>校次: {record[`${subject}_校次`]}</div>
                          <div>班次: {record[`${subject}_班次`]}</div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}