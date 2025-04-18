import { CartHeaderProps } from '@/types/cart';

const CartHeader = ({ selectAll, handleSelectAll }: CartHeaderProps) => {
  return (
    <div className='flex w-full h-[80px] border-b border-[#C4C4C4] items-center px-4 lg:px-6 font-semibold text-sm bg-[#FFFDF9]'>
      <input
        type='checkbox'
        className='mr-2 lg:mr-4'
        checked={selectAll}
        onChange={handleSelectAll}
      />
      <span className='lg:hidden text-sm text-[#1F1F1F]'>전체선택</span>
      <div className='hidden lg:flex flex-row justify-between w-full text-center'>
        <div className='w-[594px]'>상품정보</div>
        <div className='flex flex-row justify-between flex-1'>
          <div className='w-[200px]'>수량</div>
          <div className='w-[200px]'>주문 금액</div>
          <div className='w-[200px]'>배송 정보</div>
        </div>
      </div>
    </div>
  );
};

export default CartHeader;
