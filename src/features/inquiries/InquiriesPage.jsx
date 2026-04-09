import { useState } from 'react'
import {
  useGetMyInquiriesQuery,
  useCreateInquiryMutation,
  useDeleteInquiryMutation,
} from './inquiriesApi'
import Spinner from '../../shared/components/Spinner'
import ErrorState from '../../shared/components/ErrorState'
import Toast from '../../shared/components/Toast'
import { useToast } from '../../shared/hooks/useToast'
import { formatDate } from '../../shared/utils/formatters'
import { INQUIRY_TYPE_LABEL } from '../../shared/utils/constants'

const EMPTY_FORM = { type: 'etc', title: '', content: '', isSecret: false }

export default function InquiriesPage() {
  const { data: inquiries = [], isLoading, isError, refetch } = useGetMyInquiriesQuery()
  const [createInquiry, { isLoading: isSubmitting }] = useCreateInquiryMutation()
  const [deleteInquiry] = useDeleteInquiryMutation()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [openId, setOpenId] = useState(null)
  const { toasts, toast } = useToast()

  const validate = () => {
    const errors = {}
    if (form.title.length < 5) errors.title = '제목을 5자 이상 입력해주세요'
    if (form.content.length < 10) errors.content = '내용을 10자 이상 입력해주세요'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    const result = await createInquiry(form)
    if (result.error) {
      toast('문의 등록에 실패했습니다. 다시 시도해 주세요.', 'error')
    } else {
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast('문의가 등록되었습니다', 'success')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('문의를 삭제하시겠습니까?')) return
    const result = await deleteInquiry(id)
    if (result.error) {
      toast('문의 삭제에 실패했습니다', 'error')
    } else {
      if (openId === id) setOpenId(null)
    }
  }

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toast toasts={toasts} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">문의 내역</h1>
        <button className="btn btn-primary btn-sm" onClick={() => {
          setShowForm(!showForm)
          setFormErrors({})
        }}>
          {showForm ? '취소' : '+ 문의하기'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card bg-base-200 p-5 space-y-3">
          <h2 className="font-bold">새 문의 작성</h2>
          <select
            className="select select-bordered select-sm w-full max-w-xs"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            {Object.entries(INQUIRY_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <div>
            <input
              type="text"
              className={`input input-bordered input-sm w-full ${formErrors.title ? 'input-error' : ''}`}
              placeholder="제목을 입력하세요 (5자 이상, 최대 100자)"
              value={form.title}
              maxLength={100}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }))
                if (formErrors.title) setFormErrors((fe) => ({ ...fe, title: '' }))
              }}
              required
            />
            {formErrors.title && <p className="text-error text-xs mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <textarea
              className={`textarea textarea-bordered w-full ${formErrors.content ? 'textarea-error' : ''}`}
              placeholder="문의 내용을 입력하세요 (10자 이상, 최대 1,000자)"
              rows={5}
              maxLength={1000}
              value={form.content}
              onChange={(e) => {
                setForm((f) => ({ ...f, content: e.target.value }))
                if (formErrors.content) setFormErrors((fe) => ({ ...fe, content: '' }))
              }}
              required
            />
            {formErrors.content && <p className="text-error text-xs mt-1">{formErrors.content}</p>}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={form.isSecret}
              onChange={(e) => setForm((f) => ({ ...f, isSecret: e.target.checked }))}
            />
            <span className="text-sm">비밀 문의로 등록</span>
          </label>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : '문의 등록'}
          </button>
        </form>
      )}

      {inquiries.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <p className="text-5xl mb-4">💬</p>
          <p>등록한 문의가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-4 gap-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setOpenId(openId === inquiry.id ? null : inquiry.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="badge badge-outline badge-xs shrink-0">
                      {INQUIRY_TYPE_LABEL[inquiry.type]}
                    </span>
                    <span className={`badge badge-xs shrink-0 ${inquiry.status === 'answered' ? 'badge-success' : 'badge-warning'}`}>
                      {inquiry.status === 'answered' ? '답변 완료' : '답변 대기'}
                    </span>
                    <span className="text-sm font-medium truncate">{inquiry.title}</span>
                  </div>
                  <span className="text-xs text-base-content/40 shrink-0 ml-2">{formatDate(inquiry.createdAt)}</span>
                </div>

                {openId === inquiry.id && (
                  <div className="space-y-3 border-t pt-3">
                    <p className="text-sm leading-relaxed text-base-content/80">{inquiry.content}</p>

                    {inquiry.answer && (
                      <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-3">
                        <p className="text-xs font-bold text-primary mb-1">
                          {inquiry.answer.adminName} · {formatDate(inquiry.answer.answeredAt)}
                        </p>
                        <p className="text-sm">{inquiry.answer.content}</p>
                      </div>
                    )}

                    {inquiry.status === 'pending' && (
                      <div className="flex justify-end">
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleDelete(inquiry.id)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
