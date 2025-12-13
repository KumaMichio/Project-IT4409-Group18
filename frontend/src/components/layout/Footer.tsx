"use client";

export default function Footer() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <footer className="px-6 md:px-16 lg:px-24 xl:px-32 w-full text-sm text-slate-500 bg-white pt-10 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <a href="/" className="inline-block">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-[#00ADEF] rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">LearnHub</span>
                            </div>
                        </a>
                        <p className="text-sm/7 mt-6">
                            LearnHub là nền tảng học trực tuyến hàng đầu với hàng ngàn khóa học chất lượng cao. 
                            Học từ các chuyên gia trong ngành và nâng cao kỹ năng của bạn ngay hôm nay.
                        </p>
                    </div>
                    
                    <div className="flex flex-col lg:items-center lg:justify-center">
                        <div className="flex flex-col text-sm space-y-2.5">
                            <h2 className="font-semibold mb-5 text-gray-800">Công ty</h2>
                            <a className="hover:text-[#00ADEF] transition" href="/about">Về chúng tôi</a>
                            <a className="hover:text-[#00ADEF] transition" href="/instructors">
                                Giảng viên
                                <span className="text-xs text-white bg-[#00ADEF] rounded-md ml-2 px-2 py-1">Đang tuyển!</span>
                            </a>
                            <a className="hover:text-[#00ADEF] transition" href="/contact">Liên hệ</a>
                            <a className="hover:text-[#00ADEF] transition" href="/privacy">Chính sách bảo mật</a>
                            <a className="hover:text-[#00ADEF] transition" href="/terms">Điều khoản sử dụng</a>
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="font-semibold text-gray-800 mb-5">Đăng ký nhận tin</h2>
                        <div className="text-sm space-y-6 max-w-sm">
                            <p>Nhận thông tin về khóa học mới, ưu đãi đặc biệt và các bài viết hữu ích qua email mỗi tuần.</p>
                            <div className="flex items-center justify-center gap-2 p-2 rounded-md bg-[#00ADEF]/10">
                                <input 
                                    className="focus:ring-2 bg-white ring-[#00ADEF] outline-none w-full max-w-64 py-2 rounded px-2" 
                                    type="email" 
                                    placeholder="Nhập email của bạn" 
                                />
                                <button className="bg-[#00ADEF] hover:bg-[#0096d6] transition px-4 py-2 text-white rounded whitespace-nowrap">
                                    Đăng ký
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="py-6 mt-10 border-t border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-center md:text-left">
                            Copyright © 2025 <a href="/" className="text-[#00ADEF] hover:underline">LearnHub</a>. All Rights Reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-slate-500 hover:text-[#00ADEF] transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-slate-500 hover:text-[#00ADEF] transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-slate-500 hover:text-[#00ADEF] transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
