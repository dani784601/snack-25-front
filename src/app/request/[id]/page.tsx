'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import router from 'next/router';

import StatusModal from '../components/StatusModal';

interface OrderItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface OrderDetail {
  id: string;
  date: string;
  items: OrderItem[];
  requester: string;
  handler: string;
  totalAmount: number;
  requestDate: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface BudgetInfo {
  monthlyLimit: number;
  remaining: number;
}

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = useParams();
  console.log('id 원본:', id);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [budget, setBudget] = useState<BudgetInfo>({
    monthlyLimit: 1500000,
    remaining: 200000,
  });
  const [modalType, setModalType] = useState<'approved' | 'rejected' | null>(
    null,
  );

  const totalCost = order
    ? order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : 0;

  const remainingAfterPurchase = budget.remaining - totalCost;
  const isOverBudget = remainingAfterPurchase < 0;

  useEffect(() => {
    console.log('params id:', id); // 여긴 무조건 실행됨
    if (!id) {
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/order-requests/${id}`,
          {
            credentials: 'include',
          },
        );

        if (!res.ok) {
          console.error('API 응답 오류:', res.status, res.statusText);
          throw new Error('데이터 불러오기 실패');
        }

        const data = await res.json();
        console.log('✅ 상세 응답 전체:', data);

        const transformed: OrderDetail = {
          id: data.requestId,
          date: data.requestedAt?.slice(0, 10) ?? '-',
          requestDate: data.requestedAt?.slice(0, 10) ?? '-',
          requester: data.requesterName ?? '-',
          handler: data.resolverName ?? '-',
          message: data.items?.[0]?.requestMessage ?? '',
          totalAmount: data.totalAmount,
          status: data.status,
          items: Array.isArray(data.items)
            ? data.items.map((item: any) => ({
                id: item.id ?? '',
                name: item.productName ?? '상품명 없음', // ✅ 여기!
                category: item.categoryName ?? '기타',
                quantity: item.quantity ?? 0,
                price: item.price ?? 0,
                imageUrl: item.imageUrl ?? '/images/default.png',
              }))
            : [],
        };

        setOrder(transformed);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
    };

    fetchOrderDetail();
  }, [id]);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const companyId = user.companyId;

        if (!companyId) {
          console.warn('❗ companyId 없음');
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/budgets/inquiry`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyId }),
          },
        );

        if (!res.ok) {
          throw new Error('예산 조회 실패');
        }

        const data = await res.json();
        console.log('✅ 예산 데이터:', data);

        setBudget({
          monthlyLimit: data.data.monthlyLimit ?? 0,
          remaining: data.data.currentAmount ?? 0,
        });
      } catch (err) {
        console.error('예산 불러오기 에러:', err);
      }
    };

    fetchBudget();
  }, []);
  const handleApprove = async () => {
    if (!order) {
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order-requests/${id}/accept`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminNotes: '승인합니다.',
          }),
        },
      );
      if (!res.ok) {
        throw new Error('승인 실패');
      }

      setModalType('approved');
    } catch (err) {
      console.error('승인 에러:', err);
    }
  };

  const handleReject = async () => {
    if (!order) {
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order-requests/${id}/reject`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminNotes: '사유 부족으로 반려합니다.',
          }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        console.error('반려 실패 - 상태코드:', res.status);
        console.error('반려 실패 - 응답 메시지:', text);
        console.log(order.id);
        throw new Error('반려 실패');
      }
      setModalType('rejected');
    } catch (err) {
      console.error('반려 에러:', err);
    }
  };

  const totalItemCost =
    order?.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    ) || 0;

  // 배송비는 총합에서 상품 금액을 뺀 값, 음수 방지용
  const shippingFee = Math.max(0, (order?.totalAmount || 0) - totalItemCost);

  return (
    <div className='w-full min-h-screen bg-[#FBF8F4] px-4 pt-10 pb-10'>
      {/* 💻 데스크탑 전용 */}
      <div className='hidden lg:flex px-16'>
        {/* 왼쪽 품목 목록 */}
        <div className='w-2/3 pr-8'>
          <h1 className='text-3xl font-bold'>구매 요청 상세</h1>
  
          <div className='mt-6 bg-white rounded-md p-6 border-2'>
            <h2 className='text-xl font-bold mb-4'>요청 품목</h2>
  
            <div className='border rounded-md max-h-[400px] overflow-y-auto'>
              {order?.items.map((item, index) => (
                <div
                  key={index}
                  className='flex justify-between items-center p-4 border-b last:border-none'
                >
                  <div className='flex items-center gap-4'>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className='w-14 h-14 rounded-md'
                    />
                    <div>
                      <p className='text-sm text-gray-500'>{item.category}</p>
                      <p className='text-lg font-semibold'>{item.name}</p>
                      <p className='text-sm font-semibold'>
                        수량: {item.quantity}개
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <p>{item.price.toLocaleString()}원</p>
                    <p className='text-lg font-semibold'>
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* 배송비 표기 */}
          <div className='flex justify-end mt-4 text-base text-gray-500'>
            배송비: {shippingFee.toLocaleString()}원
          </div>
  
          <div className='flex justify-end items-end mt-6 text-xl font-bold text-[#E67E22]'>
            <span className='text-black'>총 {order?.items.length}건</span>
            <span className='ml-2'>{order?.totalAmount.toLocaleString()} 원</span>
            <span className='ml-2 text-sm text-gray-500 font-normal'>
              배송비포함
            </span>
          </div>
  
          {/* 하단 승인/반려 버튼 */}
          <div className='mt-6 flex justify-center gap-4'>
            <button
              className={`px-6 py-3 rounded-lg font-semibold w-[509px] h-[62px] transition-transform duration-200 ${
                !order || order.status !== 'PENDING'
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-600 hover:scale-105'
              }`}
              disabled={!order || order.status !== 'PENDING'}
              onClick={handleReject}
            >
              요청 반려
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-semibold w-[509px] h-[62px] transition-transform duration-200 ${
                !order || order.status !== 'PENDING' || isOverBudget
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:scale-105'
              }`}
              disabled={!order || order.status !== 'PENDING' || isOverBudget}
              onClick={handleApprove}
            >
              요청 승인
            </button>
          </div>
        </div>
  
        {/* 오른쪽 요청 정보 + 예산 */}
        <div className='w-1/3 px-16 pt-10 pb-10'>
          {/* 요청 정보 */}
          <div className='bg-#FBF8F4 rounded-md p-6'>
            <h2 className='text-xl font-bold border-b-2 border-black-100'>
              요청 정보
            </h2>
            <p className='text-xl text-gray-400 mt-2'>{order?.requestDate}</p>
  
            <div className='mt-2'>
              <label className='block text-xl font-semibold text-black-400'>
                요청인
              </label>
              <input
                type='text'
                value={order?.requester ?? ''}
                readOnly
                className='mt-1 w-full rounded-md border-2 text-lg pl-[24px] pt-[14px] pb-[18px] pr-[24px] text-gray-500'
              />
            </div>
  
            <div className='mt-4'>
              <label className='block text-xl font-semibold text-black-400'>
                요청 메시지
              </label>
              <textarea
                value={order?.message || '요청 메시지가 없습니다.'}
                readOnly
                rows={2}
                className='mt-1 w-full rounded-md border-2 text-21g resize-none pl-[24px] pt-[14px] pb-[18px] pr-[24px] text-gray-500'
              />
            </div>
          </div>
  
          {/* 예산 정보 */}
          <div className='bg-#FBF8F4 rounded-md p-6 mt-6'>
            <h2 className='text-xl font-bold border-b-2 border-black-100'>
              예산 정보
            </h2>
  
            <div className='mt-4 space-y-4'>
              <div>
                <label className='block font-semibold text-black-400 text-xl'>
                  이번 달 지원예산
                </label>
                <input
                  value={budget.monthlyLimit.toLocaleString() + '원'}
                  readOnly
                  className='mt-1 w-full rounded-md border-2 px-4 py-3 text-gray-500'
                />
              </div>
  
              <div>
                <label className='block font-semibold text-black-400 text-xl'>
                  이번 달 남은 예산
                </label>
                <input
                  value={budget.remaining.toLocaleString() + '원'}
                  readOnly
                  className={`mt-1 w-full rounded-md border-2 px-4 py-3 ${
                    isOverBudget ? 'border-red-500' : 'border-gray-200'
                  } text-gray-500`}
                />
                {isOverBudget && (
                  <p className='text-red-500 text-sm mt-1'>
                    구매 금액이 남은 예산을 초과했습니다.
                  </p>
                )}
              </div>
  
              <div>
                <label className='block font-semibold text-black-400 text-xl'>
                  구매 후 예산
                </label>
                <input
                  value={remainingAfterPurchase.toLocaleString() + '원'}
                  readOnly
                  className='mt-1 w-full rounded-md border-2 px-4 py-3 text-gray-500'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* 📱 모바일/타블렛 전용 */}
      <div className='flex flex-col gap-6 lg:hidden'>
        {/* 요청 정보 */}
        <div>
          <h2 className='text-xl font-bold border-b-2 border-black-100'>요청 정보</h2>
          <p className='mt-2 text-gray-500'>{order?.requestDate}</p>
          <label className='block mt-4 text-lg font-semibold'>요청인</label>
          <input
            readOnly
            value={order?.requester}
            className='w-full border px-4 py-3 rounded-md text-gray-500'
          />
          <label className='block mt-4 text-lg font-semibold'>요청 메시지</label>
          <textarea
            readOnly
            value={order?.message || '요청 메시지가 없습니다.'}
            className='w-full border px-4 py-3 rounded-md resize-none text-gray-500'
            rows={3}
          />
        </div>
  
        {/* 예산 정보 */}
        <div>
          <h2 className='text-xl font-bold border-b-2 border-black-100'>예산 정보</h2>
          <div className='mt-4 space-y-4'>
            <div>
              <label className='block font-semibold text-lg'>이번 달 지원예산</label>
              <input
                value={budget.monthlyLimit.toLocaleString() + '원'}
                readOnly
                className='w-full border px-4 py-3 rounded-md text-gray-500'
              />
            </div>
            <div>
              <label className='block font-semibold text-lg'>이번 달 남은 예산</label>
              <input
                value={budget.remaining.toLocaleString() + '원'}
                readOnly
                className={`w-full border px-4 py-3 rounded-md text-gray-500 ${
                  isOverBudget ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {isOverBudget && (
                <p className='text-red-500 text-sm mt-1'>
                  구매 금액이 남은 예산을 초과했습니다.
                </p>
              )}
            </div>
            <div>
              <label className='block font-semibold text-lg'>구매 후 예산</label>
              <input
                value={remainingAfterPurchase.toLocaleString() + '원'}
                readOnly
                className='w-full border px-4 py-3 rounded-md text-gray-500'
              />
            </div>
          </div>
        </div>
  
        {/* 요청 품목 */}
        <div>
          <h2 className='text-xl font-bold border-b'>요청 품목</h2>
          <div className='border rounded-md bg-white'>
            {order?.items.map((item, index) => (
              <div
                key={index}
                className='flex justify-between items-center p-4 border-b last:border-none'
              >
                <div className='flex gap-4'>
                  <img
                    src={item.imageUrl || '/images/default-product.png'}
                    alt='상품이미지'
                    className='w-14 h-14 rounded-md'
                  />
                  <div>
                    <p className='text-sm text-gray-500'>{item.category}</p>
                    <p className='font-semibold'>{item.name}</p>
                    <p className='text-sm'>수량: {item.quantity}개</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p>{item.price.toLocaleString()}원</p>
                  <p className='font-semibold'>
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className='text-right text-sm text-gray-500 mt-2'>
            배송비: {shippingFee.toLocaleString()}원
          </div>
          <div className='flex justify-end mt-3 font-bold text-[#E67E22]'>
            총 {order?.items.length}건 {order?.totalAmount.toLocaleString()}원{' '}
            <span className='text-sm text-gray-500 ml-2 font-normal'>배송비 포함</span>
          </div>
        </div>
  
        {/* 버튼 */}
        <div className='flex gap-4'>
          <button
            className={`flex-1 h-[48px] rounded-lg font-bold text-white transition-transform duration-200 ${
              !order || order.status !== 'PENDING'
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
            disabled={!order || order.status !== 'PENDING'}
            onClick={handleReject}
          >
            요청 반려
          </button>
          <button
            className={`flex-1 h-[48px] rounded-lg font-bold text-white transition-transform duration-200 ${
              !order || order.status !== 'PENDING' || isOverBudget
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
            disabled={!order || order.status !== 'PENDING' || isOverBudget}
            onClick={handleApprove}
          >
            요청 승인
          </button>
        </div>
      </div>
    </div>
  );
}
  
  export default OrderDetailPage;
