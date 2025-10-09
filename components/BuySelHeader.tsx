'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Home, User, ListPlus, Search, Briefcase, Settings } from 'lucide-react'

export default function BuySelHeader() {
  return (
    <header className="bg-gradient-to-r from-orange-50 via-white to-orange-50 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center group">
            <div className="relative h-24 w-24 mr-3 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="BuySel Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
           
          </Link>
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/buyer/search" className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-orange-50">
              <Search className="w-4 h-4" />
              <span><u>Buy</u></span>
            </Link>
            <Link href="/seller/dashboard" className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-orange-50">
              <Home className="w-4 h-4" />
              <span><u>Sell</u></span>
            </Link>
            <Link href="#how-it-works" className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-orange-50">
              <Briefcase className="w-4 h-4" />
              <span><u>How it Works</u></span>
            </Link>
            <Link href="#contact" className="text-[#333333] hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-orange-50">
              <u>Contact</u>
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link 
              href="/auth/signin" 
              className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] px-4 py-2.5 rounded-lg transition-all font-medium border border-gray-300 hover:border-[#FF6600] hover:bg-orange-50"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link 
              href="/seller/list-property" 
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF6600] to-[#FF5500] text-white px-5 py-2.5 rounded-lg hover:from-[#FF5500] hover:to-[#FF4400] transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <ListPlus className="w-4 h-4" />
              <span>List Property</span>
            </Link>
            <div className="relative">
              <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-700 pointer-events-none" />
              <select 
                onChange={(e) => {
                  if (e.target.value === 'conveyancer') {
                    window.location.href = '/conveyancer/queue'
                  } else if (e.target.value === 'admin') {
                    window.location.href = '/admin/dashboard'
                  }
                }}
                className="pl-10 pr-4 py-2.5 bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 font-medium cursor-pointer hover:from-red-200 hover:to-red-300 transition-all appearance-none"
              >
                <option value="buyer-seller">Buyer/Seller</option>
                <option value="conveyancer">Conveyancer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div> 
        </div>
      </div>
    </header>
  )
}