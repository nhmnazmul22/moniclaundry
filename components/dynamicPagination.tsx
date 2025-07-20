"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AppDispatch } from "@/store";
import { setCurrentItem } from "@/store/paginationSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type DynamicPaginationType = {
  data: any[];
  itemsPage?: number;
};

const DynamicPagination: React.FC<DynamicPaginationType> = ({
  data,
  itemsPage,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = itemsPage || 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data?.length / itemsPerPage);

  useEffect(() => {
    dispatch(setCurrentItem(currentItems));
  }, [data, dispatch, currentPage]);

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage((prev) => Math.max(prev - 1, 1));
            }}
          />
        </PaginationItem>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .reduce((acc: (number | "...")[], page, index, arr) => {
            if (index === 0 || page === arr[index - 1] + 1) {
              acc.push(page);
            } else {
              acc.push("...");
              acc.push(page);
            }
            return acc;
          }, [])
          .map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage((prev) => Math.min(prev + 1, totalPages));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DynamicPagination;
