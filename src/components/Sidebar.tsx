import { Home, Video, X, Brain, MessageCircle, BarChart3, Palette, Menu, CalendarPlus } from "lucide-react";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";
import generateUniqueId from "generate-unique-id";
// import { Path } from "leaflet";
import './Sidebar.css';

interface ISidebar{
    open:boolean;
    onClose:any;
    collapsed?:boolean;
    toggleCollapse?:()=>void;
}
const routes = [
    {
        path: '/',
        label:'Home',
        icon:Home,
        activePaths:['/']
    },
    // {
    //     path: '/dashboard/profile',
    //     label:'Profile',
    //     icon:User,
    //     activePaths:['/dashboard/profile']
    // },
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        activePaths:['/dashboard']
    },
    {
        path: '/dashboard/SoulStation',
        label: 'Resource Hub',
        icon: Brain,
        activePaths:['/dashboard/SoulStation']
    },
    {
        path: '/dashboard/appointments',
        label: 'Appointments',
        icon: CalendarPlus,
        activePaths: ['/dashboard/appointments', '/dashboard/book-appointment', '/dashboard/my-appointments']
    },
    {
        path: `/dashboard/golive?roomID=${generateUniqueId({ length: 6 })}&role=Host`,
        label: 'Go Live',
        icon: Video,
        activePaths: [`/dashboard/golive?roomID=${generateUniqueId({ length: 6 })}&role=Host`]
    },

    {
        path: `/dashboard/chat`,
        label: 'CopeMate',
        icon: MessageCircle,
        activePaths: [`/dashboard/chat`]
    },
    {
        path: `/dashboard/whiteboard`,
        label: 'Whiteboard',
        icon: Palette,
        activePaths: [`/dashboard/whiteboard`]
    },
]
const Sidebar = ({open, onClose, collapsed, toggleCollapse}:ISidebar) => {
    const {pathname} = useLocation()
  return (
    <div className={`sidebar__container h-screen fixed bg-bgsecondary ${collapsed ? 'w-[70px]' : 'w-[250px]'} 
    top-0 z-[200] p-4 pr-0 transition-all duration-300 
    left-[-320px] md:left-0 ${open ? 'left-[0px]':''}`}>
        <div className="flex justify-between items-center">
          <Logo collapsed={collapsed}/>
                    <button 
                        onClick={toggleCollapse}
                        className="hidden md:flex items-center justify-center w-8 h-8 transition-all"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={22} />
                    </button>
        </div>
        <div onClick={onClose} 
        className='absolute top-4 right-4 size-10 bg-bgprimary text-gray-500 
        flex items-center justify-center rounded-full cursor-pointer 
        hover:text-black transition-all duration-500 md:hidden '>
            <X/>
        </div>
       <div className='pt-8'>
        {
            routes.map((route,index)=>(
                <Link
                to={route.path}
                key={index}
                className={`flex items-center gap-1 cursor-pointer px-5 py-3
                    rounded-[51px] rounded-tr-none rounded-br-none text-text
                    text-gray-500 transition-all hover:text-primary hover:bg-primary/10
                    ${route.activePaths?.includes(pathname) 
                    ? 'bg-primary/10 text-primary border-l-4 border-primary active':'text-gray-500'}`}>
                    <route.icon size={20} className="min-w-[20px]" />
                    {!collapsed && <span className="ml-2">{route.label}</span>}
                </Link>
            ))
        }
       </div>
        </div>
  )
}

export default Sidebar