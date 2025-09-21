import React, { useState, useEffect } from 'react'
import "./Summaries.css"
import Chart from 'react-apexcharts'
import chroma from 'chroma-js'
import { useUser } from '@clerk/clerk-react'
import { LuGlassWater } from "react-icons/lu"
import { FaRunning } from "react-icons/fa"
import { FaBrain } from "react-icons/fa"
import { MdAlarm } from "react-icons/md"
import { X, Check } from 'lucide-react'


// Define interfaces for type safety
interface DataItem {
  value: number;
  date?: string;
}

interface UserData {
  waterIntake?: DataItem[];
  physicalActivity?: DataItem[];
  sleepDuration?: DataItem[];
  meditationDuration?: DataItem[];
}

interface ChartConfig {
  series: { name: string; data: number[] }[];
  options: any;
}

const Summaries = () => {
    const lightPrimaryColor = chroma("blue").alpha(0.1).css();
    const lightSuccessColor = chroma("#33c648").alpha(0.1).css();
    const lightDangerColor = chroma("#ff3b30").alpha(0.1).css();
    const [data, setData] = useState<UserData>({});
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    // Modal states
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [currentValue, setCurrentValue] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Modal configurations
    const modalConfigs = {
        water: {
            title: "💧 Update Water Intake",
            field: "waterIntake",
            placeholder: "Enter glasses of water (e.g., 8)",
            unit: "glasses",
            icon: <LuGlassWater className="w-8 h-8" />,
            color: "#33c648"
        },
        exercise: {
            title: "🏃‍♂️ Update Physical Activity", 
            field: "physicalActivityMinutes",
            placeholder: "Enter minutes of activity (e.g., 30)",
            unit: "minutes",
            icon: <FaRunning className="w-8 h-8" />,
            color: "#ff3b30"
        },
        sleep: {
            title: "😴 Update Sleep Hours",
            field: "sleepHours", 
            placeholder: "Enter hours of sleep (e.g., 7.5)",
            unit: "hours",
            icon: <FaBrain className="w-8 h-8" />,
            color: "#007bff"
        },
        meditation: {
            title: "🧘‍♂️ Update Meditation Time",
            field: "meditationMinutes",
            placeholder: "Enter minutes of meditation (e.g., 15)", 
            unit: "minutes",
            icon: <MdAlarm className="w-8 h-8" />,
            color: "#007bff"
        }
    };

    useEffect(() => {
        const fetchData = async () => {
          if (!user?.primaryEmailAddress?.emailAddress) return;
          
          try {
            const response = await fetch(`http://localhost:3000/user/${user.primaryEmailAddress.emailAddress}`);
            const result = await response.json();
            setData(result);
          } catch (error) {
            console.error('Error:', error);
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchData();
    }, [user]);

    const getLatestValue = (array?: DataItem[]): number => {
        if (!array || array.length === 0) return 0;
        return array[array.length - 1].value;
    };

    const formatChartData = (array?: DataItem[]): number[] => {
        if (!array || array.length === 0) return [0];
        return array.map(item => item.value);
    };

    // Handle icon click to open modal
    const handleIconClick = (modalType: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveModal(modalType);
        setCurrentValue('');
        setShowSuccess(false);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // Only allow numeric input and empty string
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setCurrentValue(value);
        }
    };

    // Handle form submit
    const handleSubmit = async () => {
        if (!currentValue || !activeModal || !user?.primaryEmailAddress?.emailAddress) return;
        
        setIsSubmitting(true);
        
        try {
            // ...existing code...
            const numericValue = parseFloat(currentValue) || 0;
            
            // Prepare data based on modal type
            let submitData: any = {};
            
            if (activeModal === 'water') {
                submitData.waterIntake = numericValue;
            } else if (activeModal === 'exercise') {
                submitData.physicalActivityMinutes = numericValue;
            } else if (activeModal === 'sleep') {
                submitData.sleepHours = numericValue;
            } else if (activeModal === 'meditation') {
                submitData.meditationMinutes = numericValue;
            }

            // Add default values for other fields
            if (activeModal !== 'water') submitData.waterIntake = 0;
            if (activeModal !== 'exercise') submitData.physicalActivityMinutes = 0;
            if (activeModal !== 'sleep') submitData.sleepHours = 0;
            if (activeModal !== 'meditation') submitData.meditationMinutes = 0;

            await fetch(`http://localhost:3000/user/${user.primaryEmailAddress.emailAddress}/daily-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData)
            });

            // Update local state
            const dataKey = activeModal === 'water' ? 'waterIntake' :
                           activeModal === 'exercise' ? 'physicalActivity' :
                           activeModal === 'sleep' ? 'sleepDuration' :
                           'meditationDuration';
            
            setData(prev => ({
                ...prev,
                [dataKey]: [...(prev[dataKey] || []), { value: numericValue, date: new Date().toISOString() }]
            }));

            setShowSuccess(true);
            setTimeout(() => {
                setActiveModal(null);
                setShowSuccess(false);
                setCurrentValue('');
            }, 1500);

        } catch (error) {
            console.error('Error submitting update:', error);
            alert('Failed to submit update. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setCurrentValue('');
        setShowSuccess(false);
    };

    const baseOptions = {
        chart: {
            type: 'area',
            sparkline: { enabled: true }
        },
        tooltip: { theme: 'dark' },
        stroke: { curve: "smooth" }
    };

    const salesChart: ChartConfig = {
        series: [{
            name: 'Water Intake',
            data: formatChartData(data?.waterIntake)
        }],
        options: {
            ...baseOptions,
            chart: { 
                ...baseOptions.chart, 
                id: 'salesChart',
                type: 'area'
            },
            colors: ["var(--color-success)"],
            fill: {
                type: "gradient",
                gradient: {
                    type: "vertical",
                    opacityFrom: 1,
                    opacityTo: 0,
                    stops: [0, 100],
                    colorStops: [
                        { offset: 0, opacity: 0.2, color: "var(--color-success)" },
                        { offset: 100, opacity: 0, color: "transparent" }
                    ]
                }
            }
        }
    };

    const salesLost: ChartConfig = {    
        series: [{
            name: 'Physical Activity',
            data: formatChartData(data?.physicalActivity)
        }],
        options: {
            ...baseOptions,
            chart: { 
                ...baseOptions.chart, 
                id: 'salesLost',
                type: 'area'
            },
            colors: ["var(--color-danger)"],
            fill: {
                type: "gradient",
                gradient: {
                    type: "vertical",
                    opacityFrom: 1,
                    opacityTo: 0,
                    stops: [0, 100],
                    colorStops: [
                        { offset: 0, opacity: 0.2, color: "var(--color-danger)" },
                        { offset: 100, opacity: 0, color: "transparent" }
                    ]
                }
            }
        }
    };

    const ordersChart: ChartConfig = {    
        series: [{
            name: 'Sleep Tracker',
            data: formatChartData(data?.sleepDuration)
        }],
        options: {
            ...baseOptions,
            chart: { 
                ...baseOptions.chart, 
                id: 'ordersChart',
                type: 'area'
            },
            colors: ["var(--color-primary)"],
            fill: {
                type: "gradient",
                gradient: {
                    type: "vertical",
                    opacityFrom: 1,
                    opacityTo: 0,
                    stops: [0, 100],
                    colorStops: [
                        { offset: 0, opacity: 0.7, color: "var(--color-primary)" },
                        { offset: 100, opacity: 0, color: "transparent" }
                    ]
                }
            }
        }
    };

    const newCustomersChart: ChartConfig = {    
        series: [{
            name: 'MindLog',
            data: formatChartData(data?.meditationDuration)
        }],
        options: {
            ...baseOptions,
            chart: { 
                ...baseOptions.chart, 
                id: 'newCustomersChart',
                type: 'area'
            },
            colors: ["var(--color-primary)"],
            fill: {
                type: "gradient",
                gradient: {
                    type: "vertical",
                    opacityFrom: 1,
                    opacityTo: 0,
                    stops: [0, 100],
                    colorStops: [
                        { offset: 0, opacity: 0.5, color: "var(--color-primary-accent)" },
                        { offset: 100, opacity: 0, color: "transparent" }
                    ]
                }
            }
        }
    };

    // Modal Component
    const Modal = () => {
        if (!activeModal) return null;
        
        const config = modalConfigs[activeModal as keyof typeof modalConfigs];

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform transition-all duration-200">
                    {showSuccess ? (
                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Success! 🎉</h3>
                                <p className="text-gray-600">Your update has been saved!</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div 
                                className="p-6 rounded-t-3xl text-white relative overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${config.color}, ${chroma(config.color).darken(0.5).hex()})` }}
                            >
                                <div className="flex justify-between items-start relative">
                                    <div className="flex items-center">
                                        <div className="mr-4">
                                            {config.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{config.title}</h2>
                                            <p className="text-white/80 text-sm">Add today's data</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={closeModal}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter Value ({config.unit})
                                    </label>
                                    <input
                                        type="text"
                                        value={currentValue}
                                        onChange={handleInputChange}
                                        placeholder={config.placeholder}
                                        className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                        autoFocus
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!currentValue || isSubmitting}
                                        className="flex-1 py-3 px-6 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ 
                                            background: currentValue && !isSubmitting 
                                                ? `linear-gradient(135deg, ${config.color}, ${chroma(config.color).darken(0.2).hex()})` 
                                                : '#9ca3af' 
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        ) : (
                                            <Check className="w-5 h-5 mr-2" />
                                        )}
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // Show loading state
    if (isLoading) {
        return <div className='summaries'>Loading...</div>;
    }

    return (
        <>
            <div className='summaries'>
                {/* Water Intake Summary */}
                <div className="summary">
                    <div className="row">
                        <div 
                            className="icon__container clickable-icon"
                            style={{
                                background: lightSuccessColor,
                                color: 'var(--color-success)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                            }}
                            onClick={(e) => handleIconClick('water', e)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                        >
                            <LuGlassWater/>
                        </div>
                        <small></small>
                    </div>
                    <div className="row">
                        <div className="details">
                            <p className="text__muted">Water Intake</p>
                            <h1>{getLatestValue(data?.waterIntake)} Liters</h1>
                        </div>
                        <div className="chart">
                            <Chart
                                series={salesChart.series}
                                options={salesChart.options}
                                width={'100%'}
                                height={60}
                                type='area'
                            />
                        </div>
                    </div>
                </div>

                {/* Physical Activity Summary */}
                <div className="summary">
                    <div className="row">
                        <div 
                            className="icon__container clickable-icon"
                            style={{
                                background: lightDangerColor,
                                color: 'var(--color-danger)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                            }}
                            onClick={(e) => handleIconClick('exercise', e)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                        >
                            <FaRunning/>
                        </div>
                        <small></small>
                    </div>
                    <div className="row">
                        <div className="details">
                            <p className="text__muted">Physical Activity</p>
                            <h1>{getLatestValue(data?.physicalActivity)} minutes</h1>
                        </div>
                        <div className="chart">
                           <Chart
                                series={salesLost.series}
                                options={salesLost.options}
                                width={'100%'}
                                height={60}
                                type='area'
                            />
                        </div>
                    </div>
                </div>

                {/* Sleep Duration Summary */}
                <div className="summary">
                    <div className="row">
                        <div 
                            className="icon__container clickable-icon"
                            style={{
                                background: lightPrimaryColor,
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                            }}
                            onClick={(e) => handleIconClick('sleep', e)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                        >
                            <FaBrain/>
                        </div>
                        <small></small>
                    </div>
                    <div className="row">
                        <div className="details">
                            <p className="text__muted">Sleep Tracker</p>
                            <h1>{getLatestValue(data?.sleepDuration)} hours</h1>
                        </div>
                        <div className="chart">
                            <Chart
                                series={ordersChart.series}
                                options={ordersChart.options}
                                width={'100%'}
                                height={60}
                                type='area'
                            />
                        </div>
                    </div>
                </div>

                {/* Meditation Summary */}
                <div className="summary">
                    <div className="row">
                        <div 
                            className="icon__container clickable-icon"
                            style={{
                                background: lightPrimaryColor,
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                            }}
                            onClick={(e) => handleIconClick('meditation', e)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                        >
                            <MdAlarm/>
                        </div>
                        <small></small>
                    </div>
                    <div className="row">
                        <div className="details">
                            <p className="text__muted">MindLog</p>
                            <h1>{getLatestValue(data?.meditationDuration)} minutes</h1>
                        </div>
                        <div className="chart">
                            <Chart
                                series={newCustomersChart.series}
                                options={newCustomersChart.options}
                                width={'100%'}
                                height={60}
                                type='area'
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal />
        </>
    )
}

export default Summaries