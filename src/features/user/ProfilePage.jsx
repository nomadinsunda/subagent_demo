import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateProfileMutation,
} from './usersApi'
import Spinner from '../../shared/components/Spinner'
import { MAX_ADDRESSES } from '../../shared/utils/constants'

const EMPTY_ADDRESS = {
  label: '',
  recipient: '',
  phone: '',
  zipCode: '',
  address: '',
  detailAddress: '',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: addresses = [], isLoading } = useGetAddressesQuery()
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation()
  const [deleteAddress] = useDeleteAddressMutation()
  const [setDefault] = useSetDefaultAddressMutation()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [showProfileForm, setShowProfileForm] = useState(false)

  const handleAddAddress = async (e) => {
    e.preventDefault()
    await addAddress(addressForm)
    setAddressForm(EMPTY_ADDRESS)
    setShowAddressForm(false)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    await updateProfile(profileForm)
    setShowProfileForm(false)
  }

  if (isLoading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">프로필</h1>

      {/* 사용자 정보 */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">기본 정보</h2>
            <button className="btn btn-ghost btn-xs" onClick={() => setShowProfileForm(!showProfileForm)}>
              {showProfileForm ? '취소' : '수정'}
            </button>
          </div>

          {showProfileForm ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <label className="form-control">
                <div className="label"><span className="label-text text-xs">이름</span></div>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label className="form-control">
                <div className="label"><span className="label-text text-xs">연락처</span></div>
                <input
                  type="tel"
                  className="input input-bordered input-sm"
                  placeholder="010-0000-0000"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </label>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isUpdating}>저장</button>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                ['이름', user?.name],
                ['이메일', user?.email],
                ['연락처', user?.phone || '-'],
                ['가입 경로', user?.provider === 'local' ? '이메일' : user?.provider],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-base-content/50 w-20 shrink-0">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 배송지 관리 */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">배송지 ({addresses.length}/{MAX_ADDRESSES})</h2>
            {addresses.length < MAX_ADDRESSES && (
              <button className="btn btn-outline btn-xs" onClick={() => setShowAddressForm(!showAddressForm)}>
                {showAddressForm ? '취소' : '+ 추가'}
              </button>
            )}
          </div>

          {/* 배송지 추가 폼 */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-base-200 rounded-xl p-4 space-y-2">
              {[
                { key: 'label', label: '배송지 별칭', placeholder: '집, 회사 등' },
                { key: 'recipient', label: '수령인', placeholder: '홍길동' },
                { key: 'phone', label: '연락처', placeholder: '010-0000-0000' },
                { key: 'zipCode', label: '우편번호', placeholder: '06234' },
                { key: 'address', label: '기본주소', placeholder: '서울특별시 강남구...' },
                { key: 'detailAddress', label: '상세주소', placeholder: '101동 202호' },
              ].map(({ key, label, placeholder }) => (
                <label key={key} className="form-control">
                  <div className="label py-0"><span className="label-text text-xs">{label}</span></div>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    placeholder={placeholder}
                    value={addressForm[key]}
                    onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                    required={key !== 'detailAddress'}
                  />
                </label>
              ))}
              <button type="submit" className="btn btn-primary btn-sm w-full mt-2" disabled={isAdding}>
                배송지 저장
              </button>
            </form>
          )}

          {/* 배송지 목록 */}
          {addresses.length === 0 ? (
            <p className="text-sm text-base-content/50 text-center py-4">등록된 배송지가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="flex items-start gap-3 p-3 rounded-lg bg-base-200">
                  <div className="flex-1 text-sm space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{addr.label}</span>
                      {addr.isDefault && <span className="badge badge-primary badge-xs">기본</span>}
                    </div>
                    <p className="text-base-content/70">{addr.recipient} · {addr.phone}</p>
                    <p className="text-base-content/60 text-xs">[{addr.zipCode}] {addr.address} {addr.detailAddress}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!addr.isDefault && (
                      <button className="btn btn-ghost btn-xs" onClick={() => setDefault(addr.id)}>기본 설정</button>
                    )}
                    <button className="btn btn-ghost btn-xs text-error" onClick={() => deleteAddress(addr.id)}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
