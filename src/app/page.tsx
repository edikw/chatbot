
'use client'

import { useRouter } from 'next/navigation'

function Home() {
  const router = useRouter()
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className=''>
        <div>
          <h1 className='font-bold mb-6'>Silahkan Pilih Mode yang diinginkan</h1>
          <button className='btn rounded-full w-full mb-2' onClick={() => router.push('/chat')}>
            Mode Chat
          </button>
          <button className='btn rounded-full w-full' onClick={() => router.push('/completion')}>
            Mode Completion
          </button>
        </div>
      </div >

    </div>
  );
}

export default Home;
