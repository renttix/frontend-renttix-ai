import Link from 'next/link'
import React from 'react'
import { IoArrowBackOutline } from 'react-icons/io5'

const GoPrevious = ({route}) => {
  return (
    <div>
         <Link href={route}>
         <i
              className="pi pi-arrow-left t mb-4 bg-primary dark:bg-slate-500 px-4 py-2 rounded-md text-white dark:text-dark"
              
            />
                  </Link>
    </div>
  )
}

export default GoPrevious