import { redirect } from 'next/navigation';

export default function LandingPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-3xl mb-8">This is the landing page</h1>
      <div className="flex space-x-4">
        <button onClick={() => redirect('/players')} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 text-xl font-bold">
          All Players
        </button>
        <button onClick={() => redirect('/auction')} className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition duration-300 text-xl font-bold">
          Auction
        </button>
        <button onClick={() => redirect('/rules')} className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition duration-300 text-xl font-bold">
          Rules
        </button>
      </div>
    </div>
  );
}
