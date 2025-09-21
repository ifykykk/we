import { useState, useRef, useEffect } from 'react'
import Logo from './Logo'
import { Menu, Search, Settings, Sun, Moon, Eye, RotateCcw } from 'lucide-react'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
interface INavbar{
    onMenuClick: any ;
}

const Navbar = ({onMenuClick}:INavbar) => {
    const [focus,setFocus] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const settingsRef = useRef<HTMLDivElement>(null)
    const {
        theme,
        textSize,
        fontType,
        contrastMode,
        toggleTheme,
        setTextSize,
        setFontType,
        setContrastMode,
        resetToDefaults
    } = useTheme()

    // Close settings dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Initialize GTranslate
    useEffect(() => {
        // Configure GTranslate settings
        (window as any).gtranslateSettings = {
            "default_language": "en",
            "detect_browser_language": true,
            "languages": [
                "en", "hi", "bn", "te", "mr", "ta", "gu", "kn", "ml", "pa", "or", "as", "ne",
                "fr", "es", "de", "it", "pt", "ru", "ja", "ko", "zh-CN", "ar"
            ],
            "wrapper_selector": ".gtranslate_wrapper",
            "flag_size": 16,
            "flag_style": "3d",
            "alt_flags": {
                "en": "usa",
                "pt": "brazil"
            },
            "switcher_horizontal_position": "inline",
            "switcher_text_color": "#3b82f6",
            "switcher_arrow_color": "#3b82f6",
            "switcher_border_color": "#e5e7eb",
            "switcher_background_color": "#ffffff",
            "switcher_background_shadow_color": "rgba(0,0,0,0.1)",
            "switcher_background_hover_color": "#f3f4f6",
            "dropdown_background_color": "#ffffff",
            "dropdown_hover_color": "#f3f4f6",
            "dropdown_text_color": "#111827",
            "switcher_type": "dropdown"
        };

        // Load GTranslate script if not already loaded
        const existingScript = document.querySelector('script[src*="gtranslate.net"]');
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://cdn.gtranslate.net/widgets/latest/float.js';
            script.defer = true;
            script.async = true;
            document.head.appendChild(script);
        }

        // Add custom styles for GTranslate
        const style = document.createElement('style');
        style.textContent = `
            .gtranslate_wrapper {
                display: inline-block !important;
                vertical-align: middle !important;
                position: relative !important;
                z-index: 1000 !important;
            }
            
            /* Hide the default GTranslate elements that create the vertical list */
            .gtranslate_wrapper .goog-te-gadget,
            .gtranslate_wrapper .goog-te-gadget-simple,
            .gtranslate_wrapper .goog-te-menu-value,
            .gtranslate_wrapper .goog-te-menu-value span {
                display: none !important;
            }
            
            /* Style the select element to look like a proper dropdown */
            .gtranslate_wrapper select {
                appearance: none !important;
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                border: 1px solid #e2e8f0 !important;
                border-radius: 8px !important;
                padding: 8px 12px !important;
                padding-right: 32px !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                background: white !important;
                color: #334155 !important;
                cursor: pointer !important;
                outline: none !important;
                min-width: 120px !important;
                max-width: 150px !important;
                transition: all 0.2s ease !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
                background-repeat: no-repeat !important;
                background-position: right 8px center !important;
                background-size: 14px !important;
                font-family: inherit !important;
            }
            
            .gtranslate_wrapper select:hover {
                border-color: #3b82f6 !important;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15) !important;
                background: #f8fafc !important;
            }
            
            .gtranslate_wrapper select:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
                background: #f8fafc !important;
            }
            
            .gtranslate_wrapper select:active {
                transform: none !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
            }
            
            .gtranslate_wrapper option {
                padding: 8px 12px !important;
                background: white !important;
                color: #334155 !important;
                font-weight: 500 !important;
                border: none !important;
                font-size: 14px !important;
            }
            
            .gtranslate_wrapper option:hover {
                background: #f1f5f9 !important;
                color: #1e293b !important;
            }
            
            .gtranslate_wrapper option:checked {
                background: #3b82f6 !important;
                color: white !important;
            }
            
            /* Custom dropdown styling for better appearance */
            .gtranslate_wrapper select::-ms-expand {
                display: none !important;
            }
            
            /* Dark theme support */
            .dark .gtranslate_wrapper select {
                background: #1e293b !important;
                border-color: #334155 !important;
                color: #e2e8f0 !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
            }
            
            .dark .gtranslate_wrapper select:hover {
                border-color: #60a5fa !important;
                box-shadow: 0 2px 8px rgba(96, 165, 250, 0.2) !important;
                background: #334155 !important;
            }
            
            .dark .gtranslate_wrapper select:focus {
                border-color: #60a5fa !important;
                box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.15) !important;
                background: #334155 !important;
            }
            
            .dark .gtranslate_wrapper option {
                background: #1e293b !important;
                color: #e2e8f0 !important;
            }
            
            .dark .gtranslate_wrapper option:hover {
                background: #334155 !important;
                color: #f1f5f9 !important;
            }
            
            .dark .gtranslate_wrapper option:checked {
                background: #60a5fa !important;
                color: #0f172a !important;
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .gtranslate_wrapper select {
                    min-width: 100px !important;
                    max-width: 120px !important;
                    padding: 6px 10px !important;
                    padding-right: 28px !important;
                    font-size: 13px !important;
                }
            }
            
            @media (max-width: 640px) {
                .gtranslate_wrapper select {
                    min-width: 80px !important;
                    max-width: 100px !important;
                    padding: 5px 8px !important;
                    padding-right: 24px !important;
                    font-size: 12px !important;
                }
            }
            
            /* Ensure proper positioning and no overlap */
            .gtranslate_wrapper {
                position: relative !important;
                z-index: 1000 !important;
            }
            
            /* Hide any GTranslate popup or menu that might appear */
            .goog-te-menu-frame,
            .goog-te-banner-frame {
                display: none !important;
            }
            
            /* Ensure body doesn't get shifted */
            body {
                top: 0 !important;
            }
            
            /* Smooth animations */
            .gtranslate_wrapper select {
                animation: fadeIn 0.2s ease-out !important;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-2px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            // Cleanup function
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        };
    }, [])
  return (
    <div className='flex items-center justify-between 
    gap-4 p-4 sticky top-0 z-[50] bg-bgsecondary 
    md:bg-bgprimary border-b-[1px] border-b-slate-700'>
        <Logo onlyLogo className='md:hidden'/>

        <div className='hidden sm:flex items-center 
        bg-bgprimary px-4 rounded-full md:bg-bgsecondary'>
            <input 
            type="text"
            placeholder='Search here...'
            className='bg-transparent h-10 outline-none
            border-none w-full text-sm'
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            />
            <Search className={`transition-all ${focus ? 
                'text-white':'text-gray-500'}`}/>
        </div>

        <div className='flex justify-end items-center gap-5 ml-auto'>
            {/* Settings Toggle */}
            <div className='relative' ref={settingsRef}>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className='flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500 bg-transparent hover:bg-blue-500/10 transition-all duration-200'
                >
                    <Settings className='w-4 h-4 text-blue-500' />
                    <span className='text-blue-500 text-sm font-medium'>Settings</span>
                </button>
                
                {/* Settings Dropdown */}
                {showSettings && (
                    <div className='absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
                        <div className='p-4'>
                            <h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-4'>Settings</h3>
                            
                            {/* Theme Section */}
                            <div className='mb-4'>
                                <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2'>Theme</label>
                                <button
                                    onClick={toggleTheme}
                                    className='flex items-center gap-2 px-3 py-2 w-full text-left bg-transparent border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                >
                                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                                        {theme === 'light' ? 'Dark' : 'Light'}
                                    </span>
                                </button>
                            </div>

                            {/* Text Size Section */}
                            <div className='mb-4'>
                                <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2'>Text Size</label>
                                <div className='flex gap-1'>
                                    {[
                                        { value: 'small', label: 'T Small' },
                                        { value: 'medium', label: 'T Medium' },
                                        { value: 'large', label: 'T Large' }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setTextSize(option.value as any)}
                                            className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                                textSize === option.value
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Type Section */}
                            <div className='mb-4'>
                                <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2'>Font Type</label>
                                <div className='flex gap-1'>
                                    {[
                                        { value: 'default', label: 'Default' },
                                        { value: 'dyslexic', label: 'Dyslexic' }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setFontType(option.value as any)}
                                            className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                                fontType === option.value
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contrast Section */}
                            <div className='mb-4'>
                                <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2'>Contrast</label>
                                <button
                                    onClick={() => setContrastMode(contrastMode === 'normal' ? 'high' : 'normal')}
                                    className='flex items-center gap-2 px-3 py-2 w-full text-left bg-transparent border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                >
                                    <Eye size={16} />
                                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                                        {contrastMode === 'normal' ? 'Normal' : 'High Contrast'}
                                    </span>
                                </button>
                            </div>

                            {/* Reset Button */}
                            <div className='pt-2 border-t border-gray-200 dark:border-gray-700'>
                                <button
                                    onClick={resetToDefaults}
                                    className='flex items-center gap-2 px-3 py-2 w-full text-left bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
                                >
                                    <RotateCcw size={16} />
                                    <span className='text-sm font-medium'>Reset</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* GTranslate Widget */}
            <div className="gtranslate_wrapper"></div>
            
            <SignedIn>
            <UserButton />
            </SignedIn>
            <SignedOut>
                <div className='flex items-center gap-3'>
                    <Link to={'/sign-in'} className='bg-bgsecondary 
                    py-2 px-4 rounded-md text-sm cursor-pointer'>Sign In</Link>
                    <Link to={'/sign-up'} className='bg-primary py-2 px-4 
                    rounded-md text-sm cursor-pointer'>Register</Link>
                </div>
            </SignedOut>
            <div
            className='flex items-center justify-center size-10 
            bg-bgsecondary cursor-pointer rounded-md md:hidden' 
            onClick={onMenuClick}>
                <Menu/>
            </div>
        </div>
    </div>
  )
}

export default Navbar