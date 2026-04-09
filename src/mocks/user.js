export const MOCK_USER = {
  id: 1,
  email: 'user@example.com',
  name: '홍길동',
  phone: '010-1234-5678',
  role: 'USER',
  provider: 'local',
  createdAt: '2024-01-15T09:00:00Z',
  addresses: [
    {
      id: 1,
      label: '집',
      recipient: '홍길동',
      phone: '010-1234-5678',
      zipCode: '06234',
      address: '서울특별시 강남구 테헤란로 123',
      detailAddress: '101동 202호',
      isDefault: true,
    },
    {
      id: 2,
      label: '회사',
      recipient: '홍길동',
      phone: '010-1234-5678',
      zipCode: '03722',
      address: '서울특별시 서대문구 충정로 60',
      detailAddress: '5층 개발팀',
      isDefault: false,
    },
  ],
}

// Mock 로그인 시 사용되는 비밀번호 (실제 환경에서는 서버에서 검증)
export const MOCK_PASSWORD = 'password'
