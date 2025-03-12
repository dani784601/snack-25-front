'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768; // 화면 크기 기준값 정의

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string | string[];
  userEmail?: string;
  children?: React.ReactNode; // 모달 내부에 들어갈 커스텀 내용 (React 노드)
  confirmText?: string; // 확인 버튼의 텍스트 (기본값: "확인")
  cancelText?: string; // 취소 버튼의 텍스트 (기본값: "닫기")
  onConfirm?: () => void;
  imageSrc?: string;
}

const Modal = ({
  open,
  onClose,
  title,
  description,
  userEmail,
  children,
  confirmText = '확인',
  cancelText = '닫기',
  onConfirm,
  imageSrc,
}: ModalProps) => {
  const [currentImage, setCurrentImage] = useState(imageSrc);

  // 화면 크기에 따라 이미지 변경
  useEffect(() => {
    const handleResize = () => {
      if (!imageSrc) return; // imageSrc가 없을 경우 처리 방지

      const isSmallScreen = window.innerWidth <= MOBILE_BREAKPOINT; // 현재 화면 크기 확인

      setCurrentImage(
        isSmallScreen
          ? imageSrc.includes('-md.svg') // 작은 화면이면 '-md.svg' → '-sm.svg' 변경
            ? imageSrc.replace('-md.svg', '-sm.svg')
            : imageSrc
          : imageSrc.includes('-sm.svg') // 큰 화면이면 '-sm.svg' → '-md.svg' 변경
            ? imageSrc.replace('-sm.svg', '-md.svg')
            : imageSrc,
      );
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행

    return () => window.removeEventListener('resize', handleResize);
  }, [imageSrc]);

  const finalDescription =
    userEmail && typeof description === 'string'
      ? description.replace('{userEmail}', userEmail) // e.g. '김스낵(sn@codeit.com)' ->'김스낵(sn@codeit.com)님의 계정을 탈퇴시킬까요?',
      : description; // 기존 값 유지

  const normalizedDescription = Array.isArray(finalDescription)
    ? finalDescription
    : [finalDescription]; // 항상 배열로 변환하여 처리 <- HTML 중첩 오류 방지

  // 모달이 닫힌 상태면 렌더링하지 않음
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      {/* Mobile First:모바일 크기 기본, 화면이 md(MOBILE_BREAKPOINT 이상)일 때 데스크톱 크기 (704px x 528px)로 확대 */}
      <DialogContent
        className='
          modal-container bg-[#FBF8F4] shadow-lg rounded-2xl 
          flex flex-col justify-between items-center 
          w-[375px] h-[484px] md:w-[704px] md:h-[528px]'
      >
        <div className='w-full flex flex-col items-center justify-between h-full'>
          {/* 이미지 (반응형 크기 조절) */}
          {currentImage && (
            <img
              src={currentImage}
              alt='경고 아이콘'
              className='w-[180px] h-[160px] md:w-[230px] md:h-[200px]'
            />
          )}

          <DialogHeader className='flex flex-col items-center'>
            {/* title - 기본:text-xl (20px) 큰화면:text-2xl (24px) */}
            {title && (
              <DialogTitle className='text-xl font-bold text-center md:text-2xl'>
                {title}
              </DialogTitle>
            )}

            {/* 설명 - 기본:text-sm (14px) 큰화면:md:text-base (16px) */}
            {finalDescription && (
              <DialogDescription className='text-sm text-center md:text-base max-w-full whitespace-normal'>
                {normalizedDescription.map((line, index) =>
                  typeof line === 'string' ? (
                    <span
                      key={index}
                      className='block'
                    >
                      {line}
                    </span>
                  ) : null,
                )}{' '}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* 추후 커스텀 내용 확장 가능 - 현재 사용 안함 */}
          {children}

          {/* 버튼 영역 */}
          <div className='flex flex-col w-full gap-4 md:flex-row md:justify-center md:w-full md:max-w-[640px]'>
            <Button
              className='w-full h-[54px] md:w-[310px] md:h-[64px] bg-[#FFF1E6] text-orange-500 py-3 rounded-lg font-semibold'
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              className='w-full h-[54px] md:w-[310px] md:h-[64px] bg-orange-500 text-white py-3 rounded-lg font-semibold'
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
