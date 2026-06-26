import React from 'react'
import { NavLink } from 'react-router-dom'
import { Search } from 'lucide-react';
import Aside from '../../components/Aside.js';


function Dashboard() {

  return (
    <>
      <section className="w-full min-h-screen flex">
        <Aside />
        <header className='h-dvh w-full bg-amber-100'>
          <div className='mt-3 flex justify-between'>
            <form className='ml-3'>
              <div className='flex relative w-xs'>
                <input type="search" name="" id="" placeholder='Search here' className='border-2 p-2 rounded-2xl w-xs' />
                <Search size={19} className='absolute right-3 top-3' />
              </div>
            </form>
            <div className='mr-10 mt-1'>
              <img src="" alt="" className='w-10 h-10 rounded-full border-2' />
            </div>
          </div>
        </header>
      </section>
    </>
  );
}

export default Dashboard