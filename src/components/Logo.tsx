// import { Tractor } from 'lucide-react'
import {BrainCircuit} from 'lucide-react'

interface ILogo{
    className?:string;
    onlyLogo?:boolean;
    collapsed?:boolean;
}

const Logo = ({className,onlyLogo,collapsed}:ILogo) => {
  return (
    <div className={`flex items-center gap-2 
    text-3xl text-white font-bold ${className ? className:''}`}>
        <BrainCircuit className='size-7 text-primary logo-icon' style={{color: '#2563eb'}}/>
        {!onlyLogo && !collapsed && <h1><span className='text-black'>Soul</span></h1>}
    </div>
  )
}

export default Logo