'use client';
import Image from 'next/image';

import { IProducts } from '@/app/productList/ProductList';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

type cardProps = {
  data: IProducts;
};

export default function ProductCard({ data }: cardProps) {
  const { name, price, description, categoryId, imageUrl, totalSold } = data;

  return (
    <>
      <Card className='relative w-full bg-background-400 shadow-none border-none py-0 lt:gap-6 max-lt:gap-4'>
        <CardHeader className='bg-white w-auto aspect-square flex items-center justify-center rounded-2xl hover:shadow-xl'>
          <div className='relative w-1/2 h-1/2 aspect-square'>
            <Image
              src={imageUrl || '/img/gnb/gnb-logo-primary.svg'}
              fill
              sizes='(max-width: 745px) 45vw, (max-width: 1920px) 25vw'
              alt={name ?? '상품 이미지'}
              className='object-contain'
              loading='lazy'
            />
          </div>
        </CardHeader>
        <CardContent className='w-auto p-0'>
          <div className='flex items-center justify-between max-tb:justify-start'>
            <p className='max-tb:hidden font-normal text-gray-500 text-[1vw]'>
              {categoryId}
            </p>
            <p className='text-primary-400 bg-illustration-02 px-2 py-1 w-auto lt:text-lg max-lt:text-xs font-semibold'>
              {totalSold ?? 1}회 구매
            </p>
          </div>
          <h1 className='font-semibold lt:text-xl max-lt:text-md pb-4 line-clamp-1'>
            {name ?? '상품명'}
          </h1>
          <p className='lt:text-3xl max-lt:text-xl font-bold text-black-400'>
            {price.toLocaleString() ?? 1}원
          </p>
        </CardContent>
      </Card>
    </>
  );
}
