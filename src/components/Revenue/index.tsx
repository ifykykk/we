import { useEffect, useState, useCallback } from 'react';
import "./Revenue.css"
import Chart from "react-apexcharts"
import { useUser } from '@clerk/clerk-react'
import { ApexOptions } from 'apexcharts'

// Define interfaces for the data structure
interface TaskCompletion {
  date: string;
  completedTasks: number;
  totalTasks: number;
}

interface UserData {
  dailyTaskCompletions?: TaskCompletion[];
  [key: string]: any;
}

const Revenue = () => {
  const { user } = useUser();
  const [data, setData] = useState<UserData>({});
  
  const baseOptions: Partial<ApexOptions> = {
    chart: {
      type: 'area' as const,
      sparkline: { enabled: true }
    },
    tooltip: { theme: 'dark' },
    stroke: { curve: "smooth" }
  };

  const fetchData = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      const response = await fetch(`http://localhost:3000/user/${user.primaryEmailAddress.emailAddress}`, {
        cache: 'no-cache',
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    window.addEventListener('taskUpdated', fetchData);

    return () => {
      window.removeEventListener('taskUpdated', fetchData);
    };
  }, [fetchData]);

  // Generate last 7 days including today
  const generateLast7Days = (): string[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(days[date.getDay()]);
    }
    
    return last7Days;
  };

  // Get completed tasks data for the last 7 days
  const getTaskCompletionData = (): number[] => {
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Find completion data for this date
      const dayData = data.dailyTaskCompletions?.find(
        completion => completion.date.split('T')[0] === dateString
      );
      
      last7Days.push(dayData?.completedTasks || 0);
    }
    
    return last7Days;
  };

  // Get today's task completion percentage
  const getTodayProgress = (): number => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = data.dailyTaskCompletions?.find(
      completion => completion.date.split('T')[0] === today
    );
    
    if (!todayData || todayData.totalTasks === 0) return 0;
    return Math.round((todayData.completedTasks / todayData.totalTasks) * 100);
  };

  const revenue = {
    series: [{
      name: 'Tasks Completed',
      data: getTaskCompletionData()
    }],
    options: {
      ...baseOptions,
      chart: { 
        ...baseOptions.chart, 
        id: 'daily-tasks', 
        sparkline: { enabled: false },
        type: 'area' as const
      },
      title: {
        text: 'Daily Task Progress',
        align: 'left' as const,
        style: {
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--color-text)',
        },
      },
      subtitle: {
        text: `Today: ${getTodayProgress()}% completed`,
        align: 'left' as const,
        style: {
          fontSize: '14px',
          color: 'var(--color-text-muted)',
        },
      },
      grid: {
        show: false,
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return val.toString();
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['var(--color-primary)']
        }
      },
      colors: ['var(--color-success)'],
      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          opacityFrom: 1,
          opacityTo: 0,
          stops: [0, 100],
          colorStops: [
            { offset: 0, opacity: 1, color: "var(--color-success)" },
            { offset: 40, opacity: 0.7, color: "var(--color-success)" },
            { offset: 100, opacity: 0, color: "transparent" }
          ]
        }
      },
      xaxis: {
        categories: generateLast7Days(),
        labels: {
          style: {
            colors: 'var(--color-text)',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Tasks Completed',
          style: {
            color: 'var(--color-text)',
            fontSize: '12px'
          }
        },
        labels: {
          formatter: function (value: number): string {
            return Math.round(value).toString();
          },
          style: {
            colors: 'var(--color-text)',
            fontSize: '12px'
          }
        },
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function(val: number, opts: any) {
            const dayIndex = opts.dataPointIndex;
            const dayName = generateLast7Days()[dayIndex];
            return `${val} tasks completed on ${dayName}`;
          }
        }
      }
    } as ApexOptions,
  };

  return (
    <div className='revenue'>
      <Chart
        series={revenue.series}
        options={revenue.options}
        type="area"
        width={"100%"}
        height={"100%"}
      />
      
      {/* Real-time today indicator */}
      <div className="mt-2 text-center">
        <div className="text-sm text-gray-600">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
          Live tracking for {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
      </div>
    </div>
  )
}

export default Revenue