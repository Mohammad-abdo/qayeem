import { useCallback } from 'react'
import toast from 'react-hot-toast'

export const useConfirm = () => {
  const confirm = useCallback((message, onConfirm, onCancel = null) => {
    const toastId = toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-2 border-red-200`}
          dir="rtl"
        >
          <div className="flex-1 w-0 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-base font-semibold text-black-900 mb-4">{message}</p>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                    onClick={() => {
                      toast.dismiss(toastId)
                      if (onCancel) onCancel()
                    }}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    onClick={() => {
                      toast.dismiss(toastId)
                      if (onConfirm) onConfirm()
                    }}
                  >
                    تأكيد
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
      }
    )
  }, [])

  return { confirm }
}

