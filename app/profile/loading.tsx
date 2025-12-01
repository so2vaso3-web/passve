export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-light py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 animate-pulse">
              <div className="w-24 h-24 bg-gray-light rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-light rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-light rounded w-1/2 mx-auto mb-6"></div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-card p-6 animate-pulse">
              <div className="h-8 bg-gray-light rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-light rounded"></div>
                <div className="h-20 bg-gray-light rounded"></div>
                <div className="h-20 bg-gray-light rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



