import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Rightbar from './Rightbar'
interface IWrapper{
    children: React.ReactNode,
    enableRightbar?: boolean,
}
const Wrapper = ({
    children, 
    enableRightbar,
}:IWrapper) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [openSidebar, setOpenSidebar] = useState(false)
  return (
    <>
        <Sidebar open={openSidebar} onClose={()=>setOpenSidebar(false)} collapsed={sidebarCollapsed} toggleCollapse={()=>setSidebarCollapsed(!sidebarCollapsed)}/>
            <main className={`pl-0 ${sidebarCollapsed ? 'md:pl-[80px]' : 'md:pl-[300px]'} transition-all duration-300 ${enableRightbar ? 
                "min-[1150px]:pr-[300px]":''}`}>
            <Navbar onMenuClick={()=>setOpenSidebar(!openSidebar)}/>    
            <div className='p-4'>
                {children}
            </div>
            {
                enableRightbar && <Rightbar/>
            }
        </main>
    </>
  ) 
}

export default Wrapper