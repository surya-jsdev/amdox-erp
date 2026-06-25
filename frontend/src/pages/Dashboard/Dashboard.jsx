import React from 'react'
import { NavLink } from 'react-router-dom'
import { Search } from 'lucide-react';
import Aside from '../../components/Aside';


function Dashboard() {

  return (
    <>
      <section className="w-full min-h-screen flex">
        <Aside />
        <header className='h-dvh w-full bg-amber-100'>
          <form className='m-4'>
            <div className='flex relative w-xs'>
              <input type="search" name="" id="" placeholder='Search here' className='border-2 p-2 rounded-2xl w-xs' />
              <Search size={19} className='absolute right-3 top-3' />
            </div>
          </form>
        </header>
      </section>
    </>
  );
}

export default Dashboard