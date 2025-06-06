interface ApprovalInfo {
  date: string;
  handler: string;
  message: string;
}

const PurchaseApprovalInfo = ({
  approvalInfo,
}: {
  approvalInfo: ApprovalInfo;
}) => {
  return (
    <div className='bg-white shadow-md rounded-lg p-4'>
      <h2 className='text-lg font-bold'>승인 정보</h2>
      <p className='text-sm text-gray-500'>{approvalInfo.date}</p>
      <div className='mt-2'>
        <p className='text-sm text-gray-700'>담당자</p>
        <p className='border p-2 rounded-md'>{approvalInfo.handler}</p>
      </div>
      <div className='mt-2'>
        <p className='text-sm text-gray-700'>승인 메시지</p>
        <p className='border p-2 rounded-md'>{approvalInfo.message}</p>
      </div>
    </div>
  );
};

export default PurchaseApprovalInfo;
