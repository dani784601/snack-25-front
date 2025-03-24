'use client';

import { ChevronDown } from 'lucide-react';
import { Tsort } from '@/app/productList/page';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown-Menu';
import { useProvider } from './ProductProvider';

const sortOption: Record<Tsort, string> = {
  'createdAt:desc': '최신 순',
  'createdAt:asc': '오래된 순',
  'price:asc': '낮은 가격 순',
  'price:desc': '높은 가격 순',
};

export function SortDropDown() {
  const { sort, setSort } = useProvider();
  const updateSort = (value: Tsort) => {
    setSort(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className='flex justify-between items-center gap-4'
      >
        <Button
          variant='outline'
          className='group text-gray-500 flex justify-around font-normal select-none bg-white w-[136px] h-[50px] max-lt:w-[87px] max-lt:h-9 border-1 border-gray-200 cursor-pointer'
        >
          <span className='lt:text-2lg max-lt:text-md'>{sortOption[sort]}</span>
          <ChevronDown className='transition-transform duration-200 group-data-[state=open]:rotate-180' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-full'>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {Object.entries(sortOption).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => updateSort(key as Tsort)}
              className='w-full'
            >
              <span className='text-gray-500 lt:text-2lg max-lt:text-md'>
                {label}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
