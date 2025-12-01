"use client";

export function MaintenanceMode() {

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-dark-card border border-dark-border rounded-2xl p-8 md:p-12 text-center shadow-card">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-black text-dark-text mb-4">
          Website đang bảo trì
        </h1>
        <p className="text-lg text-dark-text2 mb-6 leading-relaxed">
          Chúng tôi đang thực hiện bảo trì hệ thống để cải thiện trải nghiệm của bạn.
          <br />
          Vui lòng quay lại sau.
        </p>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-400">
            ⏰ Thời gian dự kiến: Sẽ hoàn tất trong thời gian sớm nhất
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:support@passvephim.vn"
            className="px-6 py-3 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold transition-all hover:shadow-neon-sm"
          >
            Liên hệ hỗ trợ
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-dark-bg border-2 border-dark-border hover:border-neon-green text-dark-text hover:text-neon-green rounded-xl font-semibold transition-all"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    </div>
  );
}

