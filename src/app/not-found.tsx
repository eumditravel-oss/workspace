import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          요청하신 페이지가 삭제되었거나, 잘못된 경로입니다.
          <br />
          아래 버튼을 눌러 메인 화면으로 돌아가주세요.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-md hover:shadow-blue-200 active:scale-95"
        >
          <Home className="w-5 h-5" />
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
